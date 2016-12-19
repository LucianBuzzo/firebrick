/**
 * Object for storing Tracks.
 */

const uuid = require('uuid');

class Track {
  constructor(opts = {}) {
    this.id = uuid();
    this.path = opts.path;
    this.name = opts.name;
    this.sourceLocation = opts.sourceLocation;
  }

  getPlayableMedia() {
    return new Promise(resolve => {
      const audio = new Audio(this.path);

      return resolve(audio);
    });
  }
}

module.exports = Track;
