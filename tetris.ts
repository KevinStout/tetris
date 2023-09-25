let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let gameBoardArrayHeight: number = 20;
let gameBoardArrayWidth: number = 12;
let startX: number = 4;
let startY: number = 0;
let score: number = 0;
let level: number = 1;
let winOrLose: string = "Playing";
let tetrisLogo: HTMLImageElement;
let coordinateArray: Coordinates[][] = Array.from({ length: gameBoardArrayHeight }, () => Array(gameBoardArrayWidth).fill(new Coordinates(0, 0)));
let curTetromino: number[][] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
];

let tetrominos: number[][][] = [];
let tetrominoColors: string[] = ["purple", "cyan", "blue", "yellow", "orange", "green", "red"];
let curTetrominoColor: string;

let gameBoardArray: number[][] = Array.from({ length: gameBoardArrayHeight }, () => Array(gameBoardArrayWidth).fill(0));

let stoppedShapeArray: (number | string)[][] = Array.from({ length: gameBoardArrayHeight }, () => Array(gameBoardArrayWidth).fill(0));

enum DIRECTION {
  IDLE = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
}
let direction: DIRECTION;

class Coordinates {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

document.addEventListener("DOMContentLoaded", SetupCanvas);

function CreateCoordArray() {
  let i: number = 0,
    j: number = 0;
  for (let y: number = 9; y <= 446; y += 23) {
    for (let x: number = 11; x <= 264; x += 23) {
      coordinateArray[i][j] = new Coordinates(x, y);
      i++;
    }
    j++;
    i = 0;
  }
}

function SetupCanvas() {
  canvas = document.getElementById("my-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 936;
  canvas.height = 956;

  ctx.scale(2, 2);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "white";
  ctx.strokeRect(8, 8, 280, 462);

  tetrisLogo = new Image(161, 56);
  tetrisLogo.onload = DrawTetrisLogo;
  tetrisLogo.src = "tetrisLogo.png";

  ctx.fillStyle = "white";
  ctx.font = "21px Arial";
  ctx.fillText("SCORE", 300, 98);
  ctx.strokeRect(300, 107, 161, 24);
  ctx.fillText(score.toString(), 310, 127);

  ctx.fillText("LEVEL", 300, 157);
  ctx.strokeRect(300, 171, 161, 24);
  ctx.fillText(level.toString(), 310, 190);

  ctx.fillText("WIN / LOSE", 300, 221);
  ctx.fillText(winOrLose, 310, 261);

  ctx.strokeRect(300, 232, 161, 95);

  ctx.fillText("CONTROLS", 300, 354);
  ctx.strokeRect(300, 366, 161, 104);

  ctx.font = "19px Arial";
  ctx.fillText("A : Move Left", 310, 388);
  ctx.fillText("D : Move Right", 310, 413);
  ctx.fillText("S : Move Down", 310, 438);
  ctx.fillText("E : Rotate Right", 310, 463);

  document.addEventListener("keydown", HandleKeyPress);
  CreateTetrominos();
  CreateTetromino();

  CreateCoordArray();
  DrawTetromino();
}

function DrawTetrisLogo() {
  ctx.drawImage(tetrisLogo, 300, 8, 161, 56);
}

function DrawTetromino() {
  for (let i = 0; i < curTetromino.length; i++) {
    let x = curTetromino[i][0] + startX;
    let y = curTetromino[i][1] + startY;
    gameBoardArray[x][y] = 1;
    let coorX = coordinateArray[x][y].x;
    let coorY = coordinateArray[x][y].y;
    ctx.fillStyle = curTetrominoColor;
    ctx.fillRect(coorX, coorY, 21, 21);
  }
}

function HandleKeyPress(key: KeyboardEvent) {
  if (winOrLose != "Game Over") {
    if (key.keyCode === 65) {
      direction = DIRECTION.LEFT;
      if (!HittingTheWall() && !CheckForHorizontalCollision()) {
        DeleteTetromino();
        startX--;
        DrawTetromino();
      }
    } else if (key.keyCode === 68) {
      direction = DIRECTION.RIGHT;
      if (!HittingTheWall() && !CheckForHorizontalCollision()) {
        DeleteTetromino();
        startX++;
        DrawTetromino();
      }
    } else if (key.keyCode === 83) {
      MoveTetrominoDown();
    } else if (key.keyCode === 69) {
      RotateTetromino();
    }
  }
}

function CheckForHorizontalCollision(): boolean {
  let tetrominoCopy: number[][] = curTetromino;
  let collision: boolean = false;
  for (let i = 0; i < tetrominoCopy.length; i++) {
    let square = tetrominoCopy[i];
    let x = square[0] + startX;
    let y = square[1] + startY;
    if (direction === DIRECTION.LEFT) {
      x--;
    } else if (direction === DIRECTION.RIGHT) {
      x++;
    }
    let stoppedShapeVal = stoppedShapeArray[x][y];
    if (typeof stoppedShapeVal === "string") {
      collision = true;
      break;
    }
  }
  return collision;
}

function CheckForVerticalCollision(): boolean {
  let tetrominoCopy: number[][] = curTetromino;
  let collision: boolean = false;
  for (let i = 0; i < tetrominoCopy.length; i++) {
    let square = tetrominoCopy[i];
    let x = square[0] + startX;
    let y = square[1] + startY;
    if (direction === DIRECTION.DOWN) {
      y++;
    }

    if (typeof stoppedShapeArray[x][y + 1] === "string") {
      DeleteTetromino();
      startY++;
      DrawTetromino();
      collision = true;
      break;
    }
    if (y >= 20) {
      collision = true;
      break;
    }
  }
  if (collision) {
    if (startY <= 2) {
      winOrLose = "Game Over";
      ctx.fillStyle = "black";
      ctx.fillRect(310, 242, 140, 50);
      ctx.fillStyle = "white";
      ctx.fillText(winOrLose, 310, 261);
    } else {
      for (let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
        stoppedShapeArray[x][y] = curTetrominoColor;
      }
      CheckForCompletedRows();
      CreateTetromino();
      direction = DIRECTION.IDLE;
      startX = 4;
      startY = 0;
      DrawTetromino();
    }
  }
  return collision;
}

function MoveTetrominoDown() {
  direction = DIRECTION.DOWN;
  if (!CheckForVerticalCollision()) {
    DeleteTetromino();
    startY++;
    DrawTetromino();
  }
}

window.setInterval(function () {
  if (winOrLose != "Game Over") {
    MoveTetrominoDown();
  }
}, 1000);

function DeleteTetromino() {
  for (let i = 0; i < curTetromino.length; i++) {
    let x = curTetromino[i][0] + startX;
    let y = curTetromino[i][1] + startY;
    gameBoardArray[x][y] = 0;
    let coorX = coordinateArray[x][y].x;
    let coorY = coordinateArray[x][y].y;
    ctx.fillStyle = "black";
    ctx.fillRect(coorX, coorY, 21, 21);
  }
}

function CreateTetrominos() {
  // Push T
  tetrominos.push([
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  // Push I
  tetrominos.push([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
  // Push J
  tetrominos.push([
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  // Push Square
  tetrominos.push([
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]);
  // Push L
  tetrominos.push([
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  // Push S
  tetrominos.push([
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ]);
  // Push Z
  tetrominos.push([
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ]);
}

function CreateTetromino() {
  let randomTetromino: number = Math.floor(Math.random() * tetrominos.length);
  curTetromino = tetrominos[randomTetromino];
  curTetrominoColor = tetrominoColors[randomTetromino];
}

function HittingTheWall(): boolean {
  for (let i = 0; i < curTetromino.length; i++) {
    let newX = curTetromino[i][0] + startX;
    if (newX <= 0 && direction === DIRECTION.LEFT) {
      return true;
    } else if (newX >= 11 && direction === DIRECTION.RIGHT) {
      return true;
    }
  }
  return false;
}

function CheckForCompletedRows() {
  let rowsToDelete: number = 0;
  let startOfDeletion: number = 0;
  for (let y = 0; y < gameBoardArrayHeight; y++) {
    let completed: boolean = true;
    for (let x = 0; x < gameBoardArrayWidth; x++) {
      let square = stoppedShapeArray[x][y];
      if (square === 0 || typeof square === "undefined") {
        completed = false;
        break;
      }
    }

    if (completed) {
      if (startOfDeletion === 0) startOfDeletion = y;
      rowsToDelete++;
      for (let i = 0; i < gameBoardArrayWidth; i++) {
        stoppedShapeArray[i][y] = 0;
        gameBoardArray[i][y] = 0;
        let coorX = coordinateArray[i][y].x;
        let coorY = coordinateArray[i][y].y;
        ctx.fillStyle = "black";
        ctx.fillRect(coorX, coorY, 21, 21);
      }
    }
  }
  if (rowsToDelete > 0) {
    score += 10;
    ctx.fillStyle = "black";
    ctx.fillRect(310, 107, 140, 24);
    ctx.fillStyle = "white";
    ctx.fillText(score.toString(), 310, 127);
    MoveAllRowsDown(rowsToDelete, startOfDeletion);
  }
}

function MoveAllRowsDown(rowsToDelete: number, startOfDeletion: number) {
  for (let i = startOfDeletion - 1; i >= 0; i--) {
    for (let x = 0; x < gameBoardArrayWidth; x++) {
      let y2 = i + rowsToDelete;
      let square = stoppedShapeArray[x][i];
      let nextSquare = stoppedShapeArray[x][y2];
      if (typeof square === "string") {
        nextSquare = square;
        gameBoardArray[x][y2] = 1;
        stoppedShapeArray[x][y2] = square;
        let coorX = coordinateArray[x][y2].x;
        let coorY = coordinateArray[x][y2].y;
        ctx.fillStyle = nextSquare;
        ctx.fillRect(coorX, coorY, 21, 21);

        square = 0;
        gameBoardArray[x][i] = 0;
        stoppedShapeArray[x][i] = 0;
        coorX = coordinateArray[x][i].x;
        coorY = coordinateArray[x][i].y;
        ctx.fillStyle = "black";
        ctx.fillRect(coorX, coorY, 21, 21);
      }
    }
  }
}

function RotateTetromino() {
  let newRotation: number[][] = new Array();
  let tetrominoCopy: number[][] = curTetromino;
  let curTetrominoBU: number[][];
  for (let i = 0; i < tetrominoCopy.length; i++) {
    curTetrominoBU = [...curTetromino];
    let x = tetrominoCopy[i][0];
    let y = tetrominoCopy[i][1];
    let newX = GetLastSquareX() - y;
    let newY = x;
    newRotation.push([newX, newY]);
  }
  DeleteTetromino();
  try {
    curTetromino = newRotation;
    DrawTetromino();
  } catch (e) {
    if (e instanceof TypeError) {
      curTetromino = curTetrominoBU;
      DeleteTetromino();
      DrawTetromino();
    }
  }
}

function GetLastSquareX(): number {
  let lastX: number = 0;
  for (let i = 0; i < curTetromino.length; i++) {
    let square = curTetromino[i];
    if (square[0] > lastX) lastX = square[0];
  }
  return lastX;
}
