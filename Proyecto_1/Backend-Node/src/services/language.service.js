const { TranslateTextCommand } = require('@aws-sdk/client-translate');
const { DetectDominantLanguageCommand } = require('@aws-sdk/client-comprehend');
const { getSynthesizeSpeechUrl } = require('@aws-sdk/polly-request-presigner');
const aws = require('../config/aws');

const DEFAULT_LANGUAGE = 'es';
const SPEECH_URL_SECONDS = 300;
const VOICE_BY_LANGUAGE = { es: 'Lupe', en: 'Joanna', fr: 'Lea', pt: 'Camila' };

async function translate(text, targetLanguage) {
  const result = await aws.translate.send(new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: 'auto',
    TargetLanguageCode: targetLanguage,
  }));
  return {
    translatedText: result.TranslatedText,
    sourceLanguage: result.SourceLanguageCode,
    targetLanguage: result.TargetLanguageCode,
  };
}

async function detectLanguage(text) {
  const result = await aws.comprehend.send(new DetectDominantLanguageCommand({ Text: text }));
  const detected = result.Languages[0]?.LanguageCode;
  return VOICE_BY_LANGUAGE[detected] ? detected : DEFAULT_LANGUAGE;
}

// El backend no descarga el audio: devuelve una URL prefirmada hacia Polly para <audio src>.
async function speechUrl(text, language) {
  const voiceLanguage = language || await detectLanguage(text);
  return getSynthesizeSpeechUrl({
    client: aws.polly,
    params: { Text: text, OutputFormat: 'mp3', VoiceId: VOICE_BY_LANGUAGE[voiceLanguage] },
    options: { expiresIn: SPEECH_URL_SECONDS },
  });
}

module.exports = { translate, speechUrl };
