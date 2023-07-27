var board = [
    null, null, null,
    null, null, null,
    null, null, null
  ];
  
  var player1 = 'X';
  var player2 = 'O';
  
  var playerTurn = player1;
  var winState = false;
  var turnTally = 1;
  var TIE = 'TIE';
  
  var crossString = "<div class=\"cross\"></div><div class=\"cross\"></div>";
  var noughtString = "<div class=\"nought\"></div>";
  var selectPad = 5; // refer to CSS (***)
  
  var colors = {
    red: "#E83A3A",
    orange: "#ED9639",
    yellow: "#E2F274",
    purple: "#C780F2",
    green: "#29E342"
  };
  
  function markSlot() {
    var newMark = false;
    while (!newMark) {
      var slot = Math.floor(Math.random() * board.length);
      if (board[slot] === null) {
        board[slot] = playerTurn;
        return slot;
      }
    }
  }
  
  var winRows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  function checkVictory() {
    winRows.forEach(function(x) {
      var init = board[x[0]];
      if ((init == 'X' || init == 'O') && init == board[x[1]] && init == board[x[2]]) {
        winState = true;
        var winRow = [x[0], x[1], x[2]];
        highlightWin(winRow);
      }
    });
    if (winState == true) return;
    if (turnTally == 9 && board.indexOf(null) == -1) {
      winState = TIE;
    }
    return false;
  }
  
  function endTurn() {
    playerTurn = (playerTurn == player1 ? player2 : player1);
    turnTally += 1;
  }
  
  function processTurn() {
    drawMark(markSlot());
    checkVictory();
    endTurn();
  }
  
  function clearGame() {
    winState = false;
    turnTally = 1;
    board = board.map(function(x) {
      return null;
    });
  }
  
  /* ANIMATION */
  
  function drawMark(slot) {
    var slot = slot + selectPad;
    var mark = (playerTurn == player1 ? crossString : noughtString);
    $(".mark:nth-of-type(" + slot + ")").append(mark).hide().fadeIn(300);
  }
  
  function highlightWin(winRow) {
    winRow.forEach(function(slot) {
      var slot = slot + selectPad
      if (playerTurn == player1) {
        $(".mark:nth-of-type(" + slot + ") div").delay(400).animate({
          backgroundColor: colors.orange
        }, 300);
      } else {
        $(".mark:nth-of-type(" + slot + ") div").delay(400).animate({
          borderColor: colors.purple
        }, 300);
      }
    })
  }
  
  function highlightTie() {
    $(".mark .cross").delay(100).animate({
      backgroundColor: colors.green
    }, {
      duration: 300,
      queue: false
    });
    $(".mark .nought").delay(100).animate({
      borderColor: colors.green
    }, {
      duration: 300,
      queue: false
    });
  }
  
  function fadeOutMarks() {
    $("div.mark .cross, .nought").delay(2000).animate({
      opacity: 0.0
    }, 300, "linear", function() {
      $(this).remove();
    });
  }
  
  /* START-LOOP */
  
  function loopGame() {
    var gameTimer = setInterval(function() {
      processTurn();
      if (winState || winState == TIE) {
        if (winState === TIE) {
          highlightTie();
        }
        clearGame();
        clearInterval(gameTimer);
        fadeOutMarks();
        setTimeout(function() {
          loopGame();
        }, 3400);
      }
    }, 600);
  }
  
  loopGame();