const {
  SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, InitiateAuthCommand,
  AdminGetUserCommand, AdminUpdateUserAttributesCommand, AdminDeleteUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { cognito } = require('../config/aws');
const { config } = require('../config/env');
const HttpError = require('../utils/http-error');

const INVALID_CREDENTIALS = 'Usuario o contraseña incorrectos';

// Traduce las excepciones de Cognito a respuestas HTTP con mensajes para el usuario.
const COGNITO_ERRORS = {
  UsernameExistsException: [409, 'El correo ya está registrado'],
  InvalidPasswordException: [400, 'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos'],
  CodeMismatchException: [400, 'El código de verificación es incorrecto'],
  ExpiredCodeException: [400, 'El código de verificación expiró, solicita uno nuevo'],
  NotAuthorizedException: [401, INVALID_CREDENTIALS],
  UserNotFoundException: [401, INVALID_CREDENTIALS],
  UserNotConfirmedException: [403, 'Debes verificar tu correo antes de iniciar sesión', 'USER_NOT_CONFIRMED'],
  LimitExceededException: [429, 'Demasiados intentos, espera unos minutos'],
  TooManyRequestsException: [429, 'Demasiados intentos, espera unos minutos'],
  InvalidParameterException: [400, 'Cognito rechazó los datos enviados'],
};

async function send(command) {
  try {
    return await cognito.send(command);
  } catch (error) {
    const known = COGNITO_ERRORS[error.name];
    if (known) throw new HttpError(...known);
    throw error;
  }
}

function profileAttributes(profile) {
  return [
    { Name: 'name', Value: profile.fullName },
    { Name: 'custom:dpi', Value: profile.dpi },
  ];
}

async function signUp(user) {
  const result = await send(new SignUpCommand({
    ClientId: config.cognito.clientId,
    Username: user.email,
    Password: user.password,
    UserAttributes: [{ Name: 'email', Value: user.email }, ...profileAttributes(user)],
  }));
  return result.UserSub;
}

async function confirmSignUp(email, code) {
  await send(new ConfirmSignUpCommand({ ClientId: config.cognito.clientId, Username: email, ConfirmationCode: code }));
}

async function resendCode(email) {
  await send(new ResendConfirmationCodeCommand({ ClientId: config.cognito.clientId, Username: email }));
}

async function authenticate(email, password) {
  const result = await send(new InitiateAuthCommand({
    ClientId: config.cognito.clientId,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: { USERNAME: email, PASSWORD: password },
  }));
  if (!result.AuthenticationResult) throw new HttpError(401, INVALID_CREDENTIALS);
}

async function isConfirmed(email) {
  const user = await send(new AdminGetUserCommand({ UserPoolId: config.cognito.userPoolId, Username: email }));
  return user.UserStatus === 'CONFIRMED';
}

async function updateProfile(email, profile) {
  await send(new AdminUpdateUserAttributesCommand({
    UserPoolId: config.cognito.userPoolId,
    Username: email,
    UserAttributes: profileAttributes(profile),
  }));
}

async function deleteUser(email) {
  await send(new AdminDeleteUserCommand({ UserPoolId: config.cognito.userPoolId, Username: email }));
}

module.exports = { signUp, confirmSignUp, resendCode, authenticate, isConfirmed, updateProfile, deleteUser };
