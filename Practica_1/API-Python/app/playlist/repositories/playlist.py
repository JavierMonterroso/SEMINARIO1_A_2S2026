from psycopg.rows import dict_row

from app.database import get_connection


def get_playlist_item(id_usuario: int, id_pelicula: int):
    query = """
        SELECT
            id_lista,
            id_usuario,
            id_pelicula,
            fecha_agregado
        FROM lista_reproduccion
        WHERE id_usuario = %s
          AND id_pelicula = %s;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                query,
                (
                    id_usuario,
                    id_pelicula
                )
            )

            return cursor.fetchone()


def add_movie_to_playlist(id_usuario: int, id_pelicula: int):
    query = """
        INSERT INTO lista_reproduccion (
            id_usuario,
            id_pelicula
        )
        VALUES (%s, %s)
        RETURNING
            id_lista,
            id_usuario,
            id_pelicula,
            fecha_agregado;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                query,
                (
                    id_usuario,
                    id_pelicula
                )
            )

            return cursor.fetchone()


def get_user_playlist(id_usuario: int):
    query = """
        SELECT
            lr.id_lista,
            lr.id_usuario,
            lr.id_pelicula,
            p.titulo,
            p.director,
            p.anio_estreno,
            p.url_contenido,
            p.poster,
            p.estado,
            lr.fecha_agregado
        FROM lista_reproduccion AS lr
        INNER JOIN pelicula AS p
            ON lr.id_pelicula = p.id_pelicula
        WHERE lr.id_usuario = %s
        ORDER BY lr.fecha_agregado DESC;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                query,
                (id_usuario,)
            )

            return cursor.fetchall()


def delete_movie_from_playlist(
    id_usuario: int,
    id_pelicula: int
):
    query = """
        DELETE FROM lista_reproduccion
        WHERE id_usuario = %s
          AND id_pelicula = %s
        RETURNING
            id_lista,
            id_usuario,
            id_pelicula,
            fecha_agregado;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                query,
                (
                    id_usuario,
                    id_pelicula
                )
            )

            return cursor.fetchone()