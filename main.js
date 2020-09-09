var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var gridWidth = 960;
var gridHeight = 560;
var boxSize = 80;
var gridXLimit = 12;
var gridYLimit = 7;
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
  var x = boxSize * (playerXBox - 1) + 15;
  var y = boxSize * (playerYBox - 1) + 15;
  // player body
  ctx.beginPath();
  ctx.rect(x, y, 50, 50);
  ctx.fillStyle = "#34adcf";
  ctx.fill();
  ctx.closePath();
  // player arms
  ctx.beginPath();
  ctx.rect(x -5, y + 15, 5, 20);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.rect(x + 50, y + 15, 5, 20);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.closePath();
  // player legs
  ctx.beginPath();
  ctx.rect(x + 10, y + 50, 5, 10);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.rect(x + 35, y + 50, 5, 10);
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.closePath();
  // antenna
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.moveTo(x + 25, y);
  ctx.lineTo(x + 27, y-4);
  ctx.lineTo(x + 34, y-10);
  ctx.strokeStyle = "#2c8fab";
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(x + 34, y - 10, 3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
  // display player sum
  ctx.font = "30px OCR A Std, monospace";
  var sumString = ""+playerSum;
  if (sumString.length < 2){
    sumString = "0" + sumString;
  }
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillText(sumString, x + 9, y + 35);
  ctx.closePath();
}


function drawWall(xBox, yBox){
  var x = boxSize * (xBox - 1);
  var y = boxSize * (yBox - 1);
  ctx.beginPath();
  ctx.rect(x, y, boxSize, boxSize);
  ctx.fill();
  ctx.closePath();
}


function drawPickup(xBox, yBox, value){
  var x = boxSize * (xBox - 1) + 25;
  var y = boxSize * (yBox - 1) + 25;
  ctx.beginPath();
  ctx.rect(x, y, 30, 30);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.font = "15px OCR A Std, monospace";
  var valString = "" + value;
  if (value > 0){
    valString = "+" + value;
  }
  ctx.beginPath();
  ctx.fillText(valString, x + 7, y + 21);
  ctx.closePath();
}


function drawFinish(xBox, yBox, value){
  var x = boxSize * (xBox - 1);
  var y = boxSize * (yBox - 1);
  ctx.beginPath();
  ctx.rect(x, y, boxSize, boxSize);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();
  ctx.font = "50px OCR A Std, monospace";
  var valString = ""+value
  if (valString.length < 2){
    valString = "0" + valString;
  }
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillText(valString, x + 13, y + 55);
  ctx.closePath();
}


function checkCollisions(playerX, playerY){
  if (currentLevel.walls[playerX][playerY]) {
    return true;
  }
  else if (playerX > gridXLimit || playerX < 1 || playerY > gridYLimit || playerY < 1){
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
  for (let i=0; i<=gridXLimit+1; i++){
    for (let j=0; j<=gridYLimit+1; j++){
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


function popup(message){
  ctx.beginPath();
  ctx.rect(320,210,320,70);
  ctx.closePath();
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.fillStyle = "#2c8fab";
  ctx.fill();
  ctx.textAlign = "center";
  ctx.font = "25px OCR A Std, monospace";
  ctx.fillStyle = "black";
  ctx.fillText(message, 480, 255);
  ctx.textAlign = "start";
  ctx.closePath();
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
  console.log(compiledCode);
  try{
    await eval("(async () => {"+compiledCode+"})()");
    await sleep(600);
    if (playerXBox == currentLevel.finishX && playerYBox == currentLevel.finishY){
      if (playerSum == currentLevel.finishSum){
        popup("You Win!");
        await sleep(1500);
      }
    } else {
      popup("You Lose. Try Again!");
      await sleep(1500);
    }
    resetLevel();
  }
  catch(err){
    popup("Error in code");
    await sleep(1500);
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
var walls = new Array(gridXLimit+3);
var pickups = new Array(gridXLimit+3);
for (let i=0; i< walls.length; i++){
  walls[i] = [true,false,false,false,false,false,false,false,true];
  pickups[i] = [0,0,0,0,0,0,0,0,0];
}
// walls around edges
walls[0] = [true,true,true,true,true,true,true,true,true];
walls[13] = [true,true,true,true,true,true,true,true,true];

// level walls
walls[1][1] = true;
walls[3][7] = true;
walls[6][2] = true;
walls[6][3] = true;
walls[6][4] = true;
walls[6][5] = true;
walls[6][6] = true;
walls[9][1] = true;
walls[9][2] = true;
walls[9][3] = true;
walls[9][4] = true;
walls[9][6] = true;
walls[9][7] = true;

pickups[2][2] = 1;
pickups[6][1] = -4;
pickups[6][7] = 2;
pickups[1][7] = 2;
level1 = new Level(1,4,walls, pickups, 12, 4, 3);

// level 2
var walls2 = new Array(gridXLimit+3);
var pickups2 = new Array(gridXLimit+3);
for (let i=0; i< walls2.length; i++){
  walls2[i] = [true,false,false,false,false,false,false,false,true];
  pickups2[i] = [0,0,0,0,0,0,0,0,0];
}

// walls around edges
walls[0] = [true,true,true,true,true,true,true,true,true];
walls[13] = [true,true,true,true,true,true,true,true,true];

// level walls
walls2[1][1] = true;
walls2[2][1] = true;
walls2[3][1] = true;
walls2[4][1] = true;
walls2[5][1] = true;
walls2[4][2] = true;
walls2[6][2] = true;
walls2[12][2] = true;
walls2[6][3] = true;
walls2[4][4] = true;
walls2[5][4] = true;
walls2[8][4] = true;
walls2[9][5] = true;
walls2[10][6] = true;
walls2[11][7] = true;
walls2[3][7] = true;


pickups2[5][2] = 2;

level2 = new Level(1,7,walls2, pickups2, 12, 7, 12);

// level 3
var walls3 = new Array(gridXLimit+3);
var pickups3 = new Array(gridXLimit+3);
for (let i=0; i< walls3.length; i++){
  walls3[i] = [true,false,false,false,false,false,false,false,true];
  pickups3[i] = [0,0,0,0,0,0,0,0,0];
}

// walls around edges
walls[0] = [true,true,true,true,true,true,true,true,true];
walls[13] = [true,true,true,true,true,true,true,true,true];

// level walls
walls3[7][1] = true;
walls3[8][1] = true;
walls3[9][1] = true;
walls3[2][2] = true;
walls3[3][2] = true;
walls3[5][2] = true;
walls3[8][2] = true;
walls3[11][2] = true;
walls3[2][3] = true;
walls3[5][3] = true;
walls3[6][3] = true;
walls3[10][3] = true;
walls3[11][3] = true;
walls3[2][4] = true;
walls3[8][4] = true;
walls3[9][4] = true;
walls3[11][5] = true;
walls3[12][5] = true;
walls3[2][6] = true;
walls3[3][6] = true;
walls3[7][6] = true;
walls3[9][6] = true;
walls3[11][7] = true;

pickups3[3][1] = 1;
pickups3[5][1] = 3;
pickups3[11][1] = -1;
pickups3[6][2] = -4;
pickups3[9][2] = -1;
pickups3[1][3] = 1;
pickups3[3][3] = -3;
pickups3[7][3] = -1;
pickups3[8][3] = 4;
pickups3[4][4] = 1;
pickups3[5][4] = -1;
pickups3[7][4] = 2;
pickups3[12][4] = 2;
pickups3[1][5] = 2;
pickups3[3][5] = 2;
pickups3[5][5] = 1;
pickups3[6][5] = 1;
pickups3[7][5] = 2;
pickups3[8][5] = 4;
pickups3[10][5] = -3;
pickups3[4][6] = -2;
pickups3[5][6] = 1;
pickups3[6][6] = 1;
pickups3[12][6] = -3;
pickups3[2][7] = 1;
pickups3[4][7] = 3;
pickups3[5][7] = 1;
pickups3[6][7] = 1;
pickups3[7][7] = 1;
pickups3[10][7] = 2;

level3 = new Level(1,1,walls3, pickups3, 12, 7, 18);


currentLevel = level1;
playerXBox = 1;
playerYBox = 4;
update();
