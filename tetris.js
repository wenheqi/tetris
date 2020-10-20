const ARENA_WIDTH = 240; // in pixels
const ARENA_HEIGHT = 400; // in pixels

const canvas = document.createElement("canvas");

// NOTE: in current design canvas size is the same as arena's
canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;
canvas.id="tetris-canvas";

document.getElementById("container").appendChild(canvas);

const ctx = canvas.getContext("2d");

ctx.fillStyle = "#000";
ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);


/* View in fullscreen */
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

/* Exit fullscreen */
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

function resizeGame(evt) {
  console.log("im in resize game")
  /* ratio = arena height / (arena width + stat panel width)
  ** ratio = 400 / (240 + 60) = 400 / 300 = 4 / 3
  */
  const ratio = 4 / 3;
  const newRatio = innerHeight / innerWidth;
  if (newRatio > ratio) {
    var newHeight = ratio * innerWidth;
    var newWidth = innerWidth;
  }
  else {
    var newHeight = innerHeight;
    var newWidth = innerHeight / ratio;
  }
  const elem = document.getElementById("container");
  elem.style.height = newHeight + 'px';
  elem.style.width = newWidth + 'px';
}

function debounce(fn) {
  
}

onresize = function(evt) {
  setTimeout(resizeGame, 500);
}

onload = resizeGame;