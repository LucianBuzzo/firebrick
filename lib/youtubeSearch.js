const cheerio = require('cheerio');
const request = require('request');
const YoutubeTrack = require('./YoutubeTrack');

const ytUrl = 'https://www.youtube.com/results?search_query=';

const search = term => {
  return new Promise((resolve, reject) => {
    request(ytUrl + term, (error, response, html) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode !== 200) {
        return reject(response.statusCode);
      }

      const $ = cheerio.load(html);

      const results = [];

      $('.yt-lockup-title .yt-uix-sessionlink').each(function() {
        const href = $(this).attr('href');

        if (href.indexOf('watch') > -1) {
          results.push(new YoutubeTrack({
            path: 'https://youtube.com' + href,
            name: $(this).text(),
            sourceLocation: 'youtube'
          }));
        }
      });

      return resolve(results);
    });
  });
};

module.exports = search;
