"""Pruebas de contrato con PostgreSQL temporal local que tenga TLS habilitado.
No se conectan a AWS. Ejecutar con las dependencias del backend Python instaladas.
TEST_PG_PORT=55432 python Tests/test_contract.py
"""
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import select
import subprocess
import sys
import tempfile
import time
import shutil
import unittest
from uuid import uuid4
import psycopg2
from psycopg2 import sql
import httpx
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
IMAGE_URL = 'https://storage.example/profile%20image.png'
SECRET = "test-only-shared-secret-that-is-at-least-32-bytes-long"


class Contracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_name = 'taskflow_contract_' + uuid4().hex
        cls.pg = dict(host='127.0.0.1', port=int(os.getenv('TEST_PG_PORT', '55432')), user=os.getenv('TEST_PG_USER', os.getenv('USER')), sslmode='require')
        admin = psycopg2.connect(dbname='postgres', **cls.pg)
        admin.autocommit = True
        with admin.cursor() as cursor:
            cursor.execute(sql.SQL('CREATE DATABASE {}').format(sql.Identifier(cls.db_name)))
        admin.close()
        cls.addClassCleanup(cls.drop_database)
        cls.connection = psycopg2.connect(dbname=cls.db_name, **cls.pg)
        cls.addClassCleanup(cls.connection.close)
        cls.connection.autocommit = True
        with cls.connection.cursor() as cursor:
            cursor.execute((ROOT / 'Database/schema.sql').read_text())
        settings = {'DB_HOST': cls.pg['host'], 'DB_PORT': str(cls.pg['port']), 'DB_NAME': cls.db_name,
                    'DB_USER': cls.pg['user'], 'DB_PASSWORD': 'test-only-unused-with-local-trust',
                    'JWT_SECRET': SECRET, 'JWT_EXPIRES_IN_HOURS': '24'}
        os.environ.update(settings)
        sys.path.insert(0, str(ROOT / 'Backend-python'))
        from app.main import app
        cls.python = TestClient(app, raise_server_exceptions=False)
        cls.python.__enter__()
        cls.addClassCleanup(cls.python.__exit__, None, None, None)
        cls.node_log = tempfile.TemporaryFile(mode='w+')
        cls.addClassCleanup(cls.node_log.close)
        cls.node_process = subprocess.Popen(['node', str(ROOT / 'Tests/node_test_server.js')],
            stdout=subprocess.PIPE, stderr=cls.node_log, text=True, env=dict(os.environ))
        cls.addClassCleanup(cls.stop_node)
        if not select.select([cls.node_process.stdout], [], [], 15)[0]:
            raise RuntimeError('El backend Node no inicio dentro del tiempo esperado')
        ready = cls.node_process.stdout.readline()
        if not ready:
            cls.node_log.seek(0)
            raise RuntimeError(cls.node_log.read())
        cls.node = httpx.Client(base_url=f"http://127.0.0.1:{json.loads(ready)['port']}", timeout=15)
        cls.addClassCleanup(cls.node.close)
        cls.clients = [cls.node, cls.python]
        cls.users = []
        cls.tokens = []
        for index, client in enumerate(cls.clients):
            username = f'user{index}'
            response = client.post('/api/auth/register', json=cls.registration(username))
            assert response.status_code == 201, response.text
            assert response.json()['user']['profile_image_url'] == IMAGE_URL
            cls.users.append(response.json()['user'])
            # Autenticar en el otro lenguaje comprueba tambien la compatibilidad de bcrypt.
            response = cls.clients[1-index].post('/api/auth/login', json={'username': username, 'password': 'password123'})
            assert response.status_code == 200, response.text
            cls.tokens.append(response.json()['token'])

    @classmethod
    def registration(cls, username='new-user'):
        return dict(username=username, email=username + '@example.com', password='password123', confirmPassword='password123', profileImageUrl=IMAGE_URL)

    @classmethod
    def stop_node(cls):
        if cls.node_process.poll() is None:
            cls.node_process.terminate()
            cls.node_process.wait(timeout=10)
        cls.node_process.stdout.close()

    @classmethod
    def drop_database(cls):
        connection = psycopg2.connect(dbname='postgres', **cls.pg)
        connection.autocommit = True
        with connection.cursor() as cursor:
            cursor.execute(sql.SQL('DROP DATABASE {} WITH (FORCE)').format(sql.Identifier(cls.db_name)))
        connection.close()

    def headers(self, index=0):
        return {'Authorization': 'Bearer ' + self.tokens[index]}

    def same(self, method, path, **kwargs):
        responses = [client.request(method, path, **kwargs) for client in self.clients]
        self.assertEqual(responses[0].status_code, responses[1].status_code, [r.text for r in responses])
        values = [r.json() if r.content else None for r in responses]
        self.assertEqual(values[0], values[1])
        return responses[0]

    def test_health_and_trailing_slash(self):
        response = self.same('GET', '/api/health')
        self.assertEqual(response.json(), {'status': 'ok'})
        for path in ['/api/health/', '/api/tasks/', '/api/files/']:
            self.assertEqual(self.same('GET', path, headers=self.headers()).status_code, 200)
        self.assertEqual(self.node.get('/api/health').headers['X-Backend'], 'node')
        self.assertEqual(self.python.get('/api/health').headers['X-Backend'], 'python')

    def test_passwords_and_tokens_cross_languages(self):
        import jwt
        for index, token in enumerate(self.tokens):
            payload = jwt.decode(token, SECRET, algorithms=['HS256'])
            self.assertEqual(payload['id'], self.users[index]['id'])
            self.assertEqual(payload['exp'] - payload['iat'], 24 * 3600)
            for path in ['/api/tasks', '/api/files']:
                self.assertEqual(self.same('GET', path, headers=self.headers(index)).status_code, 200)
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT profile_image_url FROM users WHERE username IN ('user0', 'user1')")
            self.assertEqual(cursor.fetchall(), [(IMAGE_URL,), (IMAGE_URL,)])
            cursor.execute('SELECT password_hash FROM users ORDER BY id')
            for hashed, in cursor.fetchall():
                self.assertNotEqual(hashed, 'password123')
                self.assertEqual(hashed.split('$')[2], '10')

    def test_registration_and_login_errors(self):
        for body in [{}, {'username': 'x'}, {**self.registration(), 'confirmPassword': 'different'},
                     {**self.registration(), 'email': 'invalid'}, {**self.registration(), 'username': ' '},
                     {**self.registration(), 'password': 'é'*37}, {**self.registration(), 'profileImageUrl': None},
                     *[{**self.registration(), 'profileImageUrl': value} for value in ['', 'javascript:alert(1)', 'data:image/png;base64,eA==', 'https://host/x y', {}, 'https://', 'https://@', 'https://host:invalid/x', 'https://host:99999/x', 'https://user:password@host/x']],
                     {key: value for key, value in self.registration().items() if key != 'profileImageUrl'}]:
            with self.subTest(body=list(body)):
                self.assertEqual(self.same('POST', '/api/auth/register', json=body).status_code, 400)
        self.assertEqual(self.same('POST', '/api/auth/register', json=self.registration('user0')).status_code, 409)
        for body in [{}, {'username': 123, 'password': 'x'}, {'username': 'user0', 'password': ''}]:
            self.assertEqual(self.same('POST', '/api/auth/login', json=body).status_code, 400)
        self.assertEqual(self.same('POST', '/api/auth/login', json={'username':'user0','password':'wrong'}).status_code, 401)

    def test_json_and_content_type_errors(self):
        for raw in ['{', 'null', '[]', '42', '{"x":NaN}']:
            self.assertEqual(self.same('POST', '/api/auth/login', content=raw, headers={'Content-Type':'application/json'}).status_code, 400)
        self.assertEqual(self.same('POST', '/api/auth/login', content='username=x', headers={'Content-Type':'application/x-www-form-urlencoded'}).status_code, 415)
        self.assertEqual(self.same('GET', '/api/missing').status_code, 404)
        self.assertEqual(self.same('POST', '/api/health', json={}).status_code, 404)

    def test_authentication_errors(self):
        import jwt
        bad_tokens = ['bad', jwt.encode({'id':1,'username':'x','exp':1}, SECRET, algorithm='HS256'),
                      jwt.encode({'username':'x','exp':9999999999}, SECRET, algorithm='HS256'),
                      jwt.encode({'id':1,'username':'x','exp':9999999999}, 'wrong-secret-that-is-also-at-least-32-bytes-long', algorithm='HS256')]
        for path in ['/api/tasks', '/api/files']:
            self.assertEqual(self.same('GET', path).status_code, 401)
            self.assertEqual(self.same('GET', path, headers={'Authorization':'Bearer'}).status_code, 401)
            for token in bad_tokens:
                self.assertEqual(self.same('GET', path, headers={'Authorization':'Bearer '+token}).status_code, 401)

    def test_task_crud_and_user_isolation(self):
        for creator in self.clients:
            response = creator.post('/api/tasks', json={'title': '  Tarea <b>"á"</b>  ', 'description': ''}, headers=self.headers())
            self.assertEqual(response.status_code, 201, response.text)
            task = response.json()['task']
            self.assertEqual(task['title'], 'Tarea <b>"á"</b>')
            self.assertEqual(task['description'], '')
            self.assertFalse(task['completed'])
            self.assertRegex(task['created_at'], r'^\d{4}-\d{2}-\d{2}T.*\.\d{3}Z$')
            identifier = task['id']
            listed = self.same('GET', '/api/tasks', headers=self.headers()).json()['tasks']
            self.assertIn(task, listed)
            for body in [{'title':'Actualizada','description':'Texto'}, {'description':None}, {'description':''}]:
                updated = self.same('PUT', f'/api/tasks/{identifier}', json=body, headers=self.headers())
                self.assertEqual(updated.status_code, 200)
                for key, value in body.items():
                    self.assertEqual(updated.json()['task'][key], value)
            for completed in [True, False, True]:
                updated = self.same('PATCH', f'/api/tasks/{identifier}/complete', json={'completed':completed}, headers=self.headers())
                self.assertEqual(updated.json()['task']['completed'], completed)
            self.assertNotIn(identifier, [t['id'] for t in self.same('GET','/api/tasks',headers=self.headers(1)).json()['tasks']])
            for method, path, body in [('PUT',f'/api/tasks/{identifier}',{'title':'Forbidden'}),('PATCH',f'/api/tasks/{identifier}/complete',{'completed':False})]:
                self.assertEqual(self.same(method,path,json=body,headers=self.headers(1)).status_code,404)
            self.assertEqual(self.same('DELETE', f'/api/tasks/{identifier}', headers=self.headers(1)).status_code,404)
            self.assertEqual(creator.delete(f'/api/tasks/{identifier}', headers=self.headers()).status_code,204)
            self.assertEqual(self.same('DELETE',f'/api/tasks/{identifier}',headers=self.headers()).status_code,404)

    def test_task_validation(self):
        for body in [{}, {'title':''}, {'title':' '}, {'title':1}, {'title':'x'*151}, {'title':'x','description':123}, {'title':'x','description':'x'*10001}]:
            self.assertEqual(self.same('POST','/api/tasks',json=body,headers=self.headers()).status_code,400)
        for identifier in ['0','-1','x','1.5','2147483648','01']:
            self.assertEqual(self.same('PUT',f'/api/tasks/{identifier}',json={'title':'x'},headers=self.headers()).status_code,400)
            self.assertEqual(self.same('DELETE',f'/api/tasks/{identifier}',headers=self.headers()).status_code,400)
        for body in [{}, {'completed':'false'}, {'completed':1}, {'completed':None}]:
            self.assertEqual(self.same('PATCH','/api/tasks/999999/complete',json=body,headers=self.headers()).status_code,400)
        self.assertEqual(self.same('PUT','/api/tasks/999999',json={},headers=self.headers()).status_code,400)
        self.assertEqual(self.same('PUT','/api/tasks/999999',json={'title':'x'},headers=self.headers()).status_code,404)

    def test_files_and_user_isolation(self):
        for creator in self.clients:
            for file_type in ['image/png','text/plain']:
                body = {'name':'Archivo <b>á</b>.txt','type':file_type,'url':'https://storage.example/archivo%20con%20espacios'}
                response = creator.post('/api/files',json=body,headers=self.headers())
                self.assertEqual(response.status_code,201,response.text)
                file = response.json()['file']
                self.assertEqual(self.same('GET',f"/api/files/{file['id']}",headers=self.headers()).json(),{'file':file})
                self.assertEqual(self.same('GET',f"/api/files/{file['id']}",headers=self.headers(1)).status_code,404)
                self.assertIn(file,self.same('GET','/api/files',headers=self.headers()).json()['files'])
        for body in [{},{'name':'x','type':'text/plain','url':'javascript:alert(1)'},{'name':'x','type':'invalid','url':'https://storage.example/x'},
                     {'name':'x.pdf','type':'application/pdf','url':'https://storage.example/x'},
                     {'name':'x.bin','type':'application/octet-stream','url':'https://storage.example/x'},
                     {'name':'x.csv','type':'text/plain','url':'https://storage.example/x'}]:
            self.assertEqual(self.same('POST','/api/files',json=body,headers=self.headers()).status_code,400)
        self.assertEqual(self.same('GET','/api/files/x',headers=self.headers()).status_code,400)
        self.assertEqual(self.same('GET','/api/files/999999',headers=self.headers()).status_code,404)

    def test_duplicate_registration_race_and_pool_recovery(self):
        body = self.registration('race-user')
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(lambda client: client.post('/api/auth/register',json=body).status_code,self.clients))
        self.assertEqual(sorted(results),[201,409])
        self.assertEqual(self.same('GET','/api/health').status_code,200)
        with ThreadPoolExecutor(max_workers=8) as executor:
            statuses = list(executor.map(lambda _: self.python.get('/api/tasks',headers=self.headers()).status_code,range(30)))
        self.assertEqual(set(statuses),{200})

    def test_tls_connections(self):
        from app import database
        connection = database.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')
                self.assertTrue(cursor.fetchone()[0])
        finally:
            database.release_connection(connection)
        with self.connection.cursor() as cursor:
            cursor.execute('SELECT ssl FROM pg_stat_ssl JOIN pg_stat_activity USING(pid) WHERE datname=%s', (self.db_name,))
            values = cursor.fetchall()
            self.assertGreaterEqual(len(values),3)
            self.assertTrue(all(value[0] for value in values))

    @unittest.skipUnless(os.getenv('TEST_BROWSER', '1') == '1' and shutil.which('google-chrome'), 'Navegador opcional: Google Chrome, TEST_BROWSER=0 para omitirlo')
    def test_frontend_in_browser(self):
        from websockets.sync.client import connect
        with tempfile.TemporaryDirectory(prefix='taskflow-chrome-') as profile, tempfile.TemporaryFile(mode='w+') as log:
            browser = subprocess.Popen([
                'google-chrome', '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
                '--disable-gpu', '--disable-background-networking', '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', '--remote-debugging-port=0',
                f'--user-data-dir={profile}', '--no-startup-window',
            ], stdout=log, stderr=log)
            try:
                active = Path(profile) / 'DevToolsActivePort'
                for _ in range(150):
                    if active.exists():
                        break
                    time.sleep(0.1)
                self.assertTrue(active.exists(), 'Chrome no habilito su interfaz de pruebas')
                port, endpoint = active.read_text().splitlines()[:2]
                with connect(f'ws://127.0.0.1:{port}{endpoint}', open_timeout=10, close_timeout=5) as socket:
                    sequence = 0
                    def command(method, params=None, session=None):
                        nonlocal sequence
                        sequence += 1
                        request = {'id':sequence,'method':method,'params':params or {}}
                        if session:
                            request['sessionId'] = session
                        socket.send(json.dumps(request))
                        while True:
                            message = json.loads(socket.recv(timeout=45))
                            if message.get('id') == sequence:
                                if 'error' in message:
                                    raise RuntimeError(message['error'])
                                return message.get('result',{})
                    target = command('Target.createTarget', {'url':'about:blank'})['targetId']
                    session = command('Target.attachToTarget', {'targetId':target,'flatten':True})['sessionId']
                    command('Page.enable', session=session)
                    url = str(self.node.base_url).rstrip('/') + '/browser-test.html'
                    command('Page.navigate', {'url':url}, session=session)
                    while True:
                        event = json.loads(socket.recv(timeout=20))
                        if event.get('sessionId') == session and event.get('method') == 'Page.loadEventFired':
                            break
                    expression = """new Promise(resolve => {
                        const end = Date.now() + 30000;
                        const timer = setInterval(() => {
                            const result = document.getElementById('result');
                            if (result?.dataset.status || Date.now() > end) {
                                clearInterval(timer);
                                resolve({status:result?.dataset.status || 'timeout', text:result?.textContent});
                            }
                        }, 50);
                    })"""
                    response = command('Runtime.evaluate', {'expression':expression,'awaitPromise':True,'returnByValue':True}, session=session)
                    self.assertNotIn('exceptionDetails',response,response)
                    result = response['result']['value']
                    self.assertEqual(result['status'],'passed',result['text'])
                    print('Interfaz en Chrome: ' + result['text'].replace('\n', '; '))
            finally:
                browser.terminate()
                try:
                    browser.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    browser.kill()
                    browser.wait(timeout=5)


if __name__ == '__main__':
    unittest.main(verbosity=2)
