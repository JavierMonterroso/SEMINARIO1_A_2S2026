from .. import config
from ..aws import lex

FALLBACK_ANSWER = "No entendí tu pregunta. Puedes consultarme horarios, ubicación, carreras, asignación de cursos o contacto de la facultad."


def ask(user_id, message):
    result = lex.recognize_text(
        botId=config.LEX_BOT_ID,
        botAliasId=config.LEX_BOT_ALIAS_ID,
        localeId=config.LEX_LOCALE_ID,
        # Una sesion por usuario para que Lex conserve el contexto de la conversacion.
        sessionId=f"user-{user_id}",
        text=message,
    )
    answers = [item["content"] for item in result.get("messages", []) if item.get("content")]
    return answers or [FALLBACK_ANSWER]
