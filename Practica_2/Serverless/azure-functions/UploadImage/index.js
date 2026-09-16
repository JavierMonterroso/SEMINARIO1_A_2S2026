const { uploadToBlob } = require('../shared/uploadToBlob');

module.exports = async function (context, req) {
  context.res = await uploadToBlob('files/images', req);
};
