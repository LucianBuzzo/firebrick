const angular = require('angular');

const firebrickApp = angular.module('firebrickApp', []);

firebrickApp.factory('broadcastService', require('./services/broadcastService'));

firebrickApp.service('playAudioService', require('./services/playAudioService'));
firebrickApp.service('playlistService', require('./services/playlistService'));

firebrickApp.controller('TrackBrowserController', require('./controllers/trackBrowserController'));
firebrickApp.controller('PlaylistController', require('./controllers/playlistController'));

