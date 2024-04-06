window.onload = () => {
    const body = document.querySelector('body');
    let state = {
        userInputProgress: false,
        targetSq: null,
    }

    let game = new Game(2, [1,2,3,4]);
    let gameState = game.getBoard();

    function populateInterface() {
        const d = game.getDimension() ** 2;
        const board = game.getBoard();
        const squares = document.querySelectorAll('sq');
        const values = [];
        for (let y = 0; y < d; y++) {
            let row = board[y];
            for (let x = 0; x < d; x++) {
                values.push(row[x]);
            }
        }
        if (squares.length !== values.length) {
            alert('ERROR: Squares count and values count do not match!');
        }
        for (let i = 0; i < squares.length; i++) {
            squares[i].innerHTML = values[i];
        }
    }

    populateInterface();

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
        // if (this.debug) console.log("SPLIT ROWS: %o", splitRows);
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
            let row = new Array(this.#dimension ** 2).fill(null);
            blank.push(row);
        }
        return blank;
    }

    #newGame(dimension, inputs) {
        if (dimension <= 0) return null;
        if (inputs.length != dimension ** 2) return null;
        const delimiter = "xcv";
        const game = [];
        const fill = this.#blankBoard();
        for (let y = 0; y < dimension ** 2; y++) {
            let usableRowInputs = inputs;
            let row = [];
            for (let x = 0; x < dimension ** 2; x++) {
                // get usable block inputs
                let usableBlockInputs = inputs;
                let usedBlockInputs = [];
                if (!(x === 0 && y === 0)) { // skip origin
                    let tmpBlocks = this.getBlocks(fill);
                    for (let i = 0; i < dimension ** 2; i++) {
                        let activeBlock = tmpBlocks[i];
                        if (activeBlock.includes(delimiter)) {
                            for (let v = 0; v < activeBlock.length; v++) {
                                if (activeBlock[v]) usedBlockInputs.push(activeBlock[v]);
                            }
                        }
                    }
                }
                usableBlockInputs = [...usableBlockInputs].filter(val => !usedBlockInputs.includes(val));
                // get usable column inputs
                let usableColInputs = inputs;
                let usedColInputs = [];
                if (y > 0) {
                    for (let i = 0; i < y; i++) {
                        usedColInputs.push(game[i][x]);
                    }
                }
                usableColInputs = [...usableColInputs].filter(val => !usedColInputs.includes(val));
                // get intersection of usable inputs from columns, blocks, and rows
                let usableInputs = [...usableRowInputs].filter(val => usableColInputs.includes(val) && usableBlockInputs.includes(val));
                if (this.debug) {
                    this.print(fill);
                    console.log("USABLE ROW INPUTS: %o", usableRowInputs);
                    console.log("USABLE COL INPUTS: %o", usableColInputs);
                    console.log("USABLE BLOCK INPUTS: %o", usableBlockInputs);
                    console.log("CALCULATED USABLE INPUTS: %o", usableInputs);
                }
                let randIndex = Math.floor(Math.random() * usableInputs.length);
                if (usableInputs.length === 0) {
                    return null;
                }
                let input = usableInputs[randIndex];
                fill[y][x] = input;
                // set the next cell as the delimiter
                if (x === (dimension ** 2) - 1 && y === (dimension ** 2) - 1) {
                    // no delimiter, we're at the end of the board
                } else if (x === (dimension ** 2) - 1) {
                    fill[y+1][0] = delimiter;
                } else {
                    fill[y][x+1] = delimiter;
                }
                row.push(input);
                // filter out used input
                usableRowInputs = [...usableRowInputs].filter(val => val != input);
            }
            game.push(row);
        }
        return game;
    }

    #validateSection(section=[1,2,3,4]) {
        // make sue the section matches the given inputs
        if (section.length != this.#inputs.length) return false;
        if (section == null || this.#inputs == null) return false;
        const sortedSection = section.sort();
        const sortedInputs = this.#inputs.sort();
        for (let i = 0; i < this.#inputs.length; i++) {
            if (sortedSection[i] != sortedInputs[i]) return false;
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
