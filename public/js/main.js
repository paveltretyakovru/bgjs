// Generated by CoffeeScript 1.8.0
(function() {
  $(document).ready(function() {
    var dice_sound_params, piece_sound_params, randomNumber;
    window.board = new Board();
    window.rules = new Rules();
    window.bones = new Bones('.dice');
    window.socket = new Socket();
    window.game = new Game(window.board, window.rules, window.bones, window.socket);
    window.game.bones.changeSide(0, 'left');
    window.game.bones.changeSide(1, 'right');
    window.game.loadImages(function() {
      window.game.registrOnServer({
        id: randomNumber(1, 1000)
      });
      window.board.init();
      window.game.setListener('takeGameData', 'Game', 'takeGameData');
      window.game.setListener('takeStep', 'Game', 'takeStep');
      window.game.setListener('stepBegin', 'Game', 'stepBegin');
      window.game.setListener('takeBones', 'Game', 'takeBones');
      window.game.setListener('finishGame', 'Game', 'endGame');
      return window.game.setListener('takeReInvite', 'Game', 'getReInvite');
    });
    randomNumber = function(min, max) {
      var rand;
      rand = min - 0.5 + Math.random() * (max - min + 1);
      return Math.round(rand);
    };
    dice_sound_params = {
      name: 'dice'
    };
    piece_sound_params = {
      name: 'piece'
    };
    return ion.sound({
      sounds: [dice_sound_params, piece_sound_params],
      path: 'sounds/',
      preload: true,
      volume: 1.0
    });
  });

}).call(this);
