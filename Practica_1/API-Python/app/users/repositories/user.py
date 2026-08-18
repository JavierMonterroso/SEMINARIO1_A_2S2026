from psycopg.rows import dict_row

from app.database import get_connection


def get_user_by_email(correo: str):
    query = """
        SELECT
            id_usuario,
            correo,
            nombre_completo,
            contrasena,
            foto_perfil
        FROM usuario
        WHERE correo = %s;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, (correo,))
            return cursor.fetchone()


def create_user(
    correo: str,
    nombre_completo: str,
    contrasena: str,
    foto_perfil: str
):
    query = """
        INSERT INTO usuario (
            correo,
            nombre_completo,
            contrasena,
            foto_perfil
        )
        VALUES (%s, %s, %s, %s)
        RETURNING
            id_usuario,
            correo,
            nombre_completo,
            foto_perfil;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                query,
                (
                    correo,
                    nombre_completo,
                    contrasena,
                    foto_perfil
                )
            )

            return cursor.fetchone()


def get_user_by_id(id_usuario: int):
    query = """
        SELECT
            id_usuario,
            correo,
            nombre_completo,
            contrasena,
            foto_perfil
        FROM usuario
        WHERE id_usuario = %s;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, (id_usuario,))
            return cursor.fetchone()


def update_user_profile(
    id_usuario: int,
    nombre_completo: str | None,
    foto_perfil: str | None
):
    query = """
        UPDATE usuario
        SET
            nombre_completo = COALESCE(%s, nombre_completo),
            foto_perfil = COALESCE(%s, foto_perfil)
        WHERE id_usuario = %s
        RETURNING
            id_usuario,
            correo,
            nombre_completo,
            foto_perfil;
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                query,
                (
                    nombre_completo,
                    foto_perfil,
                    id_usuario
                )
            )

            return cursor.fetchone()