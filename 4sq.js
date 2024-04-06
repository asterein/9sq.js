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

    #board;
    #dimension;
    #inputs;

    constructor(dimension=2, inputs=[1,2,3,4], debug=false, threshold=1000) {
        this.debug = debug;
        this.#dimension = dimension;
        this.#inputs = inputs;
        this.#board = this.#generate(threshold);
    }

    print(game=this.#board, autoPrint=true) {
        if (game === null) return;
        if (game === "_") {
            game = this.#board;
        }
        let board = "";
        for (let y = 0; y < game.length; y++) {
            let printRow = "";
            let row = game[y];
            for (let x = 0; x < row.length; x++) {
                printRow += ` ${row[x]}`;
            }
            board += printRow + "\n";
        }
        if (autoPrint) console.log(board);
        return board;
    }

    validate(game=this.#board) {
        if (game === null) return;
        if (!this.#testGameIsSquare()) return false;
        const rows = this.getRows(game);
        const cols = this.getColumns(game);
        const blocks = this.getBlocks(game);
        if (this.debug) {
            console.log("ROWS: %o", rows);
            console.log("COLS: %o", cols);
            console.log("BLOCKS: %o", blocks);
        }
        for (let i = 0; i < this.#dimension ** 2; i++) {
            if (!this.#validateSection([...rows[i]])) {
                console.log("Fail on row " + i);
                return false;
            }
            if (!this.#validateSection([...cols[i]])) {
                console.log("Fail on col " + i);
                return false;
            }
            if (!this.#validateSection([...blocks[i]])) {
                console.log("Fail on block " + i);
                return false;
            }
        }
        return true;
    }

    getInputs() {
        return this.#inputs;
    }

    getDimension() {
        return this.#dimension;
    }

    getBoard() {
        return this.#board;
    }

    getRows(game=this.#board) {
        return game;
    }

    getColumns(game=this.#board) {
        const columns = [];
        for (let x = 0; x < this.#board.length; x++) {
            let col = [];
            for (let y = 0; y < this.#board.length; y++) {
                col.push(game[y][x]);
            }
            columns.push(col);
        }
        return columns;
    }

    getBlocks(game=this.#board) {
        const blockCount = this.#dimension ** 2;
        const gameDimension = game.length;
        // game dimension must be multiple of dimension
        if (gameDimension % this.#dimension !== 0) return false;
        // split rows
        const innerBlockCount = gameDimension/this.#dimension;
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
                if (x+1 === this.#dimension + (innerBlockIndex * this.#dimension)) {
                    innerBlockIndex += 1;
                }
            }
            splitRows.push(splitRow);
        }
        if (this.debug) console.log("SPLIT ROWS: %o", splitRows);
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
            let block = splitRows[y][x];
            for (let i = 1; i < this.#dimension; i++) {
                block = [].concat(block, splitRows[y+i][x]);
            }
            blocks.push(block);
            if (x +1 === this.#dimension) {
                origin.x = 0;
                origin.y += this.#dimension;
            } else if (x < this.#dimension) {
                origin.x += 1;
            }
            count += 1;
        }
        return blocks;
    }

    #generate(threshold=1000) {
        let tmp = this.#newGame(this.#dimension, this.#inputs);
        let count = 0;
        while (count < threshold && tmp === null) {
            tmp = this.#newGame(this.#dimension, this.#inputs);
            count += 1;
        }
        if (tmp !== null) {
            if (this.debug) console.log("Successfully generated a board after " + count + " attempts");
            return tmp;
        }
        console.error("Failed to generate a board after " + threshold + " attempts");
        return null;
    }

    #blankBoard() {
        const blank = [];
        for (let y = 0; y < this.#dimension ** 2; y++) {
            let row = new Array(this.#dimension).fill(null);
            blank.push(row);
        }
        return blank;
    }

    #newGame(dimension, inputs) {
        if (dimension <= 0) return null;
        if (inputs.length != dimension ** 2) return null;
        const game = [];
        const fill = this.#blankBoard();
        for (let y = 0; y < dimension ** 2; y++) {
            let usableRowInputs = inputs;
            let row = [];
            for (let x = 0; x < dimension ** 2; x++) {
                let usableColInputs = inputs;
                let usedColInputs = [];
                if (y > 0) {
                    for (let i = 0; i < y; i++) {
                        usedColInputs.push(game[i][x]);
                    }
                }
                usableColInputs = [...usableColInputs].filter(val => !usedColInputs.includes(val));
                let usableInputs = [...usableRowInputs].filter(val => usableColInputs.includes(val));
                let randIndex = Math.floor(Math.random() * usableInputs.length);
                if (usableInputs.length === 0) {
                    return null;
                }
                let input = usableInputs[randIndex];
                row.push(input);
                fill[y][x] = input;
                /*
                let tmpBlocks = this.getBlocks(fill);
                if (this.debug) console.log(tmpBlocks);
                for (let i = 0; i < this.#dimension ** 2; i++) {
                    if (!this.#validateSection([...tmpBlocks[i]], false)) return null;
                }
                */
                usableRowInputs = [...usableRowInputs].filter(val => val != input);
            }
            game.push(row);
        }
        return game;
    }

    #validateSection(section=[1,2,3,4], strict=true) {
        if (section.length != this.#inputs.length) return false;
        if (section == null || this.#inputs == null) return false;
        const sortedSection = section.sort();
        const sortedInputs = this.#inputs.sort();
        for (let i = 0; i < this.#inputs.length; i++) {
            if (sortedSection[i] != sortedInputs[i]) {
                if (strict) return false;
                if (sortedSection[i] !== null) return false;
            }
        }
        return true;
    }

    #testGameIsSquare() {
        // make sure the game is square
        const gameHeight = this.#board.length; // get height by counting rows
        for (let i = 0; i < this.#board.length; i++) {
            // each row length should match height
            if (this.#board[i].length != gameHeight) return false;
        }
        return true;
    }
}

function test() {
    const gameState = new Game(2, [1,2,3,4]);
    gameState.print();
    console.log(gameState.validate());

    const game9 = new Game(3, [1,2,3,4,5,6,7,8,9], true);
    game9.print();
    console.log(game9.validate());
}



