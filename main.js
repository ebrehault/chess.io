var ChessIO = function(board_id, statusEl, pgnEl) {
  var self = {};
  self.gist_id = null;

  var board,
    game,
    board;

  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  var onDragStart = function(source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  };

  var onDrop = function(source, target) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a pawn for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';

    updateStatus();
  };

  // update the board position after the piece snap 
  // for castling, en passant, pawn promotion
  var onSnapEnd = function() {
    board.position(game.fen());
  };

  var updateStatus = function() {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';

      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    statusEl.html(status);
    pgnEl.html(game.pgn());
  };

  self.back = function() {
    board.position(game.back(), true);
  };

  self.next = function() {
    board.position(game.next(), true);
  };

  self.display = function(pgn) {
    game.load_pgn(pgn);
    board.position(game.fen(), true);
    updateStatus();
  };

  self.load = function(gist_id) {
    $.getJSON("https://api.github.com/gists/"+gist_id, '', function(data) {
      for(var file_id in data.files) {
        var pgn = data.files[file_id].content;
        self.display(pgn);
        self.gist_id = gist_id;
      }
    });
  };

  self.save = function() {
    $.post("https://api.github.com/gists", JSON.stringify({
        description: "Gist from chess.io",
        public: true,
        files: {
            "game.pgn": {
                content: game.pgn()
            }
        }
    }), function(data) {
      location.hash = data.id;
    });
  };

  self.initialize = function() {
    board = new ChessBoard(board_id, {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: 'chessboardjs/img/chesspieces/wikipedia/{piece}.png'
    });
    game = new Chess();
    if(location.hash) {
      self.load(location.hash.replace("#", ''));
    }
  }
  
  return self;
};

$(document).ready(function() {
  var chessio = ChessIO(
    'board',
    $('#status'),
    $('#pgn'));
  chessio.initialize();
  $('.back').click(function() {
    chessio.back();
    return false;
  });
  $('.next').click(function() {
    chessio.next();
    return false;
  });
  $('.save').click(function() {
    chessio.save();
    return false;
  });
  //chessio.display($('#pgn').text().split('\n').join('\n'));
});
