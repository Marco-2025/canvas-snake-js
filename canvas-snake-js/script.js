const dims = 20;
//key game boundaries
//canvas height and width minus the default dimensions (10)
const screenW = 500 - dims;
const screenH = 300 - dims;

//canvas requirements
const context = document.getElementById("game-screen").getContext("2d");

//key game variables
var startGame = false;

//at start set these randomly
/*Must be between 0 and 
the screen width and height minus default fruit/player dimensions*/

var playerXPos = Math.floor(Math.random() * screenW);
var playerYPos = Math.floor(Math.random() * screenH);

var fruitXPos = Math.floor(Math.random() * screenW);
var fruitYPos = Math.floor(Math.random() * screenH);

//reposition the fruit when player collides etc.
function repositionFruit() {
  fruitXPos = Math.floor(Math.random() * screenW);
  fruitYPos = Math.floor(Math.random() * screenH);
}

//player-fruit collision detection
function FpCol() {
  if (
    fruitXPos >= playerXPos - dims &&
    fruitXPos <= playerXPos + dims &&
    fruitYPos >= playerYPos - dims &&
    fruitYPos <= playerYPos + dims
  ) {
    return true;
  } else {
    return false;
  }
}

//player-wall collision detection
function PwCol() {
  if (
    playerXPos >= screenW ||
    playerXPos <= 0 ||
    playerYPos >= screenH ||
    playerYPos <= 0
  ) {
    return true;
  } else {
    return false;
  }
}

//ensure that the fruit position is far enough from the snake at the start
//this only runs once
while (FpCol() && startGame == false) {
  repositionFruit();
}

//snake handling function, take input for direction
var lastDir;
var segmentPos = [];
var segmentBacklog = [];
var speed = 1;
var selfCollision = false;
function SnakeHandler(dir) {
  //only override lastDir if key is valid
  //else retain movement
  //otherwise pressing another key will cause the snake to stop
  if (startGame == false) {
    speed = 0;
  } else {
    speed = 1;
  }

  var validDirs = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"];
  for (var i = 0; i < validDirs.length; i++) {
    //ensure that the snake cant move over its tail
    if (
      dir == validDirs[i] &&
      (((i == 0 || i == 2) && lastDir != validDirs[i + 1]) ||
        ((i == 1 || i == 3) && lastDir != validDirs[i - 1]))
    ) {
      lastDir = dir;
      break;
    }
  }

  if (lastDir == validDirs[0]) {
    playerYPos -= speed;
  } else if (lastDir == validDirs[1]) {
    playerYPos += speed;
  } else if (lastDir == validDirs[2]) {
    playerXPos += speed;
  } else if (lastDir == validDirs[3]) {
    playerXPos -= speed;
  }
  context.fillStyle = "#76DD77";
  context.fillRect(playerXPos, playerYPos, dims, dims);
  //handle clearing rectangle
  if (segmentPos[0] == undefined) {
    //segmentBacklog.push([playerXPos, playerYPos, lastDir]);
    if (lastDir == validDirs[0]) {
      segmentPos.push([playerXPos, playerYPos + dims, lastDir]);
    } else if (lastDir == validDirs[1]) {
      segmentPos.push([playerXPos, playerYPos - dims, lastDir]);
    } else if (lastDir == validDirs[2]) {
      segmentPos.push([playerXPos - dims, playerYPos, lastDir]);
    } else if (lastDir == validDirs[3]) {
      segmentPos.push([playerXPos + dims, playerYPos, lastDir]);
    }
  } else {
    //constantly update the backlog so exact steps are taken by the clearing rectangle
    //check the last added backlog entry and ensure no duplicates are added
    //also ensure that the game is not paused or over before adding entries
    if (
      segmentBacklog[segmentBacklog.length - 1] !=
        [playerXPos, playerYPos, lastDir] &&
      startGame
    ) {
      segmentBacklog.push([playerXPos, playerYPos, lastDir]);
    }

    //delay this section according to the score so that a tail is created
    setTimeout(() => {
      if (
        segmentPos[0][0] == segmentBacklog[0][0] &&
        segmentPos[0][1] == segmentBacklog[0][1]
      ) {
        segmentBacklog = segmentBacklog.slice(1);
      }
      //go in the direction of the current backlog
      if (segmentBacklog[0][2] == validDirs[0]) {
        segmentPos[0][1] -= speed;
      } else if (segmentBacklog[0][2] == validDirs[1]) {
        segmentPos[0][1] += speed;
      } else if (segmentBacklog[0][2] == validDirs[2]) {
        segmentPos[0][0] += speed;
      } else if (segmentBacklog[0][2] == validDirs[3]) {
        segmentPos[0][0] -= speed;
      }
      context.fillStyle = "#FFFFFF";
      context.fillRect(segmentPos[0][0], segmentPos[0][1], dims, dims);
    }, 200 + score * 200);
  }
  //check collision with tail
  //skip the latest segment as it will always be the current position of the player
  for (var i = 0; i < segmentBacklog.length - 1; i++) {
    if (
      playerXPos == segmentBacklog[i][0] &&
      playerYPos == segmentBacklog[i][1]
    ) {
      selfCollision = true;
    }
  }
}

function Fruit(collision) {
  context.fillStyle = "#DB1728";
  context.fillRect(fruitXPos, fruitYPos, dims, dims);
  //on collision increase score and reposition the fruit
  if (collision) {
    context.clearRect(fruitXPos, fruitYPos, dims, dims);
    score = score + 1;
    repositionFruit();
  }
}

//on click event
//declare game loop outside
var gameLoop;
var score = 0;

//set key out of scope of loop so its not reset continously
var key = 0;
//check key press
document.addEventListener("keydown", (event) => {
  key = event.key;
});

document.getElementById("start-button").addEventListener("click", () => {
  if (startGame == false) {
    startGame = true;
    document.getElementById("start-button").innerHTML = "Pause";
    //initiate game loop
    if (gameLoop == undefined) {
      gameLoop = setInterval(() => {
        if (!PwCol() && selfCollision == false) {
          //update score
          document.getElementById("score-caption").innerHTML = score + " 🍎";
          //start drawing
          context.beginPath();
          //snake
          SnakeHandler(key);
          //fruit
          Fruit(FpCol());
          //stop drawing
          context.stroke();
        } else {
          //update score
          startGame = false;
          clearInterval(gameLoop);
          document.getElementById("score-caption").innerHTML =
            "Game Over! Final Score " + score + " 🍎";
        }
      }, 10);
    }
  } else {
    startGame = false;
    document.getElementById("start-button").innerHTML = "Resume";
  }
});

document.getElementById("reset-button").addEventListener("click", () => {
  location.reload();
});
