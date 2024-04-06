let state = {
    userInputProgress: false,
    targetSq: null,
    game: null,
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
    state.game = new MagicSq(3, [1,2,3,4,5,6,7,8,9], false, 2500);
    if (state.game.getBoard() === null) {
        alert('Game generation failed due to threshold! Please try again!');
        return;
    }
    populateInterface();
}

function populateInterface() {
    // populate the interface with the generated game
    if (!state.game) return; // return if game dne
    const d = state.game.getDimension() ** 2;
    // populate game using block method to match
    // dom structure
    const board = state.game.getBlocks();
    const squares = document.querySelectorAll('sq');
    const values = [];
    for (let y = 0; y < d; y++) {
        let row = board[y];
        for (let x = 0; x < d; x++) {
            values.push(row[x]);
        }
    }
    if (squares.length !== values.length) {
        // this shouldn't happen, but ┐(ﾟ～ﾟ)┌
        alert('ERROR: Squares count and values count do not match!');
    }
    for (let i = 0; i < squares.length; i++) {
        squares[i].innerHTML = values[i];
    }
}

window.onload = () => {
    const body = document.querySelector('body');


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
