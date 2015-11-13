 /* Design Basic Game Solo Challenge

// This is a solo challenge

Your mission description:
Overall mission: win at checkers
Goals: move ahead.  In later versions, jump, be kinged, etc.
Characters: Red team and black team (X and O in the ASCII version)
Objects: Each useable square on board will be an object held within the board array, with properties.
Functions: display board, and ask for/implement move.  Later, check for win, make move for computer player.

Pseudocode for MVP
build function for ASCII graphic depiction of 8x8 checkers board with ---- on unplayable spaces and open spaces have a space number along with " " or "X" or "O" to show whether they are open or occupied and by which team
- draw top line
- draw each row
  - draw side vertical line
  - draw contents of square
    - determine whether playable square
    - get state of square from board state object
    - format square with space number and state
  - draw interior vertical line
  - repeat to complete row
  - draw side line
- draw bottom line

build array of objects to store board state (open, X or O spaces)
- initalize with 32 objects, one for each square, by number (0 index element is a null)
- Property: owner, with  squares 1-12 are black (X), squares 13-20 are empty (-), and squares 21-32 are red (O)
- Property: upward moves (to higher numbers)
- Property: downward moves (to lower number)

build function to ask for and implement move for each player
- ask player which piece he wants to move
- look up piece on board
  - check color
  - based on color, check spaces it could move to
  - check whether spaces are open
    - if only one, make move
    - if two open, ask which one he wants to move to
    - if none open, ask for different piece to move
  - change board to reflect outcome of move
    - change owner of old space to nobody
    - change owner of new space to mover
- print board

- later improvements:
  - jump moves
  - additional jumps on same move if available
  - taking turns
  - kinging and reversible movement as a result
  - visual display of board
  - click entry to move and destination
  - automatic analysis of which pieces can move and when clicked, where they can move to
  - display available moves by flashing piece, and destinations when piece is clicked
  - AI so you can play against the computer
    - initially, random choice among available moves
    - improve AI with following rules
    - avoid moving last row
    - get kinged when possible
    - take jumps when possible
    - avoid moving out of unjumpable positions
    - avoid moving into jumpable positions
    - develop deeper analysis of position
      -  recursive evaluation of future moves?
      -  method to recognize better positions?
      -  other ways to assess value of moves that I haven't thought of yet.

// Initial Code
*/
var hLine = "-------------------------------------------------------------------";

function SquareLineOutput(row,col,line) {
  if ((row+col)%2==0) return "-------|";
  var space=(8-row)*4+(Math.ceil(col/2))
  var spaceString = " " + space.toString();
  var owner = board[space].owner
  if (space < 10) spaceString = " "+spaceString;
  if (line<3) spaceString = owner+owner+owner;
  if (line==2 && board[space].king) return "  King |";
  return owner+owner+owner+owner+spaceString+"|";
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

var board = []

function Space (number, owner) {
  this.name = "space" + number.toString();
  this.owner = owner;
  this.upMoves = [];
  this.downMoves = [];
  this.upJumps = [];
  this.downJumps = [];
  this.king = false;
}
function InitializeBoard() {
  for (space =1; space < 33; space++) {
    var owner = " "
    if (space < 13) owner = "X";
    if (space > 20) owner = "O";
    board[space] = new Space (space, owner);
  }
  board[1].upMoves = [5];
  board[2].upMoves = [5,6];
  board[3].upMoves = [6,7];
  board[4].upMoves = [7,8];
  board[5].upMoves = [10,9];
  board[6].upMoves = [10,11];
  board[7].upMoves = [11,12];
  board[8].upMoves = [12];
  for (var space = 9; space < 29; space++) {
    board[space].upMoves[0] = board[space-8].upMoves[0]+8;
    if (board[space-8].upMoves[1]>0) board[space].upMoves[1] = board[space-8].upMoves[1]+8;
  }
  board[5].downMoves = [2,1];
  board[6].downMoves = [2,3];
  board[7].downMoves = [3,4];  
  board[8].downMoves = [4];  
  board[9].downMoves = [5];  
  board[10].downMoves = [5,6];
  board[11].downMoves = [6,7];  
  board[12].downMoves = [7,8];  
  for (var space = 13; space < 33; space++) {
    board[space].downMoves[0] = board[space-8].downMoves[0]+8;
    if (board[space-8].downMoves[1]>0) board[space].downMoves[1] = board[space-8].downMoves[1]+8;
  }
  board[1].upJumps = [10];
  board[2].upJumps = [9,11];
  board[3].upJumps = [10,12];
  board[4].upJumps = [11];
  board[5].upJumps = [14];
  board[6].upJumps = [13,15];
  board[7].upJumps = [14,16];
  board[8].upJumps = [15];
  for (var space = 9; space < 25; space++) {
    board[space].upJumps[0] = board[space-8].upJumps[0]+8;
    if (board[space-8].upJumps[1]>0) board[space].upJumps[1] = board[space-8].upJumps[1]+8;
  }
  board[13].downJumps = [6];
  board[14].downJumps = [5,7];
  board[15].downJumps = [6,8];  
  board[16].downJumps = [7];  
  board[9].downJumps = [2];  
  board[10].downJumps = [1,3];
  board[11].downJumps = [2,4];  
  board[12].downJumps = [3];  
  for (var space = 17; space < 33; space++) {
    board[space].downJumps[0] = board[space-8].downJumps[0]+8;
    if (board[space-8].downJumps[1]>0) board[space].downJumps[1] = board[space-8].downJumps[1]+8;
  }
}

function UpdateBoardHTML() {
  board.forEach (function (space, index) {
    var color = false
    if (space.owner == "X") color = "red";
    if (space.owner == "O") color = "black";
    var square = document.getElementById(space.name);
    if (color) console.log(square.style.background = color);
    else console.log(square.style.background = "");
    if (space.king) {
      console.log(square.style.height = "4em")
      console.log(square.style.width = "4em")
      console.log(square.style.border = "0.25em solid gold")
    }
    else {
      console.log(square.style.height = "4.5em")
      console.log(square.style.width = "4.5em")
      console.log(square.style.border = "0em solid black")
    }
  })
}

function MoveValidator(start,finish) {
  if (board[start].owner == " ") return [false, "There is no checker on that space."];
  if (board[finish].owner != " ") return [false, "The target space is occupied."];
  var validMove = false;
  if (board[start].owner == "X" || board[start].king) {
    board[start].upMoves.forEach(function (space) {if (space == finish) validMove=[true, "move"]});
    board[start].upJumps.forEach(function (space, index) {
      if (space == finish && board[board[start].upMoves[index]].owner!=" " && board[board[start].upMoves[index]].owner!=board[start].owner) validMove=[true, board[start].upMoves[index]]});
  }
  if (board[start].owner == "O" || board[start].king) {
    board[start].downMoves.forEach(function (space) {if (space == finish) validMove=[true, "move"]});
    board[start].downJumps.forEach(function (space, index) {
      if (space == finish && board[board[start].downMoves[index]].owner!=" " && board[board[start].downMoves[index]].owner!=board[start].owner) validMove=[true,board[start].downMoves[index]]});
  }
  if (!validMove) return [false, "That checker cannot move there."];
  return validMove;
}

function KingMe (space) {
  if (space < 5 && board[space].owner == "O") board[space].king = true;
  if (space >27 && board[space].owner == "X") board[space].king = true;
}

function WinCheck() {
  var winX = true;
  var winO = true;
  board.forEach(function(square) {
    if (square.owner == "X") winO = false;
    if (square.owner == "O") winX = false;
    if (!winX && !winO) return false
})
  if (winX) console.log("X has won the game!!!");
  if (winO) console.log("O has won the game!!!");
  return true
}


function Move(start, finish) {
  var validity = MoveValidator(start,finish)
  if (!validity[0]) {
    console.log(validity[1]);
    return;
  }
  board[finish].owner = board[start].owner;
  board[finish].king = board[start].king;
  board[start].owner = " ";
  board[start].king = false;
  if (!isNaN(validity[1])) {
    board[validity[1]].owner=" ";
    board[validity[1]].king=false;
  }
  KingMe(finish);
  PrintBoard();
  UpdateBoardHTML();
  console.log("Move completed", start, " to ", finish);
  WinCheck()
}



//test code

InitializeBoard();
UpdateBoardHTML();


Move(13,17);
Move(9,19);
Move(9,21);
Move(10,14);
Move(9,13);
Move(22,18);
Move(13,22);
Move(27,18);
Move(21,17);
Move(30,27);
Move(14,21);
Move(21,30);
Move(23,19);
Move(30,23);
Move(23,14);
Move(17,13);
Move(13,10);
Move(6,13);
Move(29,26);
Move(25,21);
Move(21,18);
Move(14,21);
Move(21,30);
Move(31,27);
Move(24,20);
Move(11,15);
Move(15,24);
Move(24,31);
Move(30,23);
Move(32,28);
Move(23,32);


// Refactored Code






// Reflection
//
//
//
//
//
//
//
//