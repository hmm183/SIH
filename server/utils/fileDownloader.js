// server/utils/fileDownloader.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure a temporary directory exists
const tempDir = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const downloadFile = async (url) => {
  const tempFileName = `${uuidv4()}-${path.basename(new URL(url).pathname)}`;
  const tempFilePath = path.join(tempDir, tempFileName);

  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(tempFilePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(tempFilePath));
    writer.on('error', reject);
  });
};

module.exports = { downloadFile };