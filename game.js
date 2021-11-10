// Returns a list of all the neighbors of a cell
const getNeighbors = (board, col, row) => {
    let xMin = (col - 1) < 0 ? 0:col-1;
    let xMax = ((col + 1) >= board[0].length) ? (board[0].length - 1):(col+1);
    let yMin = (row - 1) < 0 ? 0:(row-1);
    let yMax = ((row + 1) >= board.length) ? (board.length - 1):(row+1);
    const neighbors = [];
    for (let y = yMin; y <= yMax; y++) {
        for (let x = xMin; x <= xMax; x++) {
            if (y === row && x === col) { continue }
            neighbors.push({...board[y][x], x, y});
        }
    }
    return neighbors;
}

const placeBombs = (board, n) => {
    for (let i = 0; i < n; i++) {
        const spot = [0, 0];
        do { // Makes sure bombs are placed in unique spot
            spot[1] = Math.floor(Math.random() * board.length);
            spot[0] = Math.floor(Math.random() * board[0].length);
        } while(board[spot[1]][spot[0]].bomb);
        board[spot[1]][spot[0]].bomb = true;
    }
}

// Sets neighbors field of all cells in board
const countNeighbors = (board) => {
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            board[y][x].neighbors = getNeighbors(board, x, y).filter(n => n.bomb).length;
        }
    }
}

// Makes board. Places bombs and counts neighbors of each cell
const initBoard = (w, h, n) => {
    if (w <= 0 || h <= 0) throw Error('Width and height must be >1');
    const board = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            row.push({neighbors: 0, bomb: false, show: false, flagged: false});
        }
        board.push(row);
    }
    placeBombs(board, n);
    countNeighbors(board);
    return board;
}

// Returns if the player wins or not. If win => flaggs all bombs
// Checks that all spaces without bomb is shown
const win = (board) => {
    let max = board.length * board[0].length;
    let cnt = 0;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            const cell = board[y][x];
            if (cell.bomb) max--;
            if (cell.show) {
                if (cell.bomb) return false;
                cnt++;
            }
        }
    }
    if (cnt === max) { // If win => flagg all
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[0].length; x++) {
                if (board[y][x].bomb && !board[y][x].show) {
                    board[y][x].flagged = true;
                }
            }
        }
        return true
    }
    return false;
}

// Returns true if loss else false
const open = (board, x, y) => {
    const cell = board[y][x];

    if (cell.show) { // If opened a cell that is already open => "cording"
        const neighbors = getNeighbors(board, x, y);
        const count = neighbors.filter(neighbor => neighbor.flagged).length
        if (count === cell.neighbors) { // Only do cording of right number of neighbors is marked
            for (let neighbor of neighbors) {
                if (!neighbor.flagged && !neighbor.show) { // !show to avoid infinite loop
                    if (open(board, neighbor.x, neighbor.y)) { // Recursive call. Only stop if a bomb is opened
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Open normally
	if (!cell.flagged) {
		if (board[y][x].bomb) {return true;}
        board[y][x].show = true;
	}

    // If no neighbors => open recursively
    if (cell.neighbors === 0) {
        getNeighbors(board, x, y).forEach(neighbor => {
            open(board, neighbor.x, neighbor.y);
        });
    }

    return false;
}

// Sets cell.show=true for all cells where cell.bomb==true
const openBombs = (board) => {
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            if (board[y][x].bomb) board[y][x].show = true;
        }
    }
}

// Returns if something was changed or not
const flagg = (board, x, y) => {
    if (!board[y][x].show) {
		board[y][x].flagged = !board[y][x].flagged;
        return true;
	}
    return false;
}

// Returns how many cells have flagged=true
const getCountFlagged = (board) => {
    let cnt = 0;
    for (let y = 0; y < board.length; y++) {
        for(let x = 0; x < board[0].length; x++) {
            if (board[y][x].flagged) cnt++;
        }
    }
    return cnt;
}

export {
    initBoard,
    open,
    flagg,
    win,
    openBombs,
    getCountFlagged,
};