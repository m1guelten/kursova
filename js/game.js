'use strict';

const canvas = document.getElementById('chess');
const ctx = canvas.getContext('2d');

const loadImages = (imageFiles) => {
  const images = new Map();
  for (const fileName of imageFiles) {
    const [name] = fileName.split('.');
    const image = new Image();
    image.src = 'img/' + fileName;
    images.set(name, image);
  }
  return images;
};

const spriteFiles = [
  'ground.jpg',
  'dices0.png',
  'dices1.png',
  'dices2.png',
  'dices3.png',
  'dices4.png',
  'dices5.png',
  'dices6.png',
  'checkersBlack.png',
  'checkersWhite.png',
];

const sprites = loadImages(spriteFiles);

const BOX = 80;
const ST_NUM_X = BOX / 2 - 10;
const ST_NUM_Y = BOX / 2;
const ST_X = BOX / 2 - 5;
const ST_Y = 3 * BOX - 5;
const ST_TEXT_X = 4 * BOX;
const ST_TEXT_Y = 1.3 * BOX;
const ST_WIN_X = ST_TEXT_X - BOX;
const ST_WIN_Y = ST_TEXT_Y * 2;
const KOORD_DICE_X = 30;
const KOORD_DICE_Y = 30;
const MAX_NUMBER_MOVES = 32;
const FULL_CIRCLE = 28;
const MAX_MOVE_DOWN = 7;
const MAX_MOVE_RIGHT = 14;
const MAX_MOVE_UP = 21;
const BIAS = 14;
const NUMBER_FISHKA = 4;
const DOZVIL_FISHKA = NUMBER_FISHKA * 2;
const ST_DELTA = 6;
const ST_DOZVIL = false;
const MAX_ARREY_FISHKA = 1 + NUMBER_FISHKA * 3;

const play = [
  'White',
  'Black',
  'fishka_W',
  'fishka_B',
  'koordW',
  'koordB',
  'checkersWhite',
  'checkersBlack',
];

const gameLet = {
  player: 0,
  step: 0,
  testMove: 0,
  move: 0,
  dir: -1,
  space: true,
  fishka: 'fishka_W',
};

const fishka_B = new Array(MAX_ARREY_FISHKA);
const fishka_W = new Array(MAX_ARREY_FISHKA);

const startFishka = (array) => {
  for (let i = 0; i < array.length; i++) {
    if (i <= NUMBER_FISHKA) array[i] = 0;
    else if (i <= DOZVIL_FISHKA) array[i] = ST_DELTA;
    else array[i] = ST_DOZVIL;
  }
};

startFishka(fishka_B);
startFishka(fishka_W);

const koordB = new Array(MAX_NUMBER_MOVES);
const koordW = new Array(MAX_NUMBER_MOVES);

for (let i = 0; i <= FULL_CIRCLE; i++) {
  if (i <= MAX_MOVE_DOWN) koordB[i] = { x: ST_X, y: ST_Y + BOX * i };
  else if (i <= MAX_MOVE_RIGHT)
    koordB[i] = {
      x: ST_X + BOX * (i - MAX_MOVE_DOWN),
      y: ST_Y + BOX * MAX_MOVE_DOWN,
    };
  else if (i <= MAX_MOVE_UP)
    koordB[i] = {
      x: ST_X + BOX * MAX_MOVE_DOWN,
      y: ST_Y + BOX * (MAX_MOVE_UP - i),
    };
  else koordB[i] = { x: ST_X + BOX * (FULL_CIRCLE - i), y: ST_Y };
  i < BIAS ? (koordW[i + BIAS] = koordB[i]) : (koordW[i - BIAS] = koordB[i]);
}
koordW[FULL_CIRCLE] = koordW[0];
for (let i = 1; i < MAX_NUMBER_MOVES - FULL_CIRCLE; i++) {
  koordB[i + FULL_CIRCLE] = { x: ST_X + BOX * i, y: ST_Y + BOX * i };
  koordW[i + FULL_CIRCLE] = {
    x: ST_X + BOX * (MAX_MOVE_DOWN - i),
    y: ST_Y + BOX * (MAX_MOVE_DOWN - i),
  };
}

document.addEventListener('keydown', direction);
const valueKey = [32, 49, 50, 51, 52];
function direction(event) {
  for (let i = 0; i < valueKey.length; i++) {
    if (event.keyCode === valueKey[i]) gameLet.dir = i;
  }
}

const next = () => {
  if (gameLet.player === 0) gameLet.player = 1;
  else gameLet.player = 0;
};

const random = () => Math.floor(Math.random() * 6) + 1;

const drive = () => {
  gameLet.step = random();
  gameLet.dir = -1;
};

const styleText = (color, font) => {
  ctx.fillStyle = color;
  ctx.font = font;
};

const playChange = (func) => {
  if (gameLet.player === 0) func(fishka_W, fishka_B, gameLet.dir);
  else func(fishka_B, fishka_W, gameLet.dir);
};

const testBeat = (colorB) => {
  let beat;
  if (gameLet.move <= BIAS) beat = gameLet.move + BIAS;
  else if (gameLet.move <= FULL_CIRCLE) beat = gameLet.move - BIAS;
  else return;

  let beat2 = beat;
  if (beat === FULL_CIRCLE) beat2 = 0;
  for (let i = 1; i <= colorB[0]; i++) {
    if (beat === colorB[i] || beat2 === colorB[i]) {
      for (let j = i; j <= colorB[0]; j++) {
        colorB[j] = colorB[j + 1];
        colorB[j + NUMBER_FISHKA] = colorB[j + NUMBER_FISHKA + 1];
        colorB[j + DOZVIL_FISHKA] = colorB[j + DOZVIL_FISHKA + 1];
      }
      colorB[colorB[0]] = 0;
      colorB[colorB[0] + NUMBER_FISHKA] = ST_DELTA;
      colorB[colorB[0] + DOZVIL_FISHKA] = ST_DOZVIL;
      colorB[0]--;
    }
  }
};

const endNewFishka = (colorA, colorB, dirN) => {
  gameLet.testMove = 0;
  run(colorA, colorB, dirN);
};

const bornChecker = (colorA, colorB) => {
  for (let i = 1; i <= colorB[0]; i++) {
    if (colorB[i] === BIAS) {
      gameLet.move = 0;
      testBeat(colorB);
    }
  }
  gameLet.dir = -1;
  gameLet.space = true;
  colorA[0]++;
  colorA[colorA[0] + DOZVIL_FISHKA] = true;
  delta(colorA, colorB);
};

const newFishka = (colorA, colorB, dirN) => {
  if (colorA[0] === NUMBER_FISHKA) {
    endNewFishka(colorA, colorB, dirN);
    return;
  } else if (colorA[0] === 0) {
    bornChecker(colorA, colorB);
    return;
  } else {
    let testDelta = 0;
    for (let i = 1; i <= colorA[0]; i++) {
      if (colorA[i + NUMBER_FISHKA] >= gameLet.step) testDelta++;
      if (colorA[i] === 0 || colorA[i] === FULL_CIRCLE) {
        endNewFishka(colorA, colorB, dirN);
        return;
      }
    }
    gameLet.space = false;
    if (testDelta === 0 || dirN === colorA[0] + 1) {
      bornChecker(colorA, colorB);
      return;
    }
    if (dirN > 0) {
      if (colorA[dirN + DOZVIL_FISHKA] === false) return;
      endNewFishka(colorA, colorB, dirN);
    }
  }
};

const delta = (colorA, colorB) => {
  let min = 0;
  let max = MAX_NUMBER_MOVES;
  if (colorA[colorA[0]] === 0) {
    max = FULL_CIRCLE;
    for (let i = 0; i < colorA[0]; i++) {
      if (colorA[i] > FULL_CIRCLE) min++;
    }
  }
  if (min === 3) {
    min = 0;
    max = MAX_NUMBER_MOVES;
  }

  for (let i = min + 2; i <= colorA[0]; i++) {
    colorA[i + NUMBER_FISHKA] = colorA[i - 1] - colorA[i] - 1;
  }
  colorA[min + NUMBER_FISHKA + 1] = max - colorA[min + 1] - 1;
  if (min > 0) colorA[5] = MAX_NUMBER_MOVES - colorA[1] - 1;
  if (min === 2) colorA[6] = colorA[1] - colorA[2] - 1;

  for (let j = 1; j <= colorA[0]; j++) {
    for (let i = 1; i <= colorB[0]; i++) {
      if (colorB[i] <= BIAS) max = colorB[i] + BIAS - colorA[j];
      else if (colorB[i] <= FULL_CIRCLE) max = colorB[i] - BIAS - colorA[j];
      if (max > 0 && max < colorA[j + NUMBER_FISHKA])
        colorA[j + NUMBER_FISHKA] = max;
    }
  }
};

const testMoveFishka = (colorA) => {
  if (gameLet.testMove === 0) {
    for (let i = 1; i <= colorA[0]; i++) {
      if (gameLet.step <= colorA[i + NUMBER_FISHKA]) {
        colorA[i + DOZVIL_FISHKA] = true;
        gameLet.testMove++;
      } else colorA[i + DOZVIL_FISHKA] = false;
    }
  }
};

const endRun = (colorA, colorB) => {
  gameLet.testMove = 0;
  delta(colorA, colorB);
  gameLet.space = true;
  next();
};

const run = (colorA, colorB, dirN = -1) => {
  delta(colorA, colorB);
  testMoveFishka(colorA);

  if (gameLet.testMove > 1) gameLet.space = false;
  if (gameLet.testMove === 0) next();
  if (gameLet.testMove === 1) {
    for (let i = 1; i <= colorA[0]; i++) {
      if (colorA[i + DOZVIL_FISHKA] === true) {
        gameLet.move = colorA[i] + gameLet.step;
        testBeat(colorB);
        colorA[i] += gameLet.step;
      }
    }
    endRun(colorA, colorB);
  }
  if (gameLet.testMove > 1 && dirN > 0) {
    if (colorA[dirN + DOZVIL_FISHKA] === false) return;
    gameLet.move = colorA[dirN] + gameLet.step;
    testBeat(colorB);
    colorA[dirN] += gameLet.step;
    endRun(colorA, colorB);
  }
};

const gameOver = () => {
  next();
  styleText('white', '100px Arial');
  ctx.fillText(play[gameLet.player], ST_TEXT_X, ST_TEXT_Y);
  ctx.fillText('WINNER', ST_WIN_X, ST_WIN_Y);
  clearInterval(game);
};

const painting = (player) => {
  const noPlayer = player + Math.pow(-1, player);
  const checker = play[player + 6];
  const koord = eval(play[player + 4]);
  gameLet.fishka = eval(play[player + 2]);

  styleText('white', '100px Arial');
  ctx.fillText(play[player], ST_TEXT_X, ST_TEXT_Y);

  for (let i = 1; i <= fishka_W[0]; i++) {
    ctx.drawImage(
      sprites.get('checkersWhite'),
      koordW[fishka_W[i]].x,
      koordW[fishka_W[i]].y
    );
  }
  for (let i = 1; i <= fishka_B[0]; i++) {
    ctx.drawImage(
      sprites.get('checkersBlack'),
      koordB[fishka_B[i]].x,
      koordB[fishka_B[i]].y
    );
  }
  for (let i = 1; i <= gameLet.fishka[0]; i++) {
    if (gameLet.fishka[i + DOZVIL_FISHKA] === true && gameLet.space === false) {
      styleText(play[noPlayer], '20px Arial');
      ctx.fillText(
        i,
        koord[gameLet.fishka[i]].x + ST_NUM_X,
        koord[gameLet.fishka[i]].y + ST_NUM_Y
      );
    }
  }
};

const controlDiceSix = () => {
  if (gameLet.step !== 6) {
    if (gameLet.fishka[0] !== 0) playChange(run);
    else next();
  } else playChange(newFishka);
};

function drawGame() {
  ctx.drawImage(sprites.get('ground'), 0, 0);
  ctx.drawImage(
    sprites.get(`dices${gameLet.step}`),
    KOORD_DICE_X,
    KOORD_DICE_Y
  );
  if (
    fishka_B[NUMBER_FISHKA] === FULL_CIRCLE ||
    fishka_W[NUMBER_FISHKA] === FULL_CIRCLE
  )
    gameOver();

  painting(gameLet.player);

  if (gameLet.fishka[0] === 0) {
    if (gameLet.dir === 0) {
      drive();
      controlDiceSix();
    }
  }
  if (gameLet.fishka[0] !== 0) {
    playChange(delta);
    if (gameLet.dir === 0 && gameLet.space === true) {
      drive();
      controlDiceSix();
    }
    if (gameLet.dir > 0 && gameLet.space === false) controlDiceSix();
  }
}

let game = setInterval(drawGame, 500);
