 /* Design Basic Game Solo Challenge

// This is a solo challenge

Your mission description:
Overall mission: win at checkers
Goals: move ahead.  In later versions, jump, be kinged, etc.
Characters: Red team and black team (X and O in the ASCII version)
Objects: Each useable square on board will be an object held within the board array, with properties.
Functions: display board, and ask for/implement move.  Later, check for win, make move for computer player.

Pseudocode for MVP
build function for ASCII graphic depiction of 8x8 checkers board with ---- on unplayable squares and open squares have a square number along with " " or "X" or "O" to show whether they are open or occupied and by which team
- draw top line
- draw each row
  - draw side vertical line
  - draw contents of square
    - determine whether playable square
    - get state of square from board state object
    - format square with square number and state
  - draw interior vertical line
  - repeat to complete row
  - draw side line
- draw bottom line

build array of objects to store board state (open, X or O squares)
- initalize with 32 objects, one for each square, by number (0 index element is a null)
- Property: owner, with  squares 1-12 are black (X), squares 13-20 are empty (-), and squares 21-32 are red (O)
- Property: upward moves (to higher numbers)
- Property: downward moves (to lower number)

build function to ask for and implement move for each player
- ask player which piece he wants to move
- look up piece on board
  - check color
  - based on color, check squares it could move to
  - check whether squares are open
    - if only one, make move
    - if two open, ask which one he wants to move to
    - if none open, ask for different piece to move
  - change board to reflect outcome of move
    - change owner of old square to nobody
    - change owner of new square to mover
- print board

- later improvements:
DONE  - jump moves
DONE  - additional jumps on same move if available
DONE  - taking turns
DONE  - kinging and reversible movement as a result
DONE  - visual display of board
DONE  - click entry to move and destination
  - automatic analysis of which pieces can move and when clicked, where they can move to
  - display available moves by flashing piece, and destinations when piece is clicked
DONE  - AI so you can play against the computer
DONE    - initially, random choice among available moves
    - improve AI with following rules
    - avoid moving last row
    - get kinged when possible
DONE    - take jumps when possible
    - avoid moving out of unjumpable positions
    - avoid moving into jumpable positions
    - develop deeper analysis of position
      -  recursive evaluation of future moves?
      -  method to recognize better positions?
      -  other ways to assess value of moves that I haven't thought of yet.

// Initial Code

 CONSOLE INTERFACE, NO LONGER NEEDED
var hLine = "-------------------------------------------------------------------";

function SquareLineOutput(row,col,line) {
  if ((row+col)%2==0) return "-------|";
  var square=(8-row)*4+(Math.ceil(col/2))
  var squareString = " " + square.toString();
  var owner = board[square].owner
  if (square < 10) squareString = " "+squareString;
  if (line<3) squareString = owner+owner+owner;
  if (line==2 && board[square].king) return "  King |";
  return owner+owner+owner+owner+squareString+"|";
}

function PrintBoard() {
  console.log(hLine);
  for(var row = 1; row < 9; row++) {
    for (var line = 1; line < 4; line++) {
      var lineString = ("||");
      for (var col = 1; col < 9; col++) {
        lineString += SquareLineOutput(row,col,line); //add contents of line within square
      }
      lineString += ("|");
      console.log(lineString);
    }
    console.log(hLine);
  }
}
*/
// Set global variables to default values
var board = [];
var move = [];
var upPlayersTurn = true;
var squareJumpedTo = false;
var JumpedSquare = "";
var nextJumpsAvailable = [];
var upPlayer = "Red";
var downPlayer = "White";
var computerName = "Shallow Blue";
var brokenAI = false;

// control output type among "console", "alert" or id of element and setup response storage variable
var outputMethod = "Dialog";
var response = "";

// Helper functions
function mover() {return upPlayersTurn ? upPlayer : downPlayer};
function notMover() {return upPlayersTurn ? downPlayer : upPlayer};
function moverOwnsSquare(squareNumber) {return board[squareNumber].owner==mover()};
function squareIsEmpty(squareNumber) {return board[squareNumber].owner==" "};
function checkerIsKing(squareNumber) {return board[squareNumber].king};

function sayToPlayer(text) {
  if (outputMethod == "alert") alert(text);
  else if (outputMethod == "console") console.log(text);
  else document.getElementById(outputMethod).innerHTML = text;
}

// Define Square objects for 32 playable squares and populated iniital board
function Square (number, owner) {
  this.name = "Square" + number.toString();
  this.owner = owner;
  this.upMoves = [];
  this.downMoves = [];
  this.upJumps = [];
  this.downJumps = [];
  this.king = false;
}
function initializeBoard() {
  for (var square =1; square < 33; square++) {
    var owner = " "
    if (square < 13) owner = upPlayer;
    if (square > 20) owner = downPlayer;
    board[square] = new Square (square, owner);
  }
  board[1].upMoves = [5];
  board[2].upMoves = [5,6];
  board[3].upMoves = [6,7];
  board[4].upMoves = [7,8];
  board[5].upMoves = [10,9];
  board[6].upMoves = [10,11];
  board[7].upMoves = [11,12];
  board[8].upMoves = [12];
  for (var square = 9; square < 29; square++) {
    board[square].upMoves[0] = board[square-8].upMoves[0]+8;
    if (board[square-8].upMoves[1]>0) board[square].upMoves[1] = board[square-8].upMoves[1]+8;
  }
  board[5].downMoves = [2,1];
  board[6].downMoves = [2,3];
  board[7].downMoves = [3,4];  
  board[8].downMoves = [4];  
  board[9].downMoves = [5];  
  board[10].downMoves = [5,6];
  board[11].downMoves = [6,7];  
  board[12].downMoves = [7,8];  
  for (var square = 13; square < 33; square++) {
    board[square].downMoves[0] = board[square-8].downMoves[0]+8;
    if (board[square-8].downMoves[1]>0) board[square].downMoves[1] = board[square-8].downMoves[1]+8;
  }
  board[1].upJumps = [10];
  board[2].upJumps = [9,11];
  board[3].upJumps = [10,12];
  board[4].upJumps = [11];
  board[5].upJumps = [14];
  board[6].upJumps = [13,15];
  board[7].upJumps = [14,16];
  board[8].upJumps = [15];
  for (var square = 9; square < 25; square++) {
    board[square].upJumps[0] = board[square-8].upJumps[0]+8;
    if (board[square-8].upJumps[1]>0) board[square].upJumps[1] = board[square-8].upJumps[1]+8;
  }
  board[13].downJumps = [6];
  board[14].downJumps = [5,7];
  board[15].downJumps = [6,8];  
  board[16].downJumps = [7];  
  board[9].downJumps = [2];  
  board[10].downJumps = [1,3];
  board[11].downJumps = [2,4];  
  board[12].downJumps = [3];  
  for (var square = 17; square < 33; square++) {
    board[square].downJumps[0] = board[square-8].downJumps[0]+8;
    if (board[square-8].downJumps[1]>0) board[square].downJumps[1] = board[square-8].downJumps[1]+8;
  }
}
// Refresh board display in HTML
function refreshBoardHTML() {
  board.forEach (function (square, index) {
    var color = "";
    if (square.owner == upPlayer) color = "red";
    if (square.owner == downPlayer) color = "white";
    var circle = document.getElementById(square.name);
    console.log(circle.style.background = color);
    if (square.king) console.log(circle.style.color = "black");
    else console.log(circle.style.color = "transparent");
  })
}

function getPlayerNames() {
  var names = [];
  alert ("Welcome to my checkers game! I hope you have fun with it. Please play in a larger window if you see the board losing the eighth column--it doesn't scale perfectly into small windows.")
  names[0] = prompt("What is the first player's name?");
  if (names[0]=="") names[0]="Nameless Human";
  names[1] = prompt("What is the second player's name? If you want to play against the computer, just hit 'OK' without a name");
  if (names[1]=="") names[1]=computerName;
  if (Math.random()<0.5 && names[1] != computerName) names.reverse();
  upPlayer = names[0];
  downPlayer = names[1];
  response = "Welcome to checkers! " + upPlayer + " will be red and move first.  You make moves in this game by clicking on the checker you want to move and then clicking on the square you are moving to.  It is " + upPlayer +"'s turn. Please move a red checker.";
  sayToPlayer(response);
  response = "";
  return;
}
// Initiate response to clicks on the board
function clickSquare(square) {
  if (squareJumpedTo) jumpOnwardTo(square);
  else move[0] ? moveTo(square) : startFrom(square);
}

// If click was initial click to start move
function startFrom(start) {
  if (moverOwnsSquare(start)) move[0] = start;
  else sayToPlayer("That's not one of your checkers. Pick another checker.");
}

// If click was second click to finish move
function moveTo(finish) {
  if (squareIsEmpty) {
    move[1] = finish;
    moveValidator();
  }
  else sayToPlayer("That square isn't open. Please click another destination square.");
  return;
}

// If click was second click to continue jumping
function jumpOnwardTo(square){
  if (moverOwnsSquare(square)) {
    squareJumpedTo = false;
    endMove();
    return;
  }
  if (nextJumpsAvailable[0].indexOf(square)>=0) {
    move = [squareJumpedTo,square]
    squareJumpedTo=false;
    moveValidator();
  }
  else sayToPlayer("You can't continue your jump to that square.  Please click another square.")
}

// Test whether move requested is valid and route to moveCheckers with right information
function moveValidator() {
  var start = move[0];
  var finish = move[1];
  var moveIsNotValid = true;
  if (movesAvailable(start).indexOf(finish)>=0) {
    squareJumpedTo = false;
    moveCheckers(start,finish);
    moveIsNotValid=false;
  }
  else {
    var jumpsResult = jumpsAvailable(start);
    jumpsResult[0].forEach(function (jump,index) {
      if (jump == finish) {
        squareJumpedTo = finish;
        moveCheckers(start,finish, jumpsResult[1][index]);
        moveIsNotValid=false;
      }
    });
  };
  if (moveIsNotValid) {
  move = [];
  sayToPlayer ("That is not a valid move. Please start over by clicking the checker you want to move.")
  }
}

// Look for valid move destinations from specified square
function movesAvailable(square) {
  canMoveTo = [];
  if (upPlayersTurn || checkerIsKing(square)) {
    board[square].upMoves.forEach(function (moveTo) {if (squareIsEmpty(moveTo))  canMoveTo.push(moveTo)})
  }
  if (!upPlayersTurn || checkerIsKing(square)) {
    board[square].downMoves.forEach(function (moveTo) {if (squareIsEmpty(moveTo))  canMoveTo.push(moveTo)})
  }
  return canMoveTo;
}

//  Look for valid jumps for spacified square, format is two arrays, first of valid jumps, second of the square jumped for each of them
function jumpsAvailable(square) {
  var canJumpTo = [[],[]];
  var inputs = [] // trying to be dry about messy function below that would otherwise be written twice with "ups" and then "downs"
  if (upPlayersTurn || checkerIsKing(square)) inputs.push(["upJumps","upMoves"]);
  if (!upPlayersTurn || checkerIsKing(square)) inputs.push(["downJumps","downMoves"]);
  inputs.forEach(function (input) {
    board[square][input[0]].forEach(function (jumpTo, index) {
      var jumpedOver = board[square][input[1]][index]
      if (squareIsEmpty(jumpTo) && board[jumpedOver].owner==notMover()) {
        canJumpTo[0].push(jumpTo);
        canJumpTo[1].push(jumpedOver);
      };
    });
  });
  return canJumpTo;
}

// change Square objects to reflect result of valid move and take other related steps
function moveCheckers(start, finish, jumpedOver) {
  board[finish].owner = board[start].owner;
  board[finish].king = board[start].king;
  board[start].owner = " ";
  board[start].king = false;
  if (squareJumpedTo) {
    board[jumpedOver].owner=" ";
    board[jumpedOver].king=false;
    nextJumpsAvailable = jumpsAvailable(finish);
    if (nextJumpsAvailable[0].length == 0) squareJumpedTo=false;
  }
  kingMe(finish);
  refreshBoardHTML();
  if (!winCheck()) endMove();
}
// Test for piece being kinged and reflect that in Square object
function kingMe(square) {
  if (square < 5 && board[square].owner == downPlayer) {
    board[square].king = true;
    response += downPlayer +" got a king! Congratulations! ";
  }
  if (square >27 && board[square].owner == upPlayer) {
    board[square].king = true;
    response += upPlayer +" got a king! Congratulations! ";
  }
}

// Check whether someone has won game
function winCheck() {
  var win = true;
  board.forEach(function(square) {
    if (square.owner == notMover()) win = false;
  });
  if (win) {
    response = mover() + " has won the game by jumping all the opposing checkers!!!";
    sayToPlayer(response);
  }
  return win;
}

function endMove() {
  move=[];
  if (squareJumpedTo) {
    response += "You jumped a checker and can continue jumping.  If you wish to do so, click the square your next jump takes you to. If you don't want to make that jump, just click any one of your pieces.";
    if (mover()==computerName) {
      move = [squareJumpedTo,nextJumpsAvailable[0]];
      moveValidator();
    }
  }
  else {
    response += "Move completed for " + mover() + ". It is " + notMover() + "'s turn."
    upPlayersTurn = !upPlayersTurn;
    if (mover() == computerName && brokenAI) {
      response += " AI is offline--please move for the computer."
      sayToPlayer(response);
      response = "";
    }
    else { 
      sayToPlayer(response);
      response = "";
      if (mover()==computerName) getComputerMove();
    }
  }
}
/////  Computer AI work in progress
function getComputerMove() {
  var jumpOptions = [], moveOptions = [], move = "";
  board.forEach (function (square, squareNumber) {
    if (square.owner == mover()) {
       var result = jumpsAvailable(squareNumber);
       if (result.length >0) {
        result[0].forEach (function (jump,index) {
        jumpOptions.push([squareNumber, jump, result[1][index]]);
      });
      }
      result = movesAvailable(squareNumber);
      if (result.length >0) {
        result.forEach (function (finish) {
        moveOptions.push([squareNumber, finish]);
      });
      }
    }
  });
  if (jumpOptions.length > 0) {
    move = randomPickFromArray(jumpOptions);
    squareJumpedTo = move[1];
  }
  else move = randomPickFromArray(moveOptions);
  if (move==undefined) {
    response = mover() + " has lost because there are no legal moves available!"
    sayToPlayer(response);
  }
  if (mover() == computerName) moveCheckers (move[0], move[1], move[2]);
  else return;
}

function randomPickFromArray(array) {
  return array[Math.floor(Math.random()*array.length)];
}

getPlayerNames();
initializeBoard();
refreshBoardHTML();

// test code
/*
clickSquare(9);
clickSquare(13);
clickSquare(10);
clickSquare(14);
clickSquare(24);
clickSquare(20);
clickSquare(13);
clickSquare(18);
clickSquare(22);
clickSquare(13);
clickSquare(11);
clickSquare(15);
clickSquare(27);
clickSquare(22);
clickSquare(7);
clickSquare(11);
clickSquare(31);
clickSquare(27);
clickSquare(15);
clickSquare(24);
clickSquare(31);
clickSquare(22);
clickSquare(19);
clickSquare(31);
clickSquare(22);
clickSquare(22);
clickSquare(21);
clickSquare(17);
*/

// Refactored Code






/* Reflection
####What was the most difficult part of this challenge?
Keeping things in small enough bites to be able to run without too much troubleshooting each time I changed.

####What did you learn about creating objects and functions that interact with one another?
Quite a bit.  This was a much more involved program than those I had written before.

####Did you learn about any new built-in methods you could use in your refactored solution? If so, what were they and how do they work?
Of course.  I had no idea how to display things on screen by changing HTML, or interact with the user via 'prompt', for example

####How can you access and manipulate properties of objects?
In brackets or if the property name is a valid variable, preceded by a period.  I also do some variables to capture property names.


//
//
//
*/