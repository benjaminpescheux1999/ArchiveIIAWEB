const storage = require('azure-storage');
const path = require('path');

const blobService = storage.createBlobService(
  process.env.CONNECTION_STRING ||
    'DefaultEndpointsProtocol=https;AccountName=boanunciostoragedev;AccountKey=zyT1AFT4WxYqWPBs4Fz0xF0Vz4xBaI7ERLqEVsW1cNQ3qi+hQFiGLfY/dQV1408ltI37D11fKbnFjF5xb2Lf9Q==;EndpointSuffix=core.windows.net'
); // TODO: Add env var on WebApp
const CONTAINER_NAME = 'pictures';

blobService.createContainerIfNotExists(CONTAINER_NAME, { publicAccessLevel: 'blob' }, () => {});

const uploadLocalFileToAzure = async (prefixPath, filePath) => new Promise((resolve, reject) => {
  const fullPath = path.resolve(filePath);
  const blobName = `${prefixPath}/${path.basename(filePath)}`;
  blobService.createBlockBlobFromLocalFile(CONTAINER_NAME, blobName, fullPath, (err, result) => {
    if (err) {
      reject(err);
    } else {
      const url = blobService.getUrl(CONTAINER_NAME, blobName);
      resolve(url);
    }
  });
});

const removeLocalFileFromAzure = async (prefixPath, filePath) => new Promise((resolve, reject) => {
  const blobName = `${prefixPath}/${path.basename(filePath)}`;
  blobService.deleteBlobIfExists(CONTAINER_NAME, blobName, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const getBlobUrl = (...params) => blobService.getUrl(CONTAINER_NAME, ...params);

module.exports = {
  blobService, CONTAINER_NAME, getBlobUrl, uploadLocalFileToAzure, removeLocalFileFromAzure,
};
