const { RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');
const { lex } = require('../config/aws');
const { config } = require('../config/env');

const FALLBACK_ANSWER = 'No entendí tu pregunta. Puedes consultarme horarios, ubicación, carreras, asignación de cursos o contacto de la facultad.';

async function ask(userId, message) {
  const result = await lex.send(new RecognizeTextCommand({
    botId: config.lex.botId,
    botAliasId: config.lex.botAliasId,
    localeId: config.lex.localeId,
    // Una sesion por usuario para que Lex conserve el contexto de la conversacion.
    sessionId: `user-${userId}`,
    text: message,
  }));
  const answers = (result.messages || []).map((item) => item.content).filter(Boolean);
  return answers.length ? answers : [FALLBACK_ANSWER];
}

module.exports = { ask };
