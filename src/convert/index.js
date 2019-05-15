'use strict';

const crypto = require('crypto');
const ENCRYPTION_KEY = '1uXMtNBpak7Z1gtN8Z7hMjXYOh7h9VOS'; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

module.exports.encryptText = (req, res, callback) => {
  let jsonString = JSON.stringify(req.body);
  let encryptedJsonString = encrypt(jsonString);

  const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Conversion Successful',
        OriginalString: jsonString,
        convertedText: encryptedJsonString
      }),
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Methods": "*"
      }
  }
  callback(null, response);
}

module.exports.decryptText = (req, res, callback) => {
  const reqData = JSON.parse(req.body);
  let decryptedJsonString = decrypt(reqData.string);
  const decrypted = JSON.parse(decryptedJsonString);

  const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Conversion Successful',
        OriginalString: reqData,
        convertedText: decrypted
      }),
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Methods": "*"
      }
  }
  callback(null, response);
}

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-ctr', new Buffer(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  let concatedEncryptedString = iv.toString('hex') + ':' + encrypted.toString('hex');
  
  let buff = new Buffer(concatedEncryptedString);
  let base64Encrypted = buff.toString('base64');
  return base64Encrypted;
}

function decrypt(text) {
  let buff = new Buffer(text, 'base64');
  let base64Decoded = buff.toString('ascii');
  let textParts = base64Decoded.split(':');
  let iv = new Buffer(textParts.shift(), 'hex');
  let encryptedText = new Buffer(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-ctr', new Buffer(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
