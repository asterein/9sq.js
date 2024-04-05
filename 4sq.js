window.onload = () => {
    const body = document.querySelector('body');
    let state = {
        userInputProgress: false,
        targetSq: null,
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
    constructor(dimension=2, inputs=[1,2,3,4], debug=false) {
        this.d = dimension;
        this.dimension = dimension;
        this.inputs = inputs;
        this.debug = debug;
        this.board = this.newGame(this.d, this.inputs);
    }

    newGame(dimension, inputs) {
        if (dimension <= 0) return null;
        if (inputs.length != dimension ** 2) return null;
        const game = [];
        for (let y = 0; y < dimension ** 2; y++) {
            let usableInputs = inputs;
            let row = [];
            for (let x = 0; x < dimension ** 2; x++) {
                let randIndex = Math.floor(Math.random() * usableInputs.length);
                let input = usableInputs[randIndex];
                row.push(input);
                usableInputs = usableInputs.filter(val => val != input);
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

    validate() {
        if (!this.testGameIsSquare()) return false;
        const rows = this.getRows();
        const cols = this.getColumns();
        const blocks = this.getBlocks();
        console.log("ROWS: %o", rows);
        console.log("COLS: %o", cols);
        console.log("BLOCKS: %o", blocks);
        for (let i = 0; i < this.d ** 2; i++) {
            if (!this.validateSection([...rows[i]])) {
                console.log("Fail on row " + i);
                return false;
            }
            if (!this.validateSection([...cols[i]])) {
                console.log("Fail on col " + i);
                return false;
            }
            if (!this.validateSection([...blocks[i]])) {
                console.log("Fail on block " + i);
                return false;
            }
        }
        return true;
    }

    getRows() {
        return this.board;
    }

    getColumns() {
        const columns = [];
        for (let x = 0; x < this.board.length; x++) {
            let col = [];
            for (let y = 0; y < this.board.length; y++) {
                col.push(this.board[y][x]);
            }
            columns.push(col);
        }
        return columns;
    }

    getBlocks() {
        const blockCount = this.dimension ** 2;
        const gameDimension = this.board.length;
        // game dimension must be multiple of dimension
        if (gameDimension % this.dimension !== 0) return false;
        // split rows
        const innerBlockCount = gameDimension/this.dimension;
        const splitRows = [];
        for (let y = 0; y < gameDimension; y++) {
            let splitRow = [];
            let row = this.board[y];
            for (let i = 0; i < innerBlockCount; i++) {
                splitRow.push([]);
            }
            let innerBlockIndex = 0;
            for (let x = 0; x < gameDimension; x++) {
                splitRow[innerBlockIndex].push(row[x]);
                if (x+1 === this.dimension + (innerBlockIndex * this.dimension)) {
                    innerBlockIndex += 1;
                }
            }
            splitRows.push(splitRow);
        }
        // generate blocks
        const blocks = [];
        const origin = {
            x: 0,
            y: 0,
        }
        let count = 0;
        while (count < blockCount) {
            let y = origin.y;
            let x = origin.x;
            let block = splitRows[y][x].toString();
            for (let i = 1; i < this.dimension; i++) {
                block += "," + splitRows[y + i][x].toString();
            }
            blocks.push(block.split(","));
            if (x +1 === this.dimension) {
                origin.x = 0;
                origin.y += this.dimension;
            } else if (x < this.dimension) {
                origin.x += 1;
            }
            count += 1;
        }
        return blocks;
    }

    validateSection(section=[1,2,3,4]) {
        if (section.length != this.inputs.length) return false;
        if (section == null || this.inputs == null) return false;
        const sortedSection = section.sort();
        const sortedInputs = this.inputs.sort();
        for (let i = 0; i < this.inputs.length; i++) {
            if (sortedSection[i] != sortedInputs[i]) return false;
        }
        return true;
    }

    testGameIsSquare() {
        // make sure the game is square
        const gameHeight = this.board.length; // get height by counting rows
        for (let i = 0; i < this.board.length; i++) {
            // each row length should match height
            if (this.board[i].length != gameHeight) return false;
        }
        return true;
    }
}

function test() {
    const gameState = new Game(2, [1,2,3,4]);
    gameState.print();
    console.log(gameState.validate());

    const game9 = new Game(3, [1,2,3,4,5,6,7,8,9]);
    game9.debug = true;
    game9.print();
    console.log(game9.validate());
}



