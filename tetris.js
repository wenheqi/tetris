const ARENA_WIDTH = 240; // in pixels
const ARENA_HEIGHT = 400; // in pixels
const BLOCK_SIZE = 20; // basic tetromino block size, in pixels

const colors = [
  "#000000",
  "#FF0D72", // T
  "#0ACAF7", // O
  "#B1ED2F", // L
  "#F538FF", // J
  "#FF8E0D", // I
  "#FFE138", // S
  "#00B4AB", // Z
];

/*
** ref: https://harddrop.com/wiki/Tetris_Worlds
** 1G = 1 cell per frame
** Time = (0.8-((Level-1)*0.007))^(Level-1)
** Level 1: 0.01667G -> 1s
** Level 2: 0.021017G -> 0.793s
** Level 3: 0.026977G -> 0.617796s
** Level 4: 0.035256G -> 0.472729139s
** Level 5: 0.04693G -> 0.35519692825s
** Level 6: 0.06361G -> 0.26200354997s
** Level 7: 0.0879G -> 0.18967724533s
** Level 8: 0.1236G -> 0.13473473081s
** Level 9: 0.1775G -> 0.0938822489s
** Level 10: 0.2598G -> 0.06415158495s
** Level 11: 0.388G -> 0.04297625829s
** Level 12: 0.59G -> 0.0282176778ss
** Level 13: 0.92G -> 0.01815332854s
** Level 14: 1.46G -> 0.01143934234s
** Level 15: 2.36G -> 0.00705861622s
*/
const intervals = [
  0,
  1000,
  793,
  617.8,
  472.73,
  355.2,
  262,
  189.68,
  134.73,
  93.88,
  64.15,
  42.97,
  28.22,
  18.15,
  11.44,
  7.06,
]

const shapes = "TOLIJSZ";

const canvas = document.createElement("canvas");

// NOTE: in current design canvas size is the same as arena's
canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;
canvas.id="tetris-canvas";

document.getElementById("container").appendChild(canvas);

const nextCanvas = document.getElementById("next-canvas");
nextCanvas.width = 80;
nextCanvas.height = 80;

const ctx = canvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

const arena = createMatrix(ARENA_WIDTH / BLOCK_SIZE, ARENA_HEIGHT / BLOCK_SIZE, 0);

const modal = document.getElementById("modal");

var queue = [];

const player = {
  score: 0,
  isFullScreen: false,
  isGameOver: true,
  isPlaying: false,
  level: 1,
  lines: 0,
  playBGM: false,
  playSound: false,
}

const backgroundSound = new Sound("./tracks/bgm.mp3", true);
const successSound = new Sound("./tracks/power-up.wav");
const failureSound = new Sound("./tracks/failure.wav");

const tetromino = {
  data: [],
  lastTime: 0,
  pos: {x: 0, y: -4},
  timer: 0,
}

var lastMouseDownTime = 0;
var lastMousePos = {x: 0, y: 0};
var lastTetrominoPos = {x: 0, y: 0};
var isMouseMoving = false;

/*
** Check if there is (are) empty line(s) and remove it (them).
** In addition, calculate score according to https://tetris.wiki/Scoring.
*/
function clearCompleteLines() {
  let lines = 0;
  for (let y = arena.length - 1; y >= 0; y--) {
    if (!arena[y].includes(0)) { // complete line
      let row = arena.splice(y, 1)[0].fill(0);
      // put this row back to top
      arena.unshift(row);
      y++;
      lines++;
      if (player.playSound) { successSound.play(); }
    }
  }
  // calculate score
  if (lines === 1) { player.score += 100; }
  else if (lines === 2) { player.score += 300; }
  else if (lines === 3) { player.score += 500; }
  else if (lines === 4) { player.score += 800; }
  player.lines += lines;
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
        // tetromino is not in game scene yet,
        // but left & right may still collide
        if (ay < 0 && (ax < 0 || ax >= arena[0].length)) {
          return true;
        }
        // a non-empty block should not be out of boarder
        // or overlap with non-empty part of arena
        else if (ay >= 0 && (ax < 0 ||
            ax >= arena[0].length ||
            ay >= arena.length ||
            arena[ay][ax] !== 0
           )) {
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
      [0, 0, 0],
      [7, 7, 0],
      [0, 7, 7],
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

function displayStatPanel() {
  let best = localStorage ? localStorage.getItem("bestScore") : "--";
  document.getElementById("bestScore").innerHTML = best ? best : "0";
  document.getElementById("score").innerHTML = player.score;
  document.getElementById("line").innerHTML = player.lines;
  document.getElementById("level").innerHTML = player.level;

  // draw next tetromino
  drawNext();
  
  // draw play/resume button
  let playBtn = document.querySelector("div#play-btn i");
  if (player.isPlaying && playBtn.classList.contains("fa-play")) {
    playBtn.classList.remove("fa-play");
    playBtn.classList.add("fa-pause");
  }
  else if (!player.isPlaying && playBtn.classList.contains("fa-pause")) {
    playBtn.classList.remove("fa-pause");
    playBtn.classList.add("fa-play");
  }
}

function drawArena() {
  arena.forEach((row, y) => {
    row.forEach((val, x) => {
      drawBlock(ctx,
                x,
                y,
                BLOCK_SIZE,
                BLOCK_SIZE,
                colors[val]);
    })
  })
}

function drawBlock(ctx, x, y, width, height, color, thickness = 0, borderColor="grey") {
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

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawTetromino(nextCtx,
                {x: 2 - queue[0][0].length / 2,
                 y: 2 - queue[0].length / 2},
                queue[0]);
}

function drawTetromino(ctx, offset, matrix) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        drawBlock(ctx,
                  offset.x + x,
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

function harddrop() {
  if (!player.isPlaying || player.isGameOver) { return; }
  // tetromino is probably not in the game scene yet
  if (tetromino.pos.y < 0) { return; }
  do {
    // keep dropping current tetromino until the next one
    // is spawn
    tetrominoMoveDown();
  }
  while (tetromino.pos.y !== -4);
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
        // when merge one not in game scence, it implies the game is over
        if (ax < 0 || ay < 0) {
          player.isGameOver = true;
          player.isPlaying = false;
          backgroundSound.stop();
          if (player.playSound) { failureSound.play(); }
        }
        else {
          arena[ay][ax] = val;
        }
      }
    })
  })
  clearCompleteLines();
  // prevent following tetrominos piling up immediately
  if (isMouseMoving) { isMouseMoving = false; }
}

function playNewGame() {
  resetGame();
  player.isPlaying = true;
  backgroundSound.setPlaybackRate(1 + (player.level - 1) * 0.1);
  backgroundSound.setCurrentTime(0);
  if (player.playBGM) { backgroundSound.play(); }
}

function resetGame() {
  tetromino.data = createRandomTetromino();
  tetromino.pos.y = -4;
  tetromino.pos.x = (ARENA_WIDTH / (2 * BLOCK_SIZE) - tetromino.data[0].length / 2) | 0;
  tetromino.lastTime = 0;
  tetromino.timer = 0;
  queue = [];
  queue.push(createRandomTetromino());
  player.isGameOver = false;
  player.lines = 0;
  player.score = 0;
  player.isPlaying = false;
  arena.forEach(row => { row.fill(0); })
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

function Sound(src, loop = false, speed = 1) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.playbackRate = speed;
  this.sound.loop = loop;
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);

  this.pause = function() {
    this.sound.pause();
  }

  this.play = function() {
    this.sound.play();
  }

  this.setCurrentTime = function(curr) {
    this.sound.currentTime = curr;
  }

  this.setPlaybackRate = function(rate) {
    this.sound.playbackRate = rate;
  }

  this.stop = function() {
    this.sound.pause();
  }
}

function tetrominoMoveDown() {
  tetromino.pos.y++;
  tetromino.timer = 0;
  if (collide()) {
    tetromino.pos.y--;
    merge();
    if (player.isGameOver) { return; }
    // take the next tetromino from queue and move it to top of the screen
    tetromino.data = queue.shift();
    tetromino.pos.y = -4;
    tetromino.pos.x = (ARENA_WIDTH / (2 * BLOCK_SIZE) - tetromino.data[0].length / 2) | 0;
    queue.push(createRandomTetromino());
    // game might be over at this time
    if (collide()) {
      tetromino.pos.y--;
      player.isGameOver = true;
      player.isPlaying = false;
      backgroundSound.stop();
      if (player.playSound) { failureSound.play(); }
    }
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

/* Move tetromino to target position */
function tetrominoMoveTo(tarX, tarY) {
  while (tarX != tetromino.pos.x) {
    let oldX = tetromino.pos.x;
    if (tarX < tetromino.pos.x) {
      tetrominoMoveLeft();
    }
    else {
      tetrominoMoveRight();
    }
    if (oldX === tetromino.pos.x) { break; }
  }
  while (tarY != tetromino.pos.y) {
    let oldY = tetromino.pos.y;
    // only downward is allowed
    if (tarY > tetromino.pos.y) {
      tetrominoMoveDown();
      // move upward or new tetromino is spawn
      if (oldY === tetromino.pos.y ||
         tetromino.pos.y === -4) {
        break;
      }
    }
    else {
      break;
    }
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

function update(time = 0) {
  const deltaTime = time - tetromino.lastTime;
  tetromino.lastTime = time;
  
  if (!player.isGameOver &&
      player.isPlaying &&
      (tetromino.timer = tetromino.timer + deltaTime) >= intervals[player.level]) {
    tetrominoMoveDown();  
  }

  // draw arena (background)
  drawArena();
  
  // draw grids
  drawGrids();
  
  // draw tetromino
  drawTetromino(ctx, tetromino.pos, tetromino.data);
  
  displayStatPanel();

  if (player.isGameOver) {
    updateScore();
  }

  requestAnimationFrame(update);
}

function updateScore() {
  if (localStorage) {
    let currBest = localStorage.getItem("bestScore");
    if (!currBest || currBest < player.score) {
      localStorage.setItem("bestScore", player.score);
    }
  }
}

onclick = function(evt) {
  // close the modal window when click on it
  if (evt.target === modal) {
    modal.style.display = "none";
  }
}

onresize = debounce(resizeGame, 500, false);

onload = resizeGame;

onkeydown = function(evt) {
  if (player.isGameOver || !player.isPlaying) { return; }
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

document.getElementById("restart-btn").onclick = (evt) => {
  playNewGame();
}

document.getElementById("setting-btn").onclick = (evt) => {
  modal.style.display = "block";
  if (player.isPlaying) {
    // pause game in settings screen
    document.getElementById("play-btn").dispatchEvent(new Event("click"));
  }
}

document.getElementById("play-btn").onclick = (evt) => {
  // start a new game
  if (player.isGameOver && !player.isPlaying) {
    playNewGame();
  }
  else { // toggle play/resume status
    player.isPlaying = !player.isPlaying;
    if (player.playBGM) {
      player.isPlaying ? backgroundSound.play() : backgroundSound.pause();  
    }
  }
}

document.getElementById("modal-close-btn").onclick = (evt) => {
  modal.style.display = "none";
}

document.getElementById("decLevel").onclick = (evt) => {
  if (player.level > 1) { player.level--; }
  document.getElementById("levelVal").textContent = player.level;
}

document.getElementById("incLevel").onclick = (evt) => {
  if (player.level < 15) { player.level++; }
  document.getElementById("levelVal").textContent = player.level;
}

document.getElementById("bgm-toggle-btn").onclick = (evt) => {
  player.playBGM = !player.playBGM;
  // check
  if (player.playBGM) {
    evt.target.classList.remove("fa-square");
    evt.target.classList.add("fa-check-square");
    if (!player.isGameOver && player.isPlaying) {
      backgroundSound.play();
    }
  }
  // uncheck
  else {
    evt.target.classList.remove("fa-check-square");
    evt.target.classList.add("fa-square");
    backgroundSound.stop();
  }
}

document.getElementById("sound-toggle-btn").onclick = (evt) => {
  player.playSound = !player.playSound;
  // check
  if (player.playSound) {
    evt.target.classList.remove("fa-square");
    evt.target.classList.add("fa-check-square");
  }
  // uncheck
  else {
    evt.target.classList.remove("fa-check-square");
    evt.target.classList.add("fa-square");
  }
}

document.getElementById("fullscreen-toggle-btn").onclick = (evt) => {
  player.isFullScreen = !player.isFullScreen;
  // check
  if (player.isFullScreen) {
    evt.target.classList.remove("fa-square");
    evt.target.classList.add("fa-check-square");
    enterFullscreen();
  }
  // uncheck
  else {
    evt.target.classList.remove("fa-check-square");
    evt.target.classList.add("fa-square");
    exitFullscreen();
  }
}

canvas.onmousedown = (evt) => {
  if (!player.isPlaying || player.isGameOver) { return; }
  lastMouseDownTime = evt.timeStamp;
  isMouseMoving = true;
  lastTetrominoPos.x = tetromino.pos.x;
  lastTetrominoPos.y = tetromino.pos.y;
  lastMousePos.x = evt.offsetX;
  lastMousePos.y = evt.offsetY;
}

canvas.onmousemove = (evt) => {
  if (!player.isPlaying || player.isGameOver) { return; }
  if (!isMouseMoving) { return; }
  const rect = canvas.getBoundingClientRect();
  // pixel per block
  const ppb = BLOCK_SIZE * rect.height / ARENA_HEIGHT;
  const dy = ((evt.offsetY - lastMousePos.y) / ppb) | 0;
  const dx = ((evt.offsetX - lastMousePos.x) / ppb) | 0;
  tetrominoMoveTo(lastTetrominoPos.x + dx, lastTetrominoPos.y + dy);
};

canvas.onmouseup = (evt) => {
  if (!player.isPlaying || player.isGameOver) { return; }
  isMouseMoving = false;
  let deltaMouseTime = evt.timeStamp - lastMouseDownTime;
  const rect = canvas.getBoundingClientRect();
  // pixel per block
  const ppb = BLOCK_SIZE * rect.height / ARENA_HEIGHT;
  const dy = ((evt.offsetY - lastMousePos.y) / ppb) | 0;
  // fast downward swipe
  debugger
  if (dy >= 4 && deltaMouseTime < 300) {
    harddrop();
  }
  // short single click
  else if (deltaMouseTime < 200) {
    tetrominoRotate();
  }
}

canvas.onmouseleave = (evt) => {
  if (!player.isPlaying || player.isGameOver) { return; }
  isMouseMoving = false;
}

canvas.ontouchstart = (evt) => {
  const rect = canvas.getBoundingClientRect();
  lastMouseDownTime = Date.now();
  isMouseMoving = true;
  lastTetrominoPos.x = tetromino.pos.x;
  lastTetrominoPos.y = tetromino.pos.y;
  lastMousePos.x = evt.changedTouches[0].clientX - rect.left;
  lastMousePos.y = evt.changedTouches[0].clientY - rect.top;
}

canvas.ontouchend = (evt) => {
  if (!player.isPlaying || player.isGameOver) { return; }
  isMouseMoving = false;
  let deltaMouseTime = Date.now() - lastMouseDownTime;
  const rect = canvas.getBoundingClientRect();
  // pixel per block
  const ppb = BLOCK_SIZE * rect.height / ARENA_HEIGHT;
  const offsetY = evt.changedTouches[0].clientY - rect.top;
  const dy = ((offsetY - lastMousePos.y) / ppb) | 0;
  // fast downward swipe
  if (dy >= 4 && deltaMouseTime < 300) {
    harddrop();
  }
  // short single click
  else if (deltaMouseTime < 200) {
    tetrominoRotate();
  }
}

canvas.ontouchmove = (evt) => {
  const rect = canvas.getBoundingClientRect();
  if (!player.isPlaying || player.isGameOver) { return; }
  if (!isMouseMoving) { return; }
  // pixel per block
  const ppb = BLOCK_SIZE * rect.height / ARENA_HEIGHT;
  const offsetX = evt.changedTouches[0].clientX - rect.left;
  const offsetY = evt.changedTouches[0].clientY - rect.top;
  const dy = ((offsetY - lastMousePos.y) / ppb) | 0;
  const dx = ((offsetX - lastMousePos.x) / ppb) | 0;
  tetrominoMoveTo(lastTetrominoPos.x + dx, lastTetrominoPos.y + dy);
}

resetGame();

update();
