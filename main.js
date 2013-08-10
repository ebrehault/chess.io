$(document).ready(function() {
  var games_list_gist = "https://api.github.com/gists/6044598";
  var chess = $('.board').chess();

  $('.back').click(function() {
    chess.transitionBackward();
    $('.annot').text( chess.annotation() );
    return false;
  });

  $('.next').click(function() {
    chess.transitionForward();
    $('.annot').text( chess.annotation() );
    return false;
  });

  $('.flip').click(function() {
    chess.flipBoard();
    return false;
  });
  $('#create-button').click(function() {
    chess.clearBoard();
    $('#pgn').hide();
    $("#edit-container").show();
    return false;
  });
  $('#save-button').click(function() {
    chess.clearBoard();
    $("#edit-container").hide();
    var newpgn = $("#edit-pgn").val();
    $('#pgn').html(newpgn);
    $('#pgn').show();
    chess = $('.board').chess({ pgn : newpgn } );

    // upload to gist
    $.post("https://api.github.com/gists", JSON.stringify({
        description: "Gist from edit-GeoJSON",
        public: true,
        files: {
            "game.pgn": {
                content: newpgn
            }
        }
    }), function(data) {
      console.log(data);
    });

    return false;
  });

  chess.reset({ pgn : $('#pgn').html() } );
  
  $.getJSON(games_list_gist, '', function(data) {
    var games = JSON.parse(data.files['chess-io-games.json'].content).games;
    for(var i=0;i<games.length;i++) {
      $('#gamelist').append('<li><a href="#'+games[i].id+'" data-gist="'+games[i].id+'">'+games[i].white+' / '+games[i].black+ ' ' +games[i].result);
    }
    $('#gamelist a').click(function(e) {
      var gist_id = $(e.target).attr('data-gist');
      $.getJSON("https://api.github.com/gists/"+gist_id, '', function(data) {
        for(var file_id in data.files) {
          var pgn = data.files[file_id].content;
          $('#pgn').html(pgn);
          chess.reset({ pgn : pgn });
        }
      });
    })
  });
});
