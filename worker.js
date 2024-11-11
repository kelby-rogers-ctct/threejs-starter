let canvas, ctx;
let squareSize;
let canvasWidth;
onmessage = (evt) => {
  // console.log("Message received from main", evt.data);
  if (evt.data.canvas) {
    canvas = evt.data.canvas;
    ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    postMessage({ complete: true });
  }

  if (evt.data.draw) {
    drawCheckerBoard(evt.data.boardSize);
  }
};

async function drawCheckerBoard(boardSize) {
  // console.log("drawing", boardSize);
  const random24 = Math.round(Math.random() * 0xfffff);
  const color = numberToHexString(random24);
  squareSize = canvasWidth / boardSize;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      ctx.fillStyle = (row + col) % 2 ? color : "#000000";
      ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
    }
    new Promise((resolve) => setTimeout(resolve, 0));
  }
  postMessage({ complete: true });
}

function numberToHexString(number, digits = 6) {
  const hex = number.toString(16);
  return "#" + hex.padStart(digits, "0");
}
