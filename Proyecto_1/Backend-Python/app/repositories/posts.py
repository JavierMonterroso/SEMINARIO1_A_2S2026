from .. import serialize
from ..database import fetch_all, fetch_one, transaction

FEED_LIMIT = 100

POST_COLUMNS = """p.id, p.description, p.image_key, p.created_at,
  u.id AS author_id, u.full_name AS author_name, u.photo_key AS author_photo_key"""

# Un usuario ve sus publicaciones y las de sus amigos.
VISIBLE_TO_VIEWER = "(p.user_id = %(viewer_id)s OR p.user_id IN (SELECT friend_id FROM friends WHERE user_id = %(viewer_id)s))"


def has_label(condition):
    return f"""EXISTS (SELECT 1 FROM post_labels pl JOIN labels l ON l.id = pl.label_id
    WHERE pl.post_id = p.id AND {condition})"""


def feed(viewer_id, post_filter):
    rows = fetch_all(
        f"""SELECT {POST_COLUMNS}
            FROM posts p
            JOIN users u ON u.id = p.user_id
            WHERE {VISIBLE_TO_VIEWER}
              AND (%(label)s::text IS NULL OR {has_label("l.name = %(label)s")})
              AND (%(search)s::text IS NULL OR {has_label("l.name ILIKE '%%' || %(search)s || '%%'")})
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT {FEED_LIMIT}""",
        {"viewer_id": viewer_id, **post_filter},
    )
    return with_details(rows)


def find_by_id(post_id):
    rows = fetch_all(f"SELECT {POST_COLUMNS} FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = %s", (post_id,))
    return with_details(rows)[0]


def with_details(post_rows):
    if not post_rows:
        return []
    post_ids = [row["id"] for row in post_rows]
    labels = labels_by_post(post_ids)
    comments = comments_by_post(post_ids)
    return [serialize.post(row, labels.get(row["id"], []), comments.get(row["id"], [])) for row in post_rows]


def labels_by_post(post_ids):
    rows = fetch_all(
        """SELECT pl.post_id, l.name
           FROM post_labels pl JOIN labels l ON l.id = pl.label_id
           WHERE pl.post_id = ANY(%s)
           ORDER BY l.name""",
        (post_ids,),
    )
    return group_by_post(rows, lambda row: row["name"])


def comments_by_post(post_ids):
    rows = fetch_all(
        """SELECT c.id, c.post_id, c.content, c.created_at,
                  u.id AS author_id, u.full_name AS author_name, u.photo_key AS author_photo_key
           FROM comments c JOIN users u ON u.id = c.user_id
           WHERE c.post_id = ANY(%s)
           ORDER BY c.created_at, c.id""",
        (post_ids,),
    )
    return group_by_post(rows, serialize.comment)


def group_by_post(rows, to_item):
    groups = {}
    for row in rows:
        groups.setdefault(row["post_id"], []).append(to_item(row))
    return groups


def visible_labels(viewer_id):
    rows = fetch_all(
        f"""SELECT DISTINCT l.name
            FROM labels l
            JOIN post_labels pl ON pl.label_id = l.id
            JOIN posts p ON p.id = pl.post_id
            WHERE {VISIBLE_TO_VIEWER}
            ORDER BY l.name""",
        {"viewer_id": viewer_id},
    )
    return [row["name"] for row in rows]


def create(post):
    with transaction() as cursor:
        cursor.execute(
            "INSERT INTO posts (user_id, description, image_key) VALUES (%(user_id)s, %(description)s, %(image_key)s) RETURNING id",
            post,
        )
        post_id = cursor.fetchone()["id"]
        cursor.execute(
            """WITH saved_labels AS (
                 INSERT INTO labels (name) SELECT unnest(%(labels)s::text[])
                 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id
               )
               INSERT INTO post_labels (post_id, label_id) SELECT %(post_id)s, id FROM saved_labels""",
            {"post_id": post_id, "labels": post["labels"]},
        )
        return post_id


# Solo inserta si la publicacion es del usuario o de uno de sus amigos.
def create_comment(post_id, viewer_id, content):
    row = fetch_one(
        f"""WITH inserted AS (
              INSERT INTO comments (post_id, user_id, content)
              SELECT p.id, %(viewer_id)s, %(content)s FROM posts p WHERE p.id = %(post_id)s AND {VISIBLE_TO_VIEWER}
              RETURNING *
            )
            SELECT i.id, i.content, i.created_at,
                   u.id AS author_id, u.full_name AS author_name, u.photo_key AS author_photo_key
            FROM inserted i JOIN users u ON u.id = i.user_id""",
        {"post_id": post_id, "viewer_id": viewer_id, "content": content},
    )
    return serialize.comment(row) if row else None
