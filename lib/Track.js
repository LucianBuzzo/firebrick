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
    const audio = new Audio(this.path);

    return audio;
  }
}

module.exports = Track;
