var cellStack = [0];
var cols = 12; 
var rows = 8;
var cellWidth = 32;
var cells = []; 
var currentCell = 0;
var wallWidth = 2;

var playerPos = 0;
var playerDir = 0;
var posHistory = [0];

var KEY_D = 68;
var KEY_A = 65;
var KEY_W = 87;
var KEY_S = 83;

var CURRENT_HUE = 0;
var BG_COLOR = 255;
var WALL_COLOR = 120;
var TRACK_COLOR = 200;
var TARGET_COLOR = 0;

// Graphic variables maze player ray debug overlay
var mg; 
var pg;     
var rg; 
var dg; 
var og;
var rayCasting;

function randomizeColors() {
  var hue = random(360);
  CURRENT_HUE = hue;
  BG_COLOR = color(hue, 50, 100);
  TRACK_COLOR = color(hue, 80, 90);
  WALL_COLOR = 0;
}

function setup() {
  colorMode(HSB);
  var w = cols * cellWidth;
  var h = rows * cellWidth; 
  
  randomizeColors();
  TARGET_COLOR = color(0, 100, 100);
  
  createCanvas(w, h * 2);
  pixelDensity(1);
  mg = createGraphics(w, h);
  pg = createGraphics(w, h);
  rg = createGraphics(w, h);
  dg = createGraphics(w, h);
  og = createGraphics(w, h * 2);
  
  wallWidth = cellWidth / 8;
  
  generateMaze();
  updatePlayerGraphics();
}

function draw() {
  updatePlayerGraphics();
  
  image(mg, 0, 0);
  image(pg, 0, 0);
  image(dg, 0, 0);
  image(rg, 0, height / 2);
  image(og, 0, 0);
}

function keyReleased() {
  triggeredBefore = 0;
}

var triggeredBefore; 
var prevDrawX = 0, prevDrawY = 0;
var prevDir = 0;
var triggeredRestart = false;
var isMoving = false;

// Reset game function
function resetGame() {
    playerPos = 0;
    playerDir = 0;
    posHistory = [0];
    triggeredRestart = false;
    og.clear();
    updatePlayerGraphics();
    document.getElementById('winScreen').style.display = 'none'; 
  }
  
  // Play again function
  function playAgain() {
    resetGame();
  }
  
  // New maze function
  function newMaze() {
    resetGame(); 
    generateMaze(); 
  }

// Restart game function
function restartGame() {
  resetGame();
}

function keyPressed() {
    if (!isMoving && (keyCode == LEFT_ARROW || keyCode == KEY_A)) {
      playerDir -= Math.PI / 2;
    }
    if (!isMoving && (keyCode == RIGHT_ARROW || keyCode == KEY_D)) {
      playerDir += Math.PI / 2;
    }
  
    var px = getX(playerPos);
    var py = getY(playerPos);
  
    var pV = createVector(1, 0);
    pV.rotate(playerDir);
    var moveX = 0;
    var moveY = 0;
    if (keyIsDown(UP_ARROW) || keyIsDown(KEY_W)) {
      moveX = pV.x;
      moveY = pV.y;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(KEY_S)) {
      pV.mult(-1);
      moveX = pV.x;
      moveY = pV.y;
    }
  
    if (py > 0 && moveY < -0.1 && cells[playerPos].walls[0] == false) {
      py -= 1;
    } else if (py < rows - 1 && moveY > 0.1 && cells[playerPos].walls[2] == false) {
      py += 1;
    } else if (px < cols - 1 && moveX > 0.1 && cells[playerPos].walls[1] == false) {
      px += 1;
    } else if (px > 0 && moveX < -0.1 && cells[playerPos].walls[3] == false) {
      px -= 1;
    }
    var newPos = getIndex(px, py);
  
    if (newPos !== playerPos) {
      playerPos = newPos;
      posHistory.push(newPos);
  
      console.log("Player Position:", playerPos, "Cell Type:", cells[playerPos].type);
  
      // Check if the player reached the end
      if (!triggeredRestart && cells[playerPos].type == "end") {
        console.log("Player reached the end!"); 
        showWinScreen();
        triggeredRestart = true; 
      }
    }
  }

// Update player graphics
function updatePlayerGraphics() {
  if (triggeredBefore > millis() - 150) return;
  
  triggeredBefore = millis();
  
  var px = getX(playerPos); 
  var py = getY(playerPos); 
  
  var drawX = px * cellWidth + cellWidth / 2;
  var drawY = py * cellWidth + cellWidth / 2;
  
  if (typeof prevDrawX == "undefined") prevDrawX = drawX;
  if (typeof prevDrawY == "undefined") prevDrawY = drawX;

  pg.clear(); 
  mg.background(0);
  for (var i = 0; i < cells.length; i++) {
    cells[i].drawBackground();
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].draw();
  }
  
  for (var i = 0; i < posHistory.length - 1; i++) {
    var i1 = posHistory[i];
    var x1 = getX(i1) * cellWidth + cellWidth / 2; 
    var y1 = getY(i1) * cellWidth + cellWidth / 2;
    var i2 = posHistory[i + 1];
    var x2 = getX(i2) * cellWidth + cellWidth / 2;
    var y2 = getY(i2) * cellWidth + cellWidth / 2;
    
    pg.noFill();
    pg.strokeWeight(cellWidth / 3);
    pg.stroke(TRACK_COLOR);
    pg.line(x1, y1, x2, y2);
  }
  
  var cX = prevDrawX, cY = prevDrawY, cDir = prevDir;
  if (prevDir !== playerDir || prevDrawX !== drawX || prevDrawY !== drawY) {
    cX = lerp(prevDrawX, drawX, 0.5);
    cY = lerp(prevDrawY, drawY, 0.5);
    cDir = lerp(prevDir, playerDir, 0.5);

    prevDrawX = cX;
    prevDrawY = cY;
    prevDir = cDir;
  }
  
  // Update ray marching  
  rayCasting = new RayCasting(createVector(cX, cY), cDir, width, 12);
  rayCasting.draw();
  
  pg.strokeWeight(2);
  pg.fill(0, 255, 0);
  pg.stroke(10, 60, 10);
  pg.ellipse(cX, cY, cellWidth / 2);
}

function getIndex(x, y) {
  return x + y * cols;
}

function getX(i) {
  return i % cols;
}

function getY(i) {
  return Math.floor(i / cols);
}

// Generate the maze
function generateMaze() {
  playerPos = 0;
  prevDrawX = void 0;
  prevDrawY = void 0;
  triggeredBefore = null;
  triggeredRestart = false;
  posHistory = [0];
  randomizeColors();
  og.clear();
  mg.clear();
  cells = []; 
  currentCell = 0;
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      var type = "default";
      if (x == 0 && y == 0) {
        type = "start";
      }
      if (x == cols - 1 && y == rows - 1) {
        type = "end";
      }
      cells.push(new Cell(x, y, cellWidth / 2, type));
    }
  }
  var countSteps = 0;
  while (typeof currentCell !== "undefined") {
    countSteps++;
    currentCell = generateMazeStep();
  }
  updatePlayerGraphics(); 
}

// Generate a step in the maze
function generateMazeStep() {
  var cc = cells[currentCell]; 
  cc.visited = true;   
  var nextCell = selectUnvisitedNeighbor(currentCell);
  
  if (typeof nextCell !== "undefined") {
    cellStack.push(nextCell);
    var nc = cells[nextCell];
    nc.visited = true;
    nc.removeWallBetween(cc);
  } else {
    nextCell = cellStack.shift();
  } 
  return nextCell; 
}

// Select an unvisited neighbor
function selectUnvisitedNeighbor(ci) {
  var neighbors = []; 
  var x = getX(ci);
  var y = getY(ci);
  if (x > 0) {
    var i = getIndex(x - 1, y);
    if (!cells[i].visited) {
      neighbors.push(i);  
    }
  }
  if (x < cols - 1) {
    var i = getIndex(x + 1, y);
    if (!cells[i].visited) {
      neighbors.push(i);
    }
  }
  if (y > 0) {
    var i = getIndex(x, y - 1);
    if (!cells[i].visited) {
      neighbors.push(i);
    }
  }
  if (y < rows - 1) {
    var i = getIndex(x, y + 1);
    if (!cells[i].visited) {
      neighbors.push(i);
    }
  }
  return random(neighbors);
}

  function showWinScreen() {
    console.log("Showing win screen"); // Debugging
    document.getElementById('winScreen').style.display = 'block';
  }