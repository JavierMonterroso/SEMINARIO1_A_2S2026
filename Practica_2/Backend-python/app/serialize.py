from datetime import timezone


def row(value):
    if value is None:
        return None
    result = dict(value)
    result["created_at"] = value["created_at"].astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    return result
