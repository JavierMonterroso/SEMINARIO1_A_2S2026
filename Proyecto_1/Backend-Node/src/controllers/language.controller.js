const validation = require('../utils/validation');
const language = require('../services/language.service');
const chatbot = require('../services/chatbot.service');

async function translate(req, res) {
  const { text, targetLanguage } = validation.translation(req.body);
  return res.json(await language.translate(text, targetLanguage));
}

async function speech(req, res) {
  const data = validation.speech(req.body);
  return res.json({ audioUrl: await language.speechUrl(data.text, data.language) });
}

async function askChatbot(req, res) {
  const message = validation.chatbotMessage(req.body);
  return res.json({ messages: await chatbot.ask(req.user.id, message) });
}

module.exports = { translate, speech, askChatbot };
