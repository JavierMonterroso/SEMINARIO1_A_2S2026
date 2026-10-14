from datetime import datetime, timedelta, timezone

# Lambda de cumplimiento (fulfillment) del bot de Lex V2 sobre la Facultad de Ingenieria.
# Runtime: Python 3.12. Cada intent del bot se responde con una funcion de INTENT_HANDLERS.
# Verifiquen y ajusten los datos de FACULTY antes de la calificacion.

GUATEMALA_TIME = timezone(timedelta(hours=-6))

FACULTY = {
    "office_hours": {"days": range(0, 5), "opens": 7, "closes": 19},
    "location": "Ciudad Universitaria, zona 12, Ciudad de Guatemala. Los edificios de la facultad son T-1, T-3, T-4 y T-7.",
    "careers": [
        "Ingeniería Civil",
        "Ingeniería Química",
        "Ingeniería Industrial",
        "Ingeniería Mecánica Eléctrica",
        "Ingeniería Mecánica",
        "Ingeniería Electrónica",
        "Ingeniería Mecánica Industrial",
        "Ingeniería en Ciencias y Sistemas",
        "Ingeniería Ambiental",
    ],
    "enrollment": "La asignación de cursos se realiza en línea desde el portal de la facultad, en las fechas que publica Control Académico al inicio de cada semestre.",
    "contact": "Sitio web: https://portal.ingenieria.usac.edu.gt · Control Académico, edificio T-4, primer nivel.",
}


def lambda_handler(event, context):
    intent_name = event["sessionState"]["intent"]["name"]
    answer = INTENT_HANDLERS.get(intent_name, unknown_intent)
    return close(event, answer())


def office_hours():
    schedule = FACULTY["office_hours"]
    now = datetime.now(GUATEMALA_TIME)
    is_open = now.weekday() in schedule["days"] and schedule["opens"] <= now.hour < schedule["closes"]
    status = "En este momento las oficinas están abiertas." if is_open else "En este momento las oficinas están cerradas."
    return (
        f"Las oficinas administrativas atienden de lunes a viernes de {schedule['opens']}:00 "
        f"a {schedule['closes']}:00. {status}"
    )


def location():
    return FACULTY["location"]


def careers():
    return "La facultad ofrece: " + ", ".join(FACULTY["careers"]) + "."


def enrollment():
    return FACULTY["enrollment"]


def contact():
    return FACULTY["contact"]


def unknown_intent():
    return "Puedo darte información sobre horarios, ubicación, carreras, asignación de cursos y contacto de la facultad."


INTENT_HANDLERS = {
    "HorarioFacultad": office_hours,
    "UbicacionFacultad": location,
    "CarrerasFacultad": careers,
    "InscripcionFacultad": enrollment,
    "ContactoFacultad": contact,
}


def close(event, message):
    intent = event["sessionState"]["intent"]
    intent["state"] = "Fulfilled"
    return {
        "sessionState": {"dialogAction": {"type": "Close"}, "intent": intent},
        "messages": [{"contentType": "PlainText", "content": message}],
    }
