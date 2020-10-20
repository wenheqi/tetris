const ARENA_WIDTH = 240; // in pixels
const ARENA_HEIGHT = 400; // in pixels

const canvas = document.createElement("canvas");

// NOTE: in current design canvas size is the same as arena's
canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;
canvas.id="tetris-canvas";

document.getElementById("container").appendChild(canvas);

const ctx = canvas.getContext("2d");

ctx.fillStyle = "limegreen";
ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

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

onresize = debounce(resizeGame, 250, false);

onload = resizeGame;
