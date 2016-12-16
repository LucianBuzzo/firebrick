var fs = require('fs');
var mm = require('musicmetadata');

const detect = (path) => {
  return new Promise((resolve, reject) => {
    var readableStream = fs.createReadStream(path);
    mm(readableStream, function(err, metadata) {
      if (err) {
        return reject(err);
      }
      readableStream.close();
      return resolve(metadata);
    });
  });
};

module.exports = {
  detect,
};
