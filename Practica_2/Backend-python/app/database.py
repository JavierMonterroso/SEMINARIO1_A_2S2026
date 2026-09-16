from psycopg2 import pool
from . import config

# Use un pool de conexiones para que las solicitudes concurrentes no abran una conexion nueva cada vez.
connection_pool = pool.SimpleConnectionPool(
    1,
    10,
    host=config.DB_HOST,
    port=config.DB_PORT,
    dbname=config.DB_NAME,
    user=config.DB_USER,
    password=config.DB_PASSWORD,
)


def get_connection():
    return connection_pool.getconn()


def release_connection(conn):
    connection_pool.putconn(conn)
