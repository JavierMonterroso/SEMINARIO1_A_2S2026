from .. import serialize
from ..database import fetch_all, fetch_one

CONVERSATION_LIMIT = 200
POLL_BATCH_LIMIT = 500


def conversation(user_id, friend_id):
    rows = fetch_all(
        f"""SELECT * FROM (
              SELECT * FROM messages
              WHERE LEAST(sender_id, receiver_id) = LEAST(%(user_id)s, %(friend_id)s)
                AND GREATEST(sender_id, receiver_id) = GREATEST(%(user_id)s, %(friend_id)s)
              ORDER BY id DESC
              LIMIT {CONVERSATION_LIMIT}
            ) recent
            ORDER BY id""",
        {"user_id": user_id, "friend_id": friend_id},
    )
    return [serialize.message(row) for row in rows]


def create(sender_id, receiver_id, content):
    row = fetch_one(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s) RETURNING *",
        (sender_id, receiver_id, content),
    )
    return serialize.message(row)


def latest_id():
    return fetch_one("SELECT COALESCE(MAX(id), 0) AS id FROM messages")["id"]


def newer_than(last_id):
    rows = fetch_all(f"SELECT * FROM messages WHERE id > %s ORDER BY id LIMIT {POLL_BATCH_LIMIT}", (last_id,))
    return [serialize.message(row) for row in rows]
