from psycopg.rows import dict_row

from app.database import get_connection


def get_all_movies():
    query = """
        SELECT
            id_pelicula,
            titulo,
            director,
            anio_estreno,
            url_contenido,
            poster,
            estado
        FROM pelicula
        ORDER BY id_pelicula;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query)
            return cursor.fetchall()


def get_movie_by_id(id_pelicula: int):
    query = """
        SELECT
            id_pelicula,
            titulo,
            director,
            anio_estreno,
            url_contenido,
            poster,
            estado
        FROM pelicula
        WHERE id_pelicula = %s;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, (id_pelicula,))
            return cursor.fetchone()