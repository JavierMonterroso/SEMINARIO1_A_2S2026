import boto3
from . import config

# Sin access keys: en EC2 boto3 toma las credenciales temporales del rol role-ec2-backend.
session = boto3.Session(region_name=config.AWS_REGION)

cognito = session.client("cognito-idp")
rekognition = session.client("rekognition")
translate = session.client("translate")
comprehend = session.client("comprehend")
lex = session.client("lexv2-runtime")
