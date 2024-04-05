window.onload = () => {
    const body = document.querySelector('body');
    let state = {
        userInputProgress: false,
        targetSq: null,
    }

    let gameState = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
    ];

    function randomGame() {
    }

    function testGame() {
        
    }

    function resetState() {
        if (state.userInputProgress) {
            state.userInputProgress = false;
        }
        if (state.targetSq) {
            state.targetSq.classList.remove('updating');
            state.targetSq = null;
        }
    }

    body.addEventListener('click', (e) => {
       resetState();
        const isSq = e.target.nodeName === "SQ";

        if (isSq) {
            state.userInputProgress = true;
            e.target.classList.add('updating');
            state.targetSq = e.target;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (state.userInputProgress) {
            state.targetSq.innerText = e.key;
            resetState();
        }
    });
}

class Game {
    constructor(dimension=2, inputs=[1,2,3,4]) {
        this.d = dimension;
        this.dimension = dimension;
        this.inputs = inputs;
        this.board = this.generateGame(this.d, this.inputs);
    }

    generateGame(dimension, inputs) {
        if (dimension <= 0) return null;
        if (inputs.length != dimension ** 2) return null;
        const game = [];
        for (let y = 0; y < dimension ** 2; y++) {
            let row = [];
            for (let x = 0; x < dimension ** 2; x++) {
                let randIndex = Math.floor(Math.random() * inputs.length);
                row.push(inputs[randIndex]);
            }
            game.push(row);
        }
        return game;
    }

    print(autoPrint=true) {
        let board = "";
        for (let y = 0; y < this.board.length; y++) {
            let printRow = "";
            let row = this.board[y];
            for (let x = 0; x < row.length; x++) {
                printRow += ` ${row[x]}`;
            }
            board += printRow + "\n";
        }
        if (autoPrint) console.log(board);
        return board;
    }
}

function test() {
    const gameState = new Game(2, [1,2,3,4]);
    gameState.print();
    testBlocks(gameState.board, 2);

    const game9 = new Game(3, [1,2,3,4,5,6,7,8,9]);
    game9.print();
    testBlocks(game9.board, 3);
}

function validateGame(game, dimension=2) {
    // check a game is valid
    // returns [ bool, errorCode: string ]
    if (!testGameIsSquare(game)) return [false, 'sq'];
    if (!testRows(game)) return [false, 'r0'];
    if (!testColumns(game)) return [false, 'c0'];
    if (!testBlocks(game, dimension)) return [false, 'bl'];
    return [true, null];
}

function validateSection(section=['1', '2', '3', '4'], expected=['1', '2', '3', '4']) {
    if (section.length != expected.length) return false;
    if (section == null || expected == null) return false;
    const sorted = section.sort();
    for (let i = 0; i < expected.length; i++) {
        if (sorted[i] != expected[i]) return false;
    }
    return true;
}

function testBlocks(game, dimension=2) {
    const blockCount = dimension ** 2;
    const gameDimension = game.length;
    // game dimension must be multiple of dimension
    if (gameDimension % dimension !== 0) return false;
    // generate blocks
    const innerBlockCount = gameDimension/dimension;
    const splitRows = [];
    for (let y = 0; y < gameDimension; y++) {
        let splitRow = [];
        let row = game[y];
        for (let i = 0; i < innerBlockCount; i++) {
            splitRow.push([]);
        }
        let innerBlockIndex = 0;
        for (let x = 0; x < gameDimension; x++) {
            splitRow[innerBlockIndex].push(row[x]);
            if (x+1 === dimension + (innerBlockIndex * dimension)) {
                innerBlockIndex += 1;
            }
        }
        splitRows.push(splitRow);
    }
    console.log(splitRows);
    return true;
}

function testGameIsSquare(game) {
    // make sure the game is square
    const gameHeight = game[0].length; // get height by counting rows
    for (let i = 0; i < game.length; i++) {
        // each row length should match height
        if (game[i].length != gameHeight) return false;
    }
    return true;
}

function testColumns(game, debug=false) {
    // generate columns
    const columns = [];
    for (let c = 0; c < columnHeight; c++) {
        let column = [];
        for (let r = 0; r < columnHeight; r++) {
            column.push(game[r][c]);
        }
        columns.push(column);
    }
    if(debug) console.log("COLS: %o", columns);
    // make sure the game is still square
    if (columns.length != game.length) return false;
    // validate each column
    for (let i = 0; i < columns.length; i++) {
        if (!validateSection(columns[i])) return false;
    }
    return true;
}

function testRows(game, debug=false) {
    if(debug) console.log("ROWS: %o", game);
    // validate each row
    for (let i = 0; i < game.length; i++) {
        if(!validateSection(game[i])) return false;
    }
    return true;
}

