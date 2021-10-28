const HEIGHT = 8;
const WIDTH = 8;
const BOMBS = 10;

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
        do {
            spot[1] = Math.floor(Math.random() * board.length);
            spot[0] = Math.floor(Math.random() * board[0].length);
        } while(board[spot[1]][spot[0]].bomb);
        board[spot[1]][spot[0]].bomb = true;
    }
}

const countNeighbors = (board) => {
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            board[y][x].neighbors = getNeighbors(board, x, y).filter(n => n.bomb).length;
        }
    }
}

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
    if (cnt === max) {
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

    if (cell.show) {
        const neighbors = getNeighbors(board, x, y);
        const count = neighbors.filter(neighbor => neighbor.flagged).length
        if (count === cell.neighbors) {
            for (let neighbor of neighbors) {
                if (!neighbor.flagged && !neighbor.show) {
                    if (open(board, neighbor.x, neighbor.y)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

	if (!cell.flagged) {
		board[y][x].show = true;
		if (board[y][x].bomb) {return true;}
	}

    if (cell.neighbors === 0) {
        getNeighbors(board, x, y).forEach(neighbor => {
            open(board, neighbor.x, neighbor.y);
        });
    }

    return false;
}

const openBombs = (board) => {
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            if (board[y][x].bomb) board[y][x].show = true;
        }
    }
}

// Returns if something was changed
const flagg = (board, x, y) => {
    if (!board[y][x].show) {
		board[y][x].flagged = !board[y][x].flagged;
        return true;
	}
    return false;
}

const getCountFlagged = (board) => {
    let cnt = 0;
    for (let y = 0; y < board.length; y++) {
        for(let x = 0; x < board[0].length; x++) {
            if (board[y][x].flagged) cnt++;
        }
    }
    return cnt;
}

const out = document.getElementById('out');
const outTime = document.getElementById('time');
const start = document.getElementById('start');
const bombsLeft = document.getElementById('bombs-left');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const constrainer = Math.min(window.innerWidth, window.innerHeight);
const scl = 0.5 * constrainer / WIDTH;

canvas.width = WIDTH * scl;
canvas.height = HEIGHT * scl;

const colors = ['blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];

const drawGame = (board) => {
	ctx.font = 0.8*scl+"px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = 'middle';

	ctx.fillStyle = "#bcbcbc";
	ctx.fillRect(0, 0, WIDTH * scl, HEIGHT * scl);

	for (let y in board) {
		for (let x in board[y]) {
			const cell = board[y][x];
			if (cell.show) {
				let textColor = "#000";
				let text = '';
				if (cell.bomb) {
					ctx.fillStyle = "#a33";
					ctx.fillRect(x * scl, y * scl, scl, scl);
					text = 'X';
				} else {
					if (cell.neighbors) {
						textColor = colors[cell.neighbors - 1];
						text = cell.neighbors;
					}
				}
				if (text) {
					ctx.fillStyle = textColor;
					ctx.fillText(text, x * scl + scl/2, y * scl+scl/2);
				}
			}
			else {
				ctx.fillStyle = "#333";
				ctx.fillRect(x * scl, y * scl, scl, scl);
				if (cell.flagged) {
					ctx.fillStyle = "#f1f1f1";
					ctx.fillText('P', x * scl + scl/2, y * scl+scl/2); // 🚩
				}
			}
		}
	}
	ctx.fillStyle = "#000";
	for (let y in board) {
		for (let x in board[y]) {
			ctx.fillRect(0, x * scl, WIDTH * scl, 1);
		}
		ctx.fillRect(y * scl, 0, 1, HEIGHT * scl);
	}
}

let finished;
let board;
let time = 0;
let running = null;

const updateBombCount = () => {
	bombsLeft.innerText = BOMBS - getCountFlagged(board) + ' 💣';
}

const updateTime = () => {
	outTime.innerText = '⏱️ ' + time;
}

const startTimer = () => {
	updateTime();
	running = setInterval(() => {
		time++;
		updateTime();
	}, 1000);
}

const stopTimer = () => {
	updateTime();
	if (running) clearInterval(running);
	running = null;
}

const reset = () => {
	out.innerText = '';
	finished = false;
	time = 0;
	stopTimer();
	board = initBoard(WIDTH, HEIGHT, BOMBS);
	updateBombCount();
	drawGame(board);
}

reset();

const finishWithMessage = (message) => {
	stopTimer();
	out.innerText = message;
	finished = true;
}

const clicked = (x, y) => {
	if (finished) return;
	if (!running) {startTimer();}
	const loss = open(board, x, y);
	if (loss) {
		finishWithMessage('Boom! You loose');
		openBombs(board);
	}
	if (win(board)) {
		finishWithMessage('You win');
		updateBombCount();
	}
	drawGame(board);
}

const flagged = (x, y) => {
	if (finished) return;
	if (!running) {startTimer();}
	if (flagg(board, x, y)) {
		updateBombCount();
		drawGame(board)
	};
}

const getCoords = (event) => {
	const rect = event.target.getBoundingClientRect();
	let x = Math.floor((event.clientX - rect.left) / scl);
	let y = Math.floor((event.clientY - rect.top) / scl);
	if (x >= WIDTH) x = WIDTH - 1;
	if (y >= HEIGHT) y = HEIGHT - 1;
	return [x, y];
}

canvas.onmousedown = event => {
	if(event.which === 1) {
		clicked(...getCoords(event));
	} else if (event.which === 3) {
		flagged(...getCoords(event));
	}
}

start.addEventListener('click', event => {
	reset();
});

canvas.oncontextmenu = () => false;