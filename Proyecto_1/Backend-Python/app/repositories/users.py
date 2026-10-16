from ..database import fetch_one


def find_by_id(user_id):
    return fetch_one("SELECT * FROM users WHERE id = %s", (user_id,))


def find_by_email(email):
    return fetch_one("SELECT * FROM users WHERE email = %s", (email,))


def is_email_or_dpi_taken(email, dpi):
    return fetch_one("SELECT 1 FROM users WHERE email = %s OR dpi = %s LIMIT 1", (email, dpi)) is not None


def is_dpi_taken_by_another_user(dpi, user_id):
    return fetch_one("SELECT 1 FROM users WHERE dpi = %s AND id <> %s", (dpi, user_id)) is not None


def create(user):
    return fetch_one(
        """INSERT INTO users (cognito_sub, full_name, email, dpi, password_hash, photo_key)
           VALUES (%(cognito_sub)s, %(full_name)s, %(email)s, %(dpi)s, %(password_hash)s, %(photo_key)s)
           RETURNING *""",
        user,
    )


def update_profile(user_id, profile):
    return fetch_one(
        """UPDATE users SET full_name = %(full_name)s, dpi = %(dpi)s, photo_key = %(photo_key)s, updated_at = NOW()
           WHERE id = %(id)s
           RETURNING *""",
        {**profile, "id": user_id},
    )
