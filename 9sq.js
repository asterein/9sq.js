let state = {
    userInputProgress: false,
    targetSq: null,
    game: null,
    toRemove: [],
    mode: 5,
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

function toggleMode() {
    let newGame = state.game !== null ? confirm('Are you sure you want to change modes? This will erase your current game.') : true;
    if (!newGame) return;
    clearInterface();
    resetState();
    if (state.game) {
        state.game = null;
    }
    const mode = document.querySelector('mode');
    if (mode === null) return;
    state.mode = state.mode === 9 ? 0 : state.mode + 1;
    mode.innerHTML = state.mode;
}

function getInterfaceState(dimension=3) {
    // return interface state as blocks
    const squares = document.querySelectorAll('sq');
    const gameDimension = dimension ** 2;
    const gameStateBlocks = [];
    // get blocks
    let block = [];
    let blockCount = 0;
    for (let i = 0; i < squares.length; i++) {
        block.push(squares[i].innerHTML);
        if (i === gameDimension + (blockCount * gameDimension) - 1) {
            gameStateBlocks.push(block);
            blockCount += 1;
            block = [];
        }
    }
    console.log("GAME STATE BLOCKS: %o", gameStateBlocks);
    return gameStateBlocks;
}

function newGame() {
    let newGame = state.game !== null ? confirm('Are you sure you want to start a new game?') : true;
    if (!newGame) return;
    clearInterface();
    state.game = new MagicSq(3, [1,2,3,4,5,6,7,8,9], false, 2500);
    if (state.game.getBoard() === null) {
        alert('Game generation failed due to threshold! Please try again!');
        return;
    }
    generateToRemove(state.game.getDimension() ** 2);
    populateInterface(state.toRemove);
}

function resetGame() {
    clearInterface();
    populateInterface(state.toRemove);
}

function generateToRemove(d) {
    // calculate which squares to remove
    let toRemove = [];
    for (let i = 0; i < state.mode * d; i++) {
        let x = Math.floor(Math.random() * d);
        let y = Math.floor(Math.random() * d);
        let coordinatesExist = toRemove.filter(c => c.x === x && c.y === y);
        let attempt = 0;
        while (coordinatesExist.length > 0 && attempt < state.mode) {
            x = Math.floor(Math.random() * d);
            y = Math.floor(Math.random() * d);
            coordinatesExist = toRemove.filter(c => c.x === x && c.y === y);
            attempt += 1;
        }
        toRemove.push({ x: x, y: y });
    }
    toRemove = toRemove.sort((a,b) => a.y > b.y);
    state.toRemove = toRemove;
    return toRemove;
}

function populateInterface(toRemove=[]) {
    // populate the interface with the generated game
    if (!state.game) return; // return if game dne
    const d = state.game.getDimension() ** 2;
    // populate game using block method to match
    // dom structure
    const board = state.game.getBlocks();
    const squares = document.querySelectorAll('sq');
    const values = [];
    for (let y = 0; y < d; y++) {
        let block = board[y];
        for (let x = 0; x < d; x++) {
            if (state.mode < 9) {
                let skip = false;
                let attempt = 0;
                while (skip === false && attempt < toRemove.length) {
                    if (toRemove[attempt].x == x && toRemove[attempt].y == y) {
                        skip = true;
                    }
                    attempt += 1;
                }
                values.push(skip ? '' : block[x]);
            } else {
                values.push('');
            }
        }
    }
    if (squares.length !== values.length) {
        // this shouldn't happen, but ┐(ﾟ～ﾟ)┌
        alert('ERROR: Squares count and values count do not match!');
    }
    for (let i = 0; i < squares.length; i++) {
        squares[i].innerHTML = values[i];
        if (values[i] !== '') squares[i].classList.add('prefill');
    }
}

function clearInterface() {
    // clear all squares
    const squares = document.querySelectorAll('sq');
    for (let i = 0; i < squares.length; i++) {
        squares[i].innerHTML = '';
        squares[i].classList = '';
    }
}

function play(id) {
    const audio = new Audio(`${id}.mp3`);
    audio.play();
}

window.onload = () => {
    const body = document.querySelector('body');


    body.addEventListener('click', (e) => {
        const isSq = e.target.nodeName === "SQ";
        const isCtrl = e.target.nodeName === "CTRL";

        if (isCtrl && state.targetSq) {
            state.targetSq.innerText = e.target.innerText === 'x' ? '' : e.target.innerText;
        }

        resetState();
        if (isSq && !e.target.classList.contains('prefill')) {
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
