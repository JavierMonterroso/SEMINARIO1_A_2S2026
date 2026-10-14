const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');
const { TranslateClient } = require('@aws-sdk/client-translate');
const { ComprehendClient } = require('@aws-sdk/client-comprehend');
const { PollyClient } = require('@aws-sdk/client-polly');
const { LexRuntimeV2Client } = require('@aws-sdk/client-lex-runtime-v2');
const { config } = require('./env');

// Sin access keys: en EC2 el SDK toma las credenciales temporales del rol role-ec2-backend.
const region = config.aws.region;

module.exports = {
  cognito: new CognitoIdentityProviderClient({ region }),
  rekognition: new RekognitionClient({ region }),
  translate: new TranslateClient({ region }),
  comprehend: new ComprehendClient({ region }),
  polly: new PollyClient({ region }),
  lex: new LexRuntimeV2Client({ region }),
};
