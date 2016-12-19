const BroadcastService = function($rootScope) {
  return {
    send: function(msg, data) {
      console.log('SENDING ======>');
      console.log(msg, data);
      $rootScope.$broadcast(msg, data);
    }
  };
};

module.exports = BroadcastService;
