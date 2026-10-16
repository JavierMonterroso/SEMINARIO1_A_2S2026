import asyncio
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect

POLL_INTERVAL_SECONDS = 1
UNAUTHORIZED_CLOSE_CODE = 4401


# Canal de solo recepcion del chat. Los mensajes se guardan en RDS por la API REST y cada
# instancia los detecta consultando la tabla, asi llegan aunque los amigos esten
# conectados a instancias EC2 distintas detras del balanceador.
# uvicorn envia un ping cada 20 s, lo que evita que el ALB cierre la conexion por inactividad.
class ChatGateway:
    def __init__(self, verify_token, messages):
        self.verify_token = verify_token
        self.messages = messages
        self.connections_by_user = {}
        self.last_message_id = 0
        self.poll_task = None

    async def start(self):
        self.last_message_id = await asyncio.to_thread(self.messages.latest_id)
        self.poll_task = asyncio.create_task(self.poll_forever())

    async def stop(self):
        if self.poll_task:
            self.poll_task.cancel()

    async def accept(self, websocket: WebSocket):
        await websocket.accept()
        user_id = self.authenticate(websocket.query_params.get("token"))
        if not user_id:
            await websocket.close(code=UNAUTHORIZED_CLOSE_CODE, reason="Token invalido")
            return
        self.register(user_id, websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            pass
        finally:
            self.unregister(user_id, websocket)

    def authenticate(self, token):
        try:
            return self.verify_token(token or "")["id"]
        except Exception:
            return None

    def register(self, user_id, websocket):
        self.connections_by_user.setdefault(user_id, set()).add(websocket)

    def unregister(self, user_id, websocket):
        sockets = self.connections_by_user.get(user_id, set())
        sockets.discard(websocket)
        if not sockets:
            self.connections_by_user.pop(user_id, None)

    async def poll_forever(self):
        while True:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            await self.poll()

    async def poll(self):
        try:
            new_messages = await asyncio.to_thread(self.messages.newer_than, self.last_message_id)
        except Exception as error:
            logging.error("No se pudieron consultar los mensajes nuevos: %s", type(error).__name__)
            return
        for message in new_messages:
            await self.deliver(message)
        if new_messages:
            self.last_message_id = new_messages[-1]["id"]

    async def deliver(self, message):
        payload = json.dumps({"type": "message", "message": message})
        for user_id in {message["senderId"], message["receiverId"]}:
            for websocket in list(self.connections_by_user.get(user_id, ())):
                try:
                    await websocket.send_text(payload)
                except Exception:
                    self.unregister(user_id, websocket)
