/**
 * Creates a wrapper around the youtube 'video' element that is loaded in an
 * embedded iframe, allowing the video element to be easily manipulated.
 */

class YoutubeSourceWrapper {

  /**
   * @desc Constructor for the wrapper. Sets up some local attributes and begins
   * the loading process. Calls the 'readyFunction()' method on completion. The
   * readyFunction method is user defined in the 'onReady' function.
   *
   * @param {String} url - The url of the youtube video to load and wrap.
   *
   * @returns {Object} - The wrapper object
   */
  constructor(url) {
    this.isPaused = true;
    this.source = null;
    this.readyFunction = () => { };

    this.id = this.getYoutubeIdFromUrl(url);

    this.getSource()
    .then(() => {
      this.readyFunction(this);
    });
  }

  /**
   * @desc Uses a regular expression to retrive the unique youtube id from
   * a youtube url.
   *
   * @param {String} url - The youtube url to retrieve an id from.
   *
   * @returns {String} - The youtube id.
   */
  getYoutubeIdFromUrl(url) {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(rx);

    return match[1];
  }

  /**
   * @desc Searches for the video element containing the youtube video
   *
   * @returns {Object} - An html <video> element if one was found, or null.
   */
  getVideoElement() {
    return document.querySelector('#youtube-container iframe')
      .contentWindow.document.querySelector('video');
  }

  /**
   * @desc Loads the youtube video in an Iframe and retrieves the video element
   * inside it.
   *
   * @returns {Promise} - resolves with the <video> element.
   */
  loadVideo() {
    let targetContainer = document.getElementById('youtube-container');
    let frame = document.createElement('iframe');
    frame.src = `https://www.youtube.com/embed/${this.id}`;
    targetContainer.innerHTML = '';
    targetContainer.appendChild(frame);

    return new Promise((resolve) => {
      const cycle = () => {
        const videoEl = this.getVideoElement();
        if (videoEl) {
          return resolve(videoEl);
        }

        return setTimeout(cycle, 100);
      };

      cycle();
    });
  }

  /**
   * @desc Loads the video and sets it as the source attribute.
   *
   * @returns {Promise} - resolves once the process is complete.
   */
  getSource() {
    return new Promise(resolve => {
      this.loadVideo()
      .then(el => {

        this.source = el;

        resolve();
      });
    });
  }

  /**
   * @desc Stops the video from playing if it is not already stopped.
   *
   * @returns {void}
   */
  stop() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.source.click();
    }
  }

  /**
   * @desc Stops the video from playing if it is not already stopped.
   *
   * @returns {void}
   */
  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.source.click();
    }
  }

  /**
   * @desc Plays the video if it is not already playing.
   *
   * @returns {void}
   */
  play() {
    if (this.isPaused) {
      this.isPaused = false;
      this.source.click();
    }
  }

  /**
   * @desc Returns a boolean indicating if the video is paused or not.
   *
   * @returns {Boolean} - true if the the video is paused.
   */
  isPaused() {
    return this.isPaused;
  }

  /**
   * @desc Sets a function that is called once the video has loaded.
   *
   * @param {Function} func - Called with the wrapper object once the video has
   * loaded.
   *
   * @returns {void}
   */
  onReady(func) {
    this.readyFunction = func;
  }

}

module.exports = YoutubeSourceWrapper;
