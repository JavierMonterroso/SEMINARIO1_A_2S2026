from contextlib import contextmanager
from threading import Lock
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from . import config

# Un pool de conexiones para que las solicitudes concurrentes no abran una conexion nueva cada vez.
connection_pool = None
_lock = Lock()


def initialize():
    global connection_pool
    with _lock:
        if connection_pool is None:
            connection_pool = pool.ThreadedConnectionPool(
                1, 20, host=config.DB_HOST, port=config.DB_PORT,
                dbname=config.DB_NAME, user=config.DB_USER, password=config.DB_PASSWORD,
                connect_timeout=10,
                # Exige TLS sin requerir un certificado CA instalado manualmente.
                sslmode="require",
            )


def close():
    global connection_pool
    if connection_pool is not None:
        connection_pool.closeall()
        connection_pool = None


@contextmanager
def transaction():
    initialize()
    conn = connection_pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield cursor
        conn.commit()
    finally:
        # Restablecer tambien las transacciones que fallaron antes de reutilizar la conexion.
        if not conn.closed:
            conn.rollback()
        connection_pool.putconn(conn)


def fetch_one(sql, params=None):
    with transaction() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchone()


def fetch_all(sql, params=None):
    with transaction() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchall()


def execute(sql, params=None):
    with transaction() as cursor:
        cursor.execute(sql, params)
        return cursor.rowcount
