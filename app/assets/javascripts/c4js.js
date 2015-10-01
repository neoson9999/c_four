var GAME_STATES = {
  WAITING_FOR_OPPONENT: 0,
  IN_PROGRESS: 1
}

var radius = 50;
var PLAYER_ONE = 1;
var PLAYER_TWO = 2;

var whoseTurn = PLAYER_ONE;
var gameFinished = false;
var currentGameInstance;

var disks = [];
var disksPerColumn = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0
};

var requestInterval = 2500;
var lastAddedDiskId;
var currentPlayer;
var buttonsDisabled = false;

function Disk(row, column, player, x, y, id) {
  this.row = row;
  this.column = column;
  this.player = player;
  this.x = x;
  this.y = y;
  this.winningDisk = false;
  this.id = id;
}

function addDisk(column) {
  if (gameFinished) {
    console.log('game over! please reset game');
    return;
  }

  if (column < 1 || column > 7) {
    console.log('invalid column! please enter a number from 1-7');
    return;
  }

  if (disksPerColumn[column] == 6) {
    console.log('column already full!');
    return;
  }

  disableAddDiskButtons();

  var addDiskRequest = $.ajax({
    url: '/games/' + currentGameInstance.id + '/add_disk_to_game',
    method: 'POST',
    dataType: 'json',
    data: { disk: {
      game_id: currentGameInstance.id,
      row: disksPerColumn[column] + 1,
      column: column,
      player: currentPlayer,
      winning_disk: false
    } }
  });
  addDiskRequest.done(function(response) {
    var newDiskX = (radius * 2) * (response.column - 1);
    disksPerColumn[column] += 1;
    var newDisk = new Disk(disksPerColumn[response.column], response.column, response.player, newDiskX, 0, response.id);
    addDiskToStack(newDisk);
    if (!gameFinished) {
      nextPlayerTurn();
    }
  });
  addDiskRequest.fail(function() {
    enableAddDiskButtons();
  });
}

function addDiskToStack(newDisk) {
  disks.push(newDisk);
  lastAddedDiskId = newDisk.id;
  checkWinConditions();
}

function debugAddDisk(column, player) {
  if (column < 1 || column > 7) {
    console.log('invalid column! please enter a number from 1-7');
    return;
  }

  if (disksPerColumn[column] == 6) {
    console.log('column already full!');
    return;
  }

  var newDiskX = (radius * 2) * (column - 1);

  disksPerColumn[column] += 1;
  disks.push(new Disk(disksPerColumn[column], column, player, newDiskX, 0));
}

function resetGame() {
  disks = [];
  disksPerColumn = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0
  };
  whoseTurn = PLAYER_ONE;
  $('#game-status')[0].innerHTML = "Player 1 Turn";
  gameFinished = false;
}

function nextPlayerTurn() {
  var nextPlayerTurnRequest = $.ajax({
    method: "PUT",
    url: "/games/" + currentGameInstance.id + "/next_player_turn",
    dataType: "json"
  });
  nextPlayerTurnRequest.done(function(response) {
    currentGameInstance = response;
  });
}

function declareWinner() {
  if (whoseTurn == PLAYER_ONE) {
    $('#game-status')[0].innerHTML = "Player 1 Wins!";
  } else {
    $('#game-status')[0].innerHTML = "Player 2 Wins!";
  }
  gameFinished = true;
}

function checkWinConditions() {
  var whoseTurnDisks = $.grep(disks, function(e) { return e.player === whoseTurn});
  var winningDisks;
  for (var ctr = 0; ctr < whoseTurnDisks.length; ctr++) {
    winningDisks = findWinningDisks(whoseTurnDisks[ctr], ctr, whoseTurnDisks);
    if (winningDisks.length === 4) {
      markWinningDisks(winningDisks);
      declareWinner();
      break;
    }
  }
}

function findWinningDisks(disk, index, whoseTurnDisks) {
  var allowedDirections = findAllowedDirections(disk);
  var objectiveMet;
  var winningDisks = [];
  //check for connecting disks in every allowed direction
  for (var direction in allowedDirections) {
    var diskInDirection;
    objectiveMet = true;
    winningDisks.push(disk);

    switch (allowedDirections[direction]) {
      case DIRECTIONS.UP:
        console.log('checking up');
        for (var ctr = disk.row + 1; ctr < disk.row + 4; ctr++) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === ctr && e.column === disk.column });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
        }
        break;
      case DIRECTIONS.DOWN:
        console.log('checking down');
        for (var ctr = disk.row - 1; ctr > disk.row - 4; ctr--) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === ctr && e.column === disk.column });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
        }
        break;
      case DIRECTIONS.LEFT:
        console.log('checking left');
        for (var ctr = disk.column - 1; ctr > disk.column - 4; ctr--) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === disk.row && e.column === ctr });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
        }
        break;
      case DIRECTIONS.RIGHT:
        console.log('checking right');
        for (var ctr = disk.column + 1; ctr < disk.column + 4; ctr++) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === disk.row && e.column === ctr });
          console.log("sisisig");
          console.log(diskInDirection);
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
        }
        break;
      case DIRECTIONS.UP_LEFT:
        console.log('checking up_left');
        var ctr2 = 1;
        for (var ctr = disk.row + 1; ctr < disk.row + 4; ctr++) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === ctr && e.column === disk.column - ctr2 });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
          ctr2++;
        }
        break;
      case DIRECTIONS.UP_RIGHT:
        console.log('checking up_right');
        var ctr2 = 1;
        for (var ctr = disk.row + 1; ctr < disk.row + 4; ctr++) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === ctr && e.column === disk.column + ctr2 });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
          ctr2++;
        }
        break;
      case DIRECTIONS.DOWN_LEFT:
        console.log('checking down_left');
        var ctr2 = 1;
        for (var ctr = disk.row - 1; ctr > disk.row - 4; ctr--) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === ctr && e.column === disk.column - ctr2 });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
          ctr2++;
        }
        break;
      case DIRECTIONS.DOWN_RIGHT:
        console.log('checking down_right');
        var ctr2 = 1;
        for (var ctr = disk.row + 1; ctr < disk.row + 4; ctr++) {
          diskInDirection = $.grep(whoseTurnDisks, function(e) { return e.row === ctr && e.column === disk.column - ctr2 });
          winningDisks.push(diskInDirection[0]);
          if (diskInDirection.length === 0) {
            objectiveMet = false;
            break;
          }
          ctr2++;
        }
        break;
      default:
        objectiveMet = false;
        break;
    }

    if (objectiveMet) {
      console.log(disk);
      console.log(allowedDirections);
      console.log('victory!!!');
      return winningDisks;
    }
    winningDisks = [];
  }

  console.log(disk);
  console.log(allowedDirections);
  return winningDisks;
}

function markWinningDisks(winningDisks) {
  console.log('successfully connected four disks!');
  console.log(winningDisks.length);
  for (var ctr = 0; ctr < winningDisks.length; ctr++) {
    winningDisks[ctr].winningDisk = true;
    console.log(ctr);
    console.log(winningDisks[ctr]);
  }
}

var DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP_LEFT: 'UP_LEFT',
  UP_RIGHT: 'UP_RIGHT',
  DOWN_LEFT: 'DOWN_LEFT',
  DOWN_RIGHT: 'DOWN_RIGHT'
};

function findAllowedDirections(disk) {
  var allowedDirections = [];
  if (disk.row < 4) {
    allowedDirections.push(DIRECTIONS.UP);
  }
  if (disk.row > 3) {
    allowedDirections.push(DIRECTIONS.DOWN);
  }
  if (disk.column > 3) {
    allowedDirections.push(DIRECTIONS.LEFT);
  }
  if (disk.column < 5) {
    allowedDirections.push(DIRECTIONS.RIGHT);
  }
  if (allowedDirections.indexOf(DIRECTIONS.UP) > -1 && allowedDirections.indexOf(DIRECTIONS.LEFT) > -1) {
    allowedDirections.push(DIRECTIONS.UP_LEFT);
  }
  if (allowedDirections.indexOf(DIRECTIONS.UP) > -1 && allowedDirections.indexOf(DIRECTIONS.RIGHT)> -1) {
    allowedDirections.push(DIRECTIONS.UP_RIGHT);
  }
  if (allowedDirections.indexOf(DIRECTIONS.DOWN) > -1 && allowedDirections.indexOf(DIRECTIONS.LEFT)> -1) {
    allowedDirections.push(DIRECTIONS.DOWN_LEFT);
  }
  if (allowedDirections.indexOf(DIRECTIONS.DOWN) > -1 && allowedDirections.indexOf(DIRECTIONS.RIGHT)> -1) {
    allowedDirections.push(DIRECTIONS.DOWN_RIGHT);
  }
  return allowedDirections;
}

function pauseGame() {
  paused = true;
  MainLoop.stop();
  console.log('loop paused!!!');
}

function resumeGame() {
  paused = false;
  MainLoop.setUpdate(update).setDraw(draw).start();
  console.log('loop resumed!!');
}

function disableAddDiskButtons() {
  $('.add-disk-button').each(function(index) {
    this.disabled = true;
  });
  buttonsDisabled = true;
}

function enableAddDiskButtons() {
  $('.add-disk-button').each(function(index) {
    this.disabled = false;
  });
  buttonsDisabled = false;
}


$(document).ready(function() {
  var canvas = document.getElementById('game-area');
  var context = canvas.getContext('2d');

  function drawGridLines() {
    //vertical lines
    for(var column=1; column<7; column++) {
      context.beginPath();
      context.moveTo((100 * column), 0);
      context.lineTo((100 * column), canvas.height);
      context.lineWidth = 1;
      context.stroke();
    }

    //horizontal lines
    for(var row=1; row<6; row++) {
      context.beginPath();
      context.moveTo(0, (canvas.height - (100 * row)));
      context.lineTo(canvas.width, (canvas.height - (100 * row)));
      context.lineWidth = 1;
      context.stroke();
    }
  }

  function drawDisk(disk, index, array) {
    context.beginPath();
    context.arc(disk.x + 50, disk.y + 50, radius, 0, 2 * Math.PI, false);
    if (disk.player == 1) {
      context.fillStyle = 'red';
    } else {
      context.fillStyle = 'yellow';
    }
    context.fill();
    if (disk.winningDisk === true) {
      context.lineWidth = 10;
    } else {
      context.lineWidth = 1;
    }
    context.strokeStyle = '#003300';
    context.stroke();
  }

  function updateDisk(disk, index, array) {
    //only move disks which are not yet in place
    if (disk.y < canvas.height - ((radius * 2) * disk.row)) {
      disk.y += 10;
    }
  }

  var update = function() {
    disks.forEach(updateDisk);
    displayGameId();
    checkWhoseTurn();
  }

  var draw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGridLines();
    disks.forEach(drawDisk);
  }

  function startNewGame() {
    //request game instance
    resetGame();
    var newGameInstanceRequest = $.ajax({
      method: "POST",
      url: "/games/",
      dataType: "json",
      data: { game: { state: GAME_STATES.WAITING_FOR_OPPONENT, whose_turn: PLAYER_ONE, players_connected: 1 } }
    });
    newGameInstanceRequest.done(function(response) {
      currentPlayer = PLAYER_ONE;
      startGameWithInstance(response);
    });
  }

  function joinGame() {
    var gameIdToJoin = $('#game-id-to-join')[0].value;
    if (gameIdToJoin == "") {
      return;
    }
    console.log('joining game id ' + gameIdToJoin);
    var joinGameInstanceRequest = $.ajax({
      method: "PUT",
      url: "/games/" + gameIdToJoin + "/join_game",
      dataType: "json"
    });
    joinGameInstanceRequest.done(function(response) {
      console.log('join game request response');
      console.log(response);
      currentPlayer = PLAYER_TWO;
      startGameWithInstance(response);
    });
  }

  function startGameWithInstance(gameInstance) {
    currentGameInstance = gameInstance;
    MainLoop.setUpdate(update).setDraw(draw).start();
    setTimeout(checkGameInstance, requestInterval);
  }

  function checkGameInstance() {
    var checkGameInstanceRequest = $.ajax({
      method: "GET",
      url: "/games/" + currentGameInstance.id,
      dataType: "json"
    });
    checkGameInstanceRequest.done(function(response) {
      console.log(response);
      currentGameInstance = response;
      checkForNewDisk();
    });
    checkGameInstanceRequest.always(function() {
      setTimeout(checkGameInstance, requestInterval);
    });
  }

  $('#new-game-button').click(function() {
    startNewGame();
  });

  $('#join-game-button').click(function() {
    joinGame();
  });

  function displayGameId() {
    $('#your-game-id')[0].innerHTML = "Your game id: " + currentGameInstance.id;
  }

  function checkWhoseTurn() {
    if (currentGameInstance.whose_turn == "PLAYER_ONE_TURN") {
      whoseTurn = PLAYER_ONE
    } else {
      whoseTurn = PLAYER_TWO
    }

    if (whoseTurn === PLAYER_ONE) {
      $('#game-status')[0].innerHTML = "Player 1 Turn";
    } else {
      $('#game-status')[0].innerHTML = "Player 2 Turn";
    }

    if (whoseTurn != currentPlayer && !buttonsDisabled) {
      disableAddDiskButtons();
    } else if (whoseTurn === currentPlayer && buttonsDisabled) {
      enableAddDiskButtons();
    }
  }

  function checkForNewDisk() {
    if (lastAddedDiskId != currentGameInstance.last_added_disk_id) {
      var getLastAddedDiskRequest = $.ajax({
        url: '/disks/' + currentGameInstance.last_added_disk_id,
        method: 'GET',
        dataType: 'json'
      });
      getLastAddedDiskRequest.done(function(response) {
        var newDiskX = (radius * 2) * (response.column - 1);
        disksPerColumn[response.column] += 1;
        lastAddedDiskId = response.id;
        newDisk = new Disk(response.row, response.column, response.player, newDiskX, 0, response.id);
        addDiskToStack(newDisk);
      });
    }
  }

  //for debugging
  var paused = false;
  $('#pause-button').click(function() {
    if (paused == false) {
      this.innerHTML = "Resume";
      pauseGame();
    } else {
      this.innerHTML = "Pause";
      resumeGame();
    }
  });
});
