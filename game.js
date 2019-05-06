///////////////////////
// GAME SET-UP //
///////////////////////

//Global puzzle state
let puzzle;

function newGameHandler(){
    //Create a new sliding puzzle
    createPuzzle(3, 3);

    //Find the board container in the HTML document
    let container = document.getElementById("board_container");
    
    drawPuzzle(container);
}

function pageLoadHandler(){
    //Find the new game button in the HTML document
    let newGameButton = document.getElementById("new_game_btn");

    //Whenever the new game button is clicked, call the function newGameHandler
    newGameButton.addEventListener('click', newGameHandler);

    //Start new game on app launch without clicking the New Game button
    newGameHandler();

}

//////////////////////
// Coordinate logic //
//////////////////////

//A coordinate is an object with two fields: x and y
//Point (5, 4) could be defined as follows: const coordinate = {x : 5, y: 4};

function areNeigbours(coord1, coord2){
    if(coord1.x == coord2.x){
        return Math.abs(coord1.y-coord2.y) == 1;
    }else if(coord1.y == coord2.y){
        return Math.abs(coord1.x-coord2.x) == 1;
    }
    return false;
}

function areEqual(coord1, coord2){
    return coord1.x == coord2.x && coord1.y == coord2.y;
}

function getLeftCoordinate(coord){
    return { x: coord.x - 1, y: coord.y}
}

function getRightCoordinate(coord){
    return { x: coord.x + 1, y: coord.y}
}

function getTopCoordinate(coord){
    return { x: coord.x, y: coord.y -1}
}

function getBottomCoordinate(coord){
    return { x: coord.x, y: coord.y + 1}
}


//////////////////
// Puzzle logic //
//////////////////

//A puzzle is an object with 2 fields:
// - board: 2-dimensional array representing the state of the board
// - emptyTile (coordinate of the empty tile on the board

function createPuzzle(width, height){
    //Create a height by width two-dimensional array and fill it with       
    //incrementing numbers
    let board = new Array(height);
    let i = 0;
    for(let row = 0;row < height;row++){
        board[row] = new Array(width);
        for(let col = 0;col<width;col++){
            i++;
            board[row][col] = i;
        }
    }
    
    //Put the empty square in bottom right
    let emptyTile = {x : width-1, y: height-1};

    
    puzzle = { board: board,
               emptyTile:  emptyTile
             }
    scramblePuzzle();
}

function getPuzzleHeight(){
    return puzzle.board.length;
}

function getPuzzleWidth(){
    return puzzle.board[0].length;
}


function getValueAtCoord(coord){
    return puzzle.board[coord.y][coord.x];
}

function setValueAtCoord(coord, value){
    puzzle.board[coord.y][coord.x] = value;
}

function setEmptyCoord(coord){
    setValueAtCoord(coord, 0);
    puzzle.emptyTile = coord;
}

function isSwappable(clickedCoord){
    return areNeigbours(clickedCoord, puzzle.emptyTile) == 1;
}

function isWithinBounds(coord){
    return coord.x >= 0 && coord.x < getPuzzleWidth() &&
        coord.y >= 0 && coord.y < getPuzzleHeight();
}

function findSwapCandidates(){
    let left = getLeftCoordinate(puzzle.emptyTile);
    let right = getRightCoordinate(puzzle.emptyTile);
    let top = getTopCoordinate(puzzle.emptyTile);
    let bottom = getBottomCoordinate(puzzle.emptyTile);
    let candidates = [left, right, top, bottom];
    let result = [];
    for(let i = 0;i< candidates.length; i++){
        if(isWithinBounds(candidates[i])){
            result.push(candidates[i]);
        }
    }
    return result;
} 

function scramblePuzzle(){
    let amountOfSwaps = Math.floor(Math.random()*100*getPuzzleWidth()*getPuzzleHeight());

    //Do odd amount of swaps.
    //This guarantees a different board than the initial one
    if(amountOfSwaps % 2 == 0) amountOfSwaps++;

    while(amountOfSwaps-- > 0){
        performRandomSwap();
    }

}

function performRandomSwap(){
    let candidates = findSwapCandidates();

    //Choose a random element from the possible swap candidates
    let choice = Math.floor(Math.random()*candidates.length);
    swapWithEmpty(candidates[choice]);
}

function swapWithEmpty(toSwap){
    setValueAtCoord(puzzle.emptyTile, getValueAtCoord(toSwap));
    setEmptyCoord(toSwap);
}

//This handler function is called whenever a tile on the board is clicked
function tileClickedHandler(container, clickedPoint){
    if(isSwappable(clickedPoint)){
        swapWithEmpty(clickedPoint);
        drawPuzzle(container);
        checkGameWon();
    }
}

function checkGameWon(){
    for(let row = 0;row<getPuzzleHeight();row++){
        for(let col = 0;col<getPuzzleWidth();col++){
            //Instead of the calculation below, we could also simply increment
            //a counter like we did during board creation
            let expectedValue = row*getPuzzleWidth()+col+1;
            
            //The very last tile is zero (since it is the empty tile)
            if(expectedValue == getPuzzleHeight() * getPuzzleWidth()){
                expectedValue = 0;
            }

            //If a single tile does not have the correct value, the game is not
            //yet won
            if(getValueAtCoord({x : col, y: row}) != expectedValue){
                return false;
            }
        }
    }
    //All tiles must have the correct value, otherwise we would have exited
    //this function in the loop above
    gameWon()
}

function gameWon(){
    alert("You won!");
}

////////////////////////////
// HTML DRAWING FUNCTIONS //
////////////////////////////

function drawPuzzle(container){ 
    //Open a new table
    let tableHtml = "<table>";

    //Now, we can add the html of all our tiles in a loop
    for(let row=0;row<getPuzzleHeight();row++){
        tableHtml += generateRowHtml(row);
    }

    //Close the table
    tableHtml += "</table>";

    //Add the new table to the document
    container.innerHTML = tableHtml;

    //Make all cells in the table clickable by adding listeners
    addCellListeners(container);
}

function generateRowHtml(row){ 
    //Start a new row in the table
    let gameRowHtml = "<tr>";

    //Add all columns in the row
    for(let col=0;col<getPuzzleWidth();col++){
        gameRowHtml += generateTileHtml(row, col);
    }

    //Close the row
    gameRowHtml += "</tr>";
    return gameRowHtml;
}

function generateTileHtml(row, col){
    let gameTileHtml;
    if(areEqual(puzzle.emptyTile, {x: col, y: row})){
        //We give the empty tile a special class so that
        //we can give it a different style in css
        gameTileHtml="<td class='emptyTile'></td>";
    }else{
        gameTileHtml = "<td>"+getValueAtCoord({x: col, y:row})+"</td>";
    }
    return gameTileHtml;
}

function addCellListeners(container){
    let tableElement = container.firstChild;
    for(let row = 0; row < getPuzzleHeight();row++){
        for(let col = 0; col < getPuzzleWidth();col++){
            tableElement.rows[row].cells[col]
                .addEventListener('click',
                                  function(){
                                      tileClickedHandler(container,
                                                         {x: col, y: row}
                                                        )
                                  });
        }
    }
}
