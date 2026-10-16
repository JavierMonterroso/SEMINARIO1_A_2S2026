from botocore.exceptions import ClientError
from .. import config
from ..aws import cognito
from ..errors import ApiError

INVALID_CREDENTIALS = "Usuario o contraseña incorrectos"

# Traduce las excepciones de Cognito a respuestas HTTP con mensajes para el usuario.
COGNITO_ERRORS = {
    "UsernameExistsException": (409, "El correo ya está registrado"),
    "InvalidPasswordException": (400, "La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos"),
    "CodeMismatchException": (400, "El código de verificación es incorrecto"),
    "ExpiredCodeException": (400, "El código de verificación expiró, solicita uno nuevo"),
    "NotAuthorizedException": (401, INVALID_CREDENTIALS),
    "UserNotFoundException": (401, INVALID_CREDENTIALS),
    "UserNotConfirmedException": (403, "Debes verificar tu correo antes de iniciar sesión", "USER_NOT_CONFIRMED"),
    "LimitExceededException": (429, "Demasiados intentos, espera unos minutos"),
    "TooManyRequestsException": (429, "Demasiados intentos, espera unos minutos"),
    "InvalidParameterException": (400, "Cognito rechazó los datos enviados"),
}


def call(operation, **params):
    try:
        return getattr(cognito, operation)(**params)
    except ClientError as error:
        known = COGNITO_ERRORS.get(error.response["Error"]["Code"])
        if known:
            raise ApiError(*known)
        raise


def profile_attributes(profile):
    return [
        {"Name": "name", "Value": profile["full_name"]},
        {"Name": "custom:dpi", "Value": profile["dpi"]},
    ]


def sign_up(user):
    result = call(
        "sign_up",
        ClientId=config.COGNITO_CLIENT_ID,
        Username=user["email"],
        Password=user["password"],
        UserAttributes=[{"Name": "email", "Value": user["email"]}, *profile_attributes(user)],
    )
    return result["UserSub"]


def confirm_sign_up(email, code):
    call("confirm_sign_up", ClientId=config.COGNITO_CLIENT_ID, Username=email, ConfirmationCode=code)


def resend_code(email):
    call("resend_confirmation_code", ClientId=config.COGNITO_CLIENT_ID, Username=email)


def authenticate(email, password):
    result = call(
        "initiate_auth",
        ClientId=config.COGNITO_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={"USERNAME": email, "PASSWORD": password},
    )
    if "AuthenticationResult" not in result:
        raise ApiError(401, INVALID_CREDENTIALS)


def is_confirmed(email):
    user = call("admin_get_user", UserPoolId=config.COGNITO_USER_POOL_ID, Username=email)
    return user["UserStatus"] == "CONFIRMED"


def update_profile(email, profile):
    call(
        "admin_update_user_attributes",
        UserPoolId=config.COGNITO_USER_POOL_ID,
        Username=email,
        UserAttributes=profile_attributes(profile),
    )


def delete_user(email):
    call("admin_delete_user", UserPoolId=config.COGNITO_USER_POOL_ID, Username=email)
