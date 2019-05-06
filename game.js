class Coordinate{
    constructor(x, y){
	this.x = x;
	this.y = y;
    }
    
    isNextTo(other){
	if(this.x == other.x){
	    return Math.abs(this.y-other.y) == 1;
	}else if(this.y == other.y){
	    return Math.abs(this.x-other.x) == 1;
	}
	return false;
    }

    getLeft(){
	return new Coordinate(this.x - 1, this.y);
    }

    getRight(){
	return new Coordinate(this.x + 1, this.y);
    }

    getTop(){
	return new Coordinate(this.x, this.y-1);
    }

    getBottom(){
	return new Coordinate(this.x, this.y+1);
    }
}

class SlidingPuzzle {

    ///////////////////
    // Puzzle set-up //
    ///////////////////
   
    constructor(container, width, height){
	this.container = container;
	this.width = width;
	this.height = height;
	this.generateBoard();
	this.drawBoard();
    }

    generateBoard(){
	let row, col;
	let i = 0;

	//Create a height by width two-dimensional array and fill it with       
	//incrementing numbers
	this.board = new Array(this.height);
	for(row = 0;row<this.height;row++){
	    this.board[row] = new Array(this.width);
	    for(col = 0;col<this.width;col++){
		i++;
		this.board[row][col] = i;
	    }
	}
	//Put the empty square in bottom right
	this.setEmptyPoint(new Coordinate(this.width-1, this.height-1));

	//At this point, we have board in a solved state
	//Time to scramble it
	this.scramble();
    }

    scramble(){
	let amount = Math.floor(Math.random()*100*this.width*this.height);

	//Do odd amount of swaps.
	//This guarantees a different board than the initial one
	if(amount % 2 == 0) amount++;

	while(amount-- > 0){
	    this.performRandomSwap();
	}
    }

    performRandomSwap(){
    	let candidates = this.findSwapCandidates();

	//Choose a random element from the possible swap candidates
    	let choice = Math.floor(Math.random()*candidates.length);
    	this.swapWithEmpty(candidates[choice]);
    }
        
    ////////////////
    // GAME LOGIC //
    ////////////////

    getBoardHeight(){
	return this.board.length;
    }

    getBoardWidth(){
	return this.width;
    }

    getValueAtPoint(point){
	return this.board[point.y][point.x];
    } 

    setValueAtPoint(point, value){
	this.board[point.y][point.x] = value;
    }

    setEmptyPoint(point){
	this.setValueAtPoint(point, 0);
	this.emptyPoint = point;
    }

    isSwappable(clickedPoint){
	return clickedPoint.isNextTo(this.emptyPoint) == 1;
    }

    isWithinBounds(point){
	return point.x >= 0 && point.x < this.width &&
	    point.y >= 0 && point.y < this.height;
    }

    findSwapCandidates(){
    	let left = this.emptyPoint.getLeft();
    	let right = this.emptyPoint.getRight();
    	let top = this.emptyPoint.getTop();
    	let bottom = this.emptyPoint.getBottom();
    	let candidates = [left, right, top, bottom];
    	let i;
    	let result = [];
    	for(i = 0;i< candidates.length; i++){
    	    if(this.isWithinBounds(candidates[i])){
    	 	result.push(candidates[i]);
    	    }
    	}
    	return result;
    } 
    
    swapWithEmpty(newPoint){
	this.setValueAtPoint(this.emptyPoint, this.getValueAtPoint(newPoint));
	this.setEmptyPoint(newPoint);
    }

    //This handler function is called whenever a tile on the board is clicked
    tileClickedHandler(clickedPoint){
	if(this.isSwappable(clickedPoint)){
	    this.swapWithEmpty(clickedPoint);
	    this.drawBoard();
	    this.checkGameWon();	
	}
    }

    checkGameWon(){
	let row, col;
	for(row = 0;row<this.height;row++){
	    for(col = 0;col<this.width;col++){
		//Instead of the calculation below, we could also simply increment
		//a counter like we did during board creation
		let expectedValue = row*this.width+col+1;
		
		//The very last tile is zero (since it is the empty tile)
		if(expectedValue == this.height * this.width){
		    expectedValue = 0;
		}

		//If a single tile does not have the correct value, the game is not
		//yet won
		if(this.getValueAtPoint(new Coordinate(col, row)) != expectedValue){
		    return false;
		}
	    }
	}
	//All tiles must have the correct value, otherwise we would have exited
	//this function in the loop above
	this.gameWon()
    }

    gameWon(){
	alert("You won!");
    }

    ////////////////////////////
    // HTML DRAWING FUNCTIONS //
    ////////////////////////////

    drawBoard(){
	let row;
	
	//Open a new table
	let tableHtml = "<table>";

	//Now, we can add the html of all our tiles in a loop
	for(row=0;row<this.height;row++){
	    tableHtml += this.generateRowHtml(row);
	}

	//Close the table
	tableHtml += "</table>";

	//Add the new table to the document
	this.container.innerHTML = tableHtml;

	//Make all cells in the table clickable by adding listeners
	this.addCellListeners();
    }

    generateRowHtml(row){
	let col;
	
	//Start a new row in the table
	let gameRowHtml = "<tr>";

	//Add all columns in the row
	for(col=0;col<this.width;col++){
	    gameRowHtml += this.generateTileHtml(row, col);
	}

	//Close the row
	gameRowHtml += "</tr>";

	return gameRowHtml;
    }

    generateTileHtml(row, col){
	let value = this.getValueAtPoint(new Coordinate(col, row));
	let gameTileHtml;
	if(value == 0){
	    //We give the empty tile a special class so that
	    //we can give it a different style in css
	    gameTileHtml="<td class='emptyTile'></td>";
	}else{
	    gameTileHtml = "<td>"+value+"</td>";
	}
	return gameTileHtml;
    }

    addCellListeners(){
	let row, col;
	let tableElement = this.container.firstChild;
	let game = this;
	for(row = 0; row < this.height;row++){
	    for(col = 0; col < this.width;col++){
		//currying is needed to make sure we get the correct row/col values
		tableElement.rows[row].cells[col]
		    .addEventListener('click',
				      function(row, col){
					  return function(){
					      game.tileClickedHandler(
						  new Coordinate(col, row)
					      );
					  };
				      }(row, col));
	    }
	}
    }
}


///////////////////////
// FINAL GAME SET-UP //
///////////////////////

function newGameHandler(){
    //Find the board container in the HTML document
    let container = document.getElementById("board_container");
    
    //Create a new sliding puzzle inside of this board container
    let puzzle = new SlidingPuzzle(container, 3, 3);
}


function pageLoadHandler(){
    //Find the new game button in the HTML document
    let newGameButton = document.getElementById("new_game_btn");

    //Whenever the new game button is clicked, call the function newGameHandler
    newGameButton.addEventListener('click', newGameHandler);

    //Start new game on app launch without clicking the New Game button
    newGameHandler();

}
