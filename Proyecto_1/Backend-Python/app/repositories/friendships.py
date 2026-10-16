from ..database import fetch_all, fetch_one, execute

SAME_PAIR = """LEAST(f.requester_id, f.addressee_id) = LEAST(u.id, %(user_id)s)
  AND GREATEST(f.requester_id, f.addressee_id) = GREATEST(u.id, %(user_id)s)"""


# Usuarios que no son amigos, con el estado de la solicitud pendiente si existe.
def suggestions(user_id):
    return fetch_all(
        f"""SELECT u.id, u.full_name, u.photo_key, f.id AS request_id,
                   CASE WHEN f.id IS NULL THEN 'NONE'
                        WHEN f.requester_id = %(user_id)s THEN 'SENT'
                        ELSE 'RECEIVED' END AS request_status
            FROM users u
            LEFT JOIN friendships f ON {SAME_PAIR}
            WHERE u.id <> %(user_id)s AND (f.id IS NULL OR f.status = 'PENDING')
            ORDER BY u.full_name""",
        {"user_id": user_id},
    )


def friends(user_id):
    return fetch_all(
        """SELECT u.id, u.full_name, u.photo_key
           FROM friends fr
           JOIN users u ON u.id = fr.friend_id
           WHERE fr.user_id = %s
           ORDER BY u.full_name""",
        (user_id,),
    )


def pending_requests(user_id):
    return fetch_all(
        """SELECT f.id AS request_id, f.created_at, u.id, u.full_name, u.photo_key
           FROM friendships f
           JOIN users u ON u.id = f.requester_id
           WHERE f.addressee_id = %s AND f.status = 'PENDING'
           ORDER BY f.created_at DESC""",
        (user_id,),
    )


def create_request(requester_id, addressee_id):
    row = fetch_one(
        "INSERT INTO friendships (requester_id, addressee_id) VALUES (%s, %s) RETURNING id",
        (requester_id, addressee_id),
    )
    return row["id"]


def accept(request_id, addressee_id):
    updated = execute(
        """UPDATE friendships SET status = 'ACCEPTED', responded_at = NOW()
           WHERE id = %s AND addressee_id = %s AND status = 'PENDING'""",
        (request_id, addressee_id),
    )
    return updated > 0


def reject(request_id, addressee_id):
    deleted = execute(
        "DELETE FROM friendships WHERE id = %s AND addressee_id = %s AND status = 'PENDING'",
        (request_id, addressee_id),
    )
    return deleted > 0


def are_friends(user_id, other_user_id):
    return fetch_one("SELECT 1 FROM friends WHERE user_id = %s AND friend_id = %s", (user_id, other_user_id)) is not None
