from urllib.parse import quote, urlencode
from botocore.auth import SigV4QueryAuth
from botocore.awsrequest import AWSRequest
from .. import aws, config

DEFAULT_LANGUAGE = "es"
SPEECH_URL_SECONDS = 300
VOICE_BY_LANGUAGE = {"es": "Lupe", "en": "Joanna", "fr": "Lea", "pt": "Camila"}


def translate(text, target_language):
    result = aws.translate.translate_text(Text=text, SourceLanguageCode="auto", TargetLanguageCode=target_language)
    return {
        "translatedText": result["TranslatedText"],
        "sourceLanguage": result["SourceLanguageCode"],
        "targetLanguage": result["TargetLanguageCode"],
    }


def detect_language(text):
    languages = aws.comprehend.detect_dominant_language(Text=text)["Languages"]
    detected = languages[0]["LanguageCode"] if languages else None
    return detected if detected in VOICE_BY_LANGUAGE else DEFAULT_LANGUAGE


# El backend no descarga el audio: firma una peticion GET a Polly SynthesizeSpeech
# (igual que getSynthesizeSpeechUrl en Node) y el navegador la usa en <audio src>.
def speech_url(text, language):
    voice_language = language or detect_language(text)
    query = urlencode(
        {"OutputFormat": "mp3", "Text": text, "VoiceId": VOICE_BY_LANGUAGE[voice_language]},
        quote_via=quote,
    )
    request = AWSRequest(method="GET", url=f"https://polly.{config.AWS_REGION}.amazonaws.com/v1/speech?{query}")
    credentials = aws.session.get_credentials().get_frozen_credentials()
    SigV4QueryAuth(credentials, "polly", config.AWS_REGION, expires=SPEECH_URL_SECONDS).add_auth(request)
    return request.url
