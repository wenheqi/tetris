const ARENA_WIDTH = 240; // in pixels
const ARENA_HEIGHT = 400; // in pixels
const BLOCK_SIZE = 20; // basic tetromino block size, in pixels
const FALL_INTERVAL = 500; // falling interval, in milliseconds

const colors = [
  "#000000",
  "#FF0D72", // T
  "#5F99EA", // O
  "#B1ED2F", // L
  "#F538FF", // J
  "#FF8E0D", // I
  "#FFE138", // S
  "#00B4AB", // Z
];

const shapes = "TOLIJSZ";

const canvas = document.createElement("canvas");

// NOTE: in current design canvas size is the same as arena's
canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;
canvas.id="tetris-canvas";

document.getElementById("container").appendChild(canvas);

const ctx = canvas.getContext("2d");

const arena = createMatrix(ARENA_WIDTH / BLOCK_SIZE, ARENA_HEIGHT / BLOCK_SIZE, 0);

var queue = [];

const tetromino = {
  data: [],
  pos: {x: 0, y: 0},
  timer: 0,
}

/*
** check if tetromino collides with current arena;
** return true iff collide happens.
*/
function collide() {
  for (let y = 0; y < tetromino.data.length; y++) {
    for (let x = 0; x < tetromino.data[0].length; x++) {
      if (tetromino.data[y][x] !== 0) { // non-empty block
        const ax = tetromino.pos.x + x;
        const ay = tetromino.pos.y + y;
        if (ax < 0 ||
            ax >= arena[0].length ||
            ay >= arena.length ||
            arena[ay][ax] !== 0
           ) {
          return true;
        }
      }
    }
  }
  return false;
}

function createMatrix(width, height, val) {
  const matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(val));
  }
  return matrix;
}

function createRandomTetromino() {
  const idx = Math.random() * shapes.length | 0;
  return createTetromino(shapes[idx]);
}

/*
** Create a specified tetromino.
** In the returned matrix, if an element is 0, it means
** there is nothing; otherwise it's a solid block.
*/
function createTetromino(shape) {
  if (shape === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  }
  else if (shape === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  }
  else if (shape === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  }
  else if (shape === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  }
  else if (shape === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  }
  else if (shape === 'S') {
    return [
      [0, 0, 0],
      [0, 6, 6],
      [6, 6, 0],
    ];
  }
  else if (shape === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

/*
** debounce, orginally implemented by John Hann, who also
** coined the term
** http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
*/
function debounce(func, threshold, execAsap) {
  var timeout;
  return function debounced () {
    var obj = this, args = arguments;
    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null; 
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100); 
  };
}

function drawArena() {
  arena.forEach((row, y) => {
    row.forEach((val, x) => {
      drawBlock(x,
                y,
                BLOCK_SIZE,
                BLOCK_SIZE,
                colors[val]);
    })
  })
}

function drawBlock(x, y, width, height, color, thickness = 0, borderColor="grey") {
  ctx.save();
  // border
  if (thickness > 0) {
    ctx.fillStyle = borderColor;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, width, height);
  }  

  // inner rectangle
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE + thickness,
               y * BLOCK_SIZE + thickness,
               width - 2 * thickness,
               height - 2 * thickness);
  ctx.restore();
}

function drawGrids() {
  ctx.save();
  // horizontal lines
  for (let y = BLOCK_SIZE; y < ARENA_HEIGHT; y += BLOCK_SIZE) {
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ARENA_WIDTH, y);
    ctx.stroke();
  }
  
  // vertical line
  for (let x = BLOCK_SIZE; x < ARENA_WIDTH; x += BLOCK_SIZE) {
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ARENA_HEIGHT);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTetromino(offset, matrix) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        drawBlock(offset.x + x,
                 offset.y + y,
                 BLOCK_SIZE,
                 BLOCK_SIZE,
                 colors[val],
                 1);
      }
    })
  })
}

function enterFullscreen() {
  const elem = document.body;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

function exitFullscreen() {
  const elem = document.getElementById("container");
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}

/*
** merge current tetromino into arena
*/
function merge() {
  tetromino.data.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) { // non-empty block
        const ax = tetromino.pos.x + x;
        const ay = tetromino.pos.y + y;
        arena[ay][ax] = val;
      }
    })
  })
}

function resetGame() {
  tetromino.data = createRandomTetromino();
  tetromino.pos.y = 0;
  tetromino.pos.x = (ARENA_WIDTH / (2 * BLOCK_SIZE) - tetromino.data[0].length / 2) | 0;
  queue = [];
  queue.push(createRandomTetromino());
}

function resizeGame() {
  /* ratio = arena height / (arena width + stat panel width)
  ** ratio = 400 / (240 + 60) = 400 / 300 = 4 / 3
  */
  const ratio = 4 / 3;
  const newRatio = innerHeight / innerWidth;
  let newHeight;
  let newWidth;
  if (newRatio > ratio) {
    newHeight = ratio * (innerWidth - 3);
    newWidth = (innerWidth - 3);
  }
  else {
    newHeight = innerHeight - 3;
    newWidth = (innerHeight - 3) / ratio;
  }
  const elem = document.getElementById("container");
  elem.style.height = newHeight + 'px';
  elem.style.width = newWidth + 'px';
}

function rotate(matrix, clockwise) {
  // transpose
  for (let y = 0; y < tetromino.data.length; y++) {
    for (let x = 0; x < y; x++) {
      [
        tetromino.data[x][y],
        tetromino.data[y][x]
      ] = [
        tetromino.data[y][x],
        tetromino.data[x][y]
      ]
    }
  }

  if (clockwise) { // reverse items in each row
    tetromino.data.forEach((row) => { row.reverse(); })
  }
  else { // reverse rows
    tetromino.data.reverse();
  }
}

function tetrominoMoveDown() {
  tetromino.pos.y++;
  tetromino.timer = 0;
  if (collide()) {
    tetromino.pos.y--;
    merge();
    // take the next tetromino from queue and move it to top of the screen
    tetromino.data = queue.shift();
    tetromino.pos.y = 0;
    tetromino.pos.x = (ARENA_WIDTH / (2 * BLOCK_SIZE) - tetromino.data[0].length) | 0;
    queue.push(createRandomTetromino());
  }
}

function tetrominoMoveLeft() {
  tetromino.pos.x--;
  
  if (collide()) {
    tetromino.pos.x++;
  }
}

function tetrominoMoveRight() {
  tetromino.pos.x++;
  
  if (collide()) {
    tetromino.pos.x--;
  }
}

function tetrominoRotate() {
  rotate(tetromino.data, true);
  if (!collide()) { return; }
  /*
  ** Above rotation may not be possible due to collision,
  ** e.g. an "I" in between of many tetrominos.
  ** In this case we try to avoid collision after rotation,
  ** but after 8 attempts, we know we can never make it,
  ** hence we restore the x coordinate
  */
  const ox = tetromino.pos.x;
  let offset = 1;
  for (let i = 0; i < 8; i++) {
    tetromino.pos.x += offset;
    if (!collide()) { return; }
    offset = - (offset + (offset > 0 ? 1 : -1));
  }
  // rotation not possible, restore data back
  tetromino.pos.x = ox;
  rotate(tetromino.data, false);
}

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  
  if ((tetromino.timer = tetromino.timer + deltaTime) >= FALL_INTERVAL) {
    tetrominoMoveDown();  
  }

  // draw arena (background)
  drawArena();
  
  drawGrids();
  
  drawTetromino(tetromino.pos, tetromino.data);
  
  requestAnimationFrame(update);
}

onresize = debounce(resizeGame, 500, false);

onload = resizeGame;

onkeydown = function(evt) {
  if (evt.keyCode == 37) { // ArrowLeft
    tetrominoMoveLeft();
  }
  if (evt.keyCode == 38) { // ArrowUp
    tetrominoRotate();
  }
  else if (evt.keyCode == 39) { // ArrowRight
    tetrominoMoveRight();
  }
  else if (evt.keyCode == 40) { // ArrowDown
    tetrominoMoveDown();
  }
}

resetGame();
update();