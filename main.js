var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var gridWidth = 960;
var gridHeight = 560;
var boxSize = 80;
var gridXLimit = 11;
var gridYLimit = 6;
var currentLevel;

var playerXBox = 0;
var playerYBox = 0;
var playerSum = 0;


class Level {
  constructor(playerX, playerY, walls, pickups, finishX, finishY, finishSum){
    playerXBox = playerX;
    this.playerXStart = playerX;
    playerYBox = playerY;
    this.playerYStart = playerY;
    this.walls = walls;
    this.pickups = pickups;
    this.finishX = finishX;
    this.finishY = finishY;
    this.finishSum = finishSum;
  }
}


function drawGrid(){
  ctx.beginPath();
  for (let x = 0; x <= gridWidth; x += boxSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridHeight);
  }

  for (let y = 0; y <= gridHeight; y += boxSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(gridWidth, y);
  }
  ctx.strokeStyle = "#a3a3a3";
  ctx.stroke();
  ctx.closePath();
}


function drawPlayer(){
  var x = boxSize * playerXBox + 15;
  var y = boxSize * playerYBox + 15;
  // player body
  ctx.beginPath();
  ctx.rect(x, y, 50, 50);
  ctx.fillStyle = "#34adcf";
  ctx.fill();
  // player arms
  ctx.beginPath();
  ctx.rect(x -5, y + 15, 5, 20);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.beginPath();
  ctx.rect(x + 50, y + 15, 5, 20);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  // player legs
  ctx.beginPath();
  ctx.rect(x + 10, y + 50, 5, 10);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.beginPath();
  ctx.rect(x + 35, y + 50, 5, 10);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  // antenna
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.moveTo(x + 25, y);
  ctx.lineTo(x + 27, y-4);
  ctx.lineTo(x + 34, y-10);
  ctx.strokeStyle = "#2c8fab";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 34, y - 10, 3, 0, 2 * Math.PI);
  ctx.fill();
  // display player sum
  ctx.font = "30px OCR A Std, monospace";
  var sumString = ""+playerSum;
  if (sumString.length < 2){
    sumString = "0" + sumString;
  }
  ctx.fillStyle = "black";
  ctx.fillText(sumString, x + 9, y + 35);
}


function drawWall(xBox, yBox){
  var x = boxSize * xBox;
  var y = boxSize * yBox;
  ctx.beginPath();
  ctx.rect(x, y, boxSize, boxSize);
  ctx.fill();
}


function drawPickup(xBox, yBox, value){
  var x = boxSize * xBox + 25;
  var y = boxSize * yBox + 25;
  ctx.beginPath();
  ctx.rect(x, y, 30, 30);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.font = "15px OCR A Std, monospace";
  var valString = "" + value;
  if (value > 0){
    valString = "+" + value;
  }
  ctx.fillText(valString, x + 7, y + 21);
}


function drawFinish(xBox, yBox, value){
  var x = boxSize * xBox;
  var y = boxSize * yBox;
  ctx.beginPath();
  ctx.rect(x, y, boxSize, boxSize);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.font = "50px OCR A Std, monospace";
  var valString = ""+value
  if (valString.length < 2){
    valString = "0" + valString;
  }
  ctx.fillStyle = "black";
  ctx.fillText(valString, x + 13, y + 55);
}


function checkCollisions(playerX, playerY){
  if (currentLevel.walls[playerX][playerY]) {
    return true;
  }
  else if (playerX > gridXLimit || playerX < 0 || playerY > gridYLimit || playerY < 0){
    return true;
  }
  return false;
}


async function move(xMove, yMove){
  await sleep(500);
  if (checkCollisions(playerXBox + xMove, playerYBox + yMove) == false){
    playerXBox += xMove;
    playerYBox += yMove;
    playerSum += currentLevel.pickups[playerXBox][playerYBox];
    update();
  }
}


function update(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFinish(currentLevel.finishX, currentLevel.finishY, currentLevel.finishSum);
  for (let i=0; i<=gridXLimit; i++){
    for (let j=0; j<=gridYLimit; j++){
      if (currentLevel.walls[i][j] == true){
        drawWall(i, j);
      }
      if (currentLevel.pickups[i][j] != 0){
        drawPickup(i, j, currentLevel.pickups[i][j]);
      }
    }
  }
  drawPlayer();
}


function compile(code){
  lines = code.split("\n");
  for (let i=0; i<lines.length; i++){
    // replace syntax
    lines[i] = lines[i].replace(/\bor /, "|| ");
    lines[i] = lines[i].replace(/\band /, "&& ");
    lines[i] = lines[i].replace(/\bis /, "== ");
    lines[i] = lines[i].replace(/\bnot /, "!= ");
    // turn lines into javascript syntax
    if (lines[i].search(/[\b(el)]?if .*?{/) != -1){
      lines[i] = lines[i].replace(/if (.*?){/, "if ($1){");
    }
    else if (lines[i].search(/\bwhile .*?{/) != -1){
      lines[i] = lines[i].replace(/while (.*?){/, "while ($1){");
    }
    else if (lines[i].search(/\bfor .*? in range\(/) != -1){
      match = lines[i].match(/for (.*?) in range\(([A-z\d]{1,}),([A-z\d]{1,}),([+\-])([A-z\d]{1,})\)/);
      if (match[2] > match[3]) {
        lines[i] = lines[i].replace(/for (.*?) in range\(([A-z\d]{1,}),([A-z\d]{1,}),([+\-])([A-z\d]{1,})\)/, "for (let $1=$2; $1>$3; i$4=$5)");
      }
      else {
        lines[i] = lines[i].replace(/for (.*?) in range\(([A-z\d]{1,}),([A-z\d]{1,}),([+\-])([A-z\d]{1,})\)/, "for (let $1=$2; $1<$3; i$4=$5)");
      }
    }
    else if (lines[i].search(/\bfor .*? in /) != -1){
      var variable = randomVar(10);
      lines[i] = lines[i].replace(/for (.*?) in (.*?)[ ]?{/, "for (let "+variable+ "=0; "+variable+" <$2.length; "+variable+"++){\n $1 = $2["+variable+"];");
    }
    // replace my defined variables
    lines[i] = lines[i].replace(/\bMOVE_UP/, "await move(0,-1)");
    lines[i] = lines[i].replace(/\bMOVE_DOWN/, "await move(0,1)");
    lines[i] = lines[i].replace(/\bMOVE_RIGHT/, "await move(1,0)");
    lines[i] = lines[i].replace(/\bMOVE_LEFT/, "await move(-1,0)");
    lines[i] = lines[i].replace(/\bLEFT/, "(function (){return currentLevel.walls[playerXBox-1][playerYBox]})()");
    lines[i] = lines[i].replace(/\bRIGHT/, "(function (){return currentLevel.walls[playerXBox+1][playerYBox]})()");
    lines[i] = lines[i].replace(/\bUP/, "(function (){return currentLevel.walls[playerXBox][playerYBox-1]})()");
    lines[i] = lines[i].replace(/\bDOWN/, "(function (){return currentLevel.walls[playerXBox][playerYBox+1]})()");
    lines[i] = lines[i].replace(/\bWALL/, "true");
    lines[i] = lines[i].replace(/\bSUM/, "(function (){return playerSum})()");
  }
  compiledCode = "";
  for (let i=0; i<lines.length; i++){
    compiledCode += lines[i]+"\n";
  }
  return compiledCode;
}


function randomVar(length){
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result
}


function resetLevel(){
  playerXBox = currentLevel.playerXStart;
  playerYBox = currentLevel.playerYStart;
  playerSum = 0;
  update();
}


function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function onSubmit(){
  var code = document.getElementById("code").value;
  var compiledCode = compile(code);
  try{
    await eval("(async () => {"+compiledCode+"})()");
    await sleep(600);
    if (playerXBox == currentLevel.finishX && playerYBox == currentLevel.finishY){
      if (playerSum == currentLevel.finishSum){
        alert("You Win!");
      }
    } else {
      alert("You Lose. Try Again!");
    }
    resetLevel();
  }
  catch(err){
    alert("Error in code");
    resetLevel();
  }
}


function chooseLevel(level_num){
  if (level_num == 1) {
    currentLevel = level1;
  }
  else if (level_num == 2) {
    currentLevel = level2;
  }
  else if (level_num == 3) {
    currentLevel = level3;
  }
  resetLevel();
}


// level 1
var walls = new Array(gridXLimit+1);
var pickups = new Array(gridXLimit+1);
for (let i=0; i< walls.length; i++){
  walls[i] = [false,false,false,false,false,false,false];
  pickups[i] = [0,0,0,0,0,0,0];
}
walls[0][0] = true;
walls[2][6] = true;
walls[5][1] = true;
walls[5][2] = true;
walls[5][3] = true;
walls[5][4] = true;
walls[5][5] = true;
walls[8][0] = true;
walls[8][1] = true;
walls[8][2] = true;
walls[8][3] = true;
walls[8][5] = true;
walls[8][6] = true;

pickups[1][1] = 1;
pickups[5][0] = -4;
pickups[5][6] = 2;
pickups[0][6] = 2;
level1 = new Level(0,3,walls, pickups, 11, 3, 3);

// level 2
var walls2 = new Array(gridXLimit+1);
var pickups2 = new Array(gridXLimit+1);
for (let i=0; i< walls2.length; i++){
  walls2[i] = [false,false,false,false,false,false,false];
  pickups2[i] = [0,0,0,0,0,0,0];
}
walls2[0][0] = true;
walls2[1][0] = true;
walls2[2][0] = true;
walls2[3][0] = true;
walls2[4][0] = true;
walls2[3][1] = true;
walls2[5][1] = true;
walls2[11][1] = true;
walls2[5][2] = true;
walls2[3][3] = true;
walls2[4][3] = true;
walls2[7][3] = true;
walls2[8][4] = true;
walls2[9][5] = true;
walls2[10][6] = true;
walls2[2][6] = true;


pickups2[4][1] = 2;

level2 = new Level(0,6,walls2, pickups2, 11, 6, 12);

// level 3
var walls3 = new Array(gridXLimit+1);
var pickups3 = new Array(gridXLimit+1);
for (let i=0; i< walls3.length; i++){
  walls3[i] = [false,false,false,false,false,false,false];
  pickups3[i] = [0,0,0,0,0,0,0];
}
walls3[6][0] = true;
walls3[7][0] = true;
walls3[8][0] = true;
walls3[1][1] = true;
walls3[2][1] = true;
walls3[4][1] = true;
walls3[7][1] = true;
walls3[10][1] = true;
walls3[1][2] = true;
walls3[4][2] = true;
walls3[5][2] = true;
walls3[9][2] = true;
walls3[10][2] = true;
walls3[1][3] = true;
walls3[7][3] = true;
walls3[8][3] = true;
walls3[10][4] = true;
walls3[11][4] = true;
walls3[1][5] = true;
walls3[2][5] = true;
walls3[6][5] = true;
walls3[8][5] = true;
walls3[10][6] = true;

pickups3[2][0] = 1;
pickups3[4][0] = 3;
pickups3[10][0] = -1;
pickups3[5][1] = -4;
pickups3[8][1] = -1;
pickups3[0][2] = 1;
pickups3[2][2] = -3;
pickups3[6][2] = -1;
pickups3[7][2] = 4;
pickups3[3][3] = 1;
pickups3[4][3] = -1;
pickups3[6][3] = 2;
pickups3[11][3] = 2;
pickups3[0][4] = 2;
pickups3[2][4] = 2;
pickups3[4][4] = 1;
pickups3[5][4] = 1;
pickups3[6][4] = 2;
pickups3[7][4] = 4;
pickups3[9][4] = -3;
pickups3[3][5] = -2;
pickups3[4][5] = 1;
pickups3[5][5] = 1;
pickups3[11][5] = -3;
pickups3[1][6] = 1;
pickups3[3][6] = 3;
pickups3[4][6] = 1;
pickups3[5][6] = 1;
pickups3[6][6] = 1;
pickups3[9][6] = 2;

level3 = new Level(0,0,walls3, pickups3, 11, 6, 18);


currentLevel = level1;
playerXBox = 0;
playerYBox = 3;
update();
