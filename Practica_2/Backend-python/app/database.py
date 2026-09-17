from psycopg2 import pool
from threading import Lock
from psycopg2.extras import RealDictCursor
from . import config

# Use un pool de conexiones para que las solicitudes concurrentes no abran una conexion nueva cada vez.
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


def get_connection():
    initialize()
    return connection_pool.getconn()


def release_connection(conn):
    # Restablecer tambien las transacciones que fallaron antes de reutilizar la conexion.
    if not conn.closed:
        conn.rollback()
    connection_pool.putconn(conn)


def close():
    global connection_pool
    if connection_pool is not None:
        connection_pool.closeall()
        connection_pool = None


def execute(sql, params, many=False):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql, params)
            result = cursor.fetchall() if many else cursor.fetchone()
            conn.commit()
            return result
    finally:
        release_connection(conn)
