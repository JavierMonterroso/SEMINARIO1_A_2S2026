// Cambien estas URLs segun el despliegue (AWS o Azure) antes de subir el build al bucket o contenedor correspondiente.
const CONFIG = {
  API_BASE_URL: 'http://CAMBIAR-DNS-DEL-BALANCEADOR/api',
  UPLOAD_IMAGE_URL: 'http://CAMBIAR-API-GATEWAY-O-APIM/upload/image',
  UPLOAD_TEXT_URL: 'http://CAMBIAR-API-GATEWAY-O-APIM/upload/text',
};
