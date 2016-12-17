/**
 * Object for storing Tracks.
 */

class Track {
  constructor(opts = {}) {
    this.path = opts.path;
    this.name = opts.name;
    this.sourceLocation = opts.sourceLocation;
  }
}

module.exports = Track;
