const storage = require('../storage.js');
const Track = require('../models/Track');
const YoutubeTrack = require('../models/YoutubeTrack');

const PlaylistService = function(broadcastService, playAudioService) {
  let trackList = [];

  storage.get('playlist', (error, list) => {
    if (error) {
      throw error;
    }

    trackList = list.map(track => {
      if (track.sourceLocation === 'youtube') {
        return new YoutubeTrack(track);
      } else {
        return new Track(track);
      }
    });

    console.log('TRACKLIST', list);

    broadcastService.send('newTrackInPlaylist');
  });

  const addTrack = newTrack => {
    trackList.push(newTrack);
    console.log(trackList);
    storage.set('playlist', trackList);

    broadcastService.send('newTrackInPlaylist');
  };

  const getTracks = () => trackList;

  const playNext = path => {
    console.log('playing next', path);
    let index = 0;
    for (let track of trackList) {
      console.log(track);
      if (track.path === path) {
        break;
      }
      index++;
    }

    if (!trackList[index + 1]) {
      return;
    }

    let track = trackList[index + 1];

    playAudioService.play(track);
  };

  return {
    addTrack,
    getTracks,
    playNext
  };
};

module.exports = PlaylistService;
