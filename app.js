import { WIDTH, HEIGHT, BOMBS } from './constants';
import { initBoard, open, flagg, win, openBombs, getCountFlagged } from './game';

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