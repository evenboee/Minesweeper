import { MODES } from './constants';
import { initBoard, open, flagg, win, openBombs, getCountFlagged } from './game';

const out = document.getElementById('out');
const outTime = document.getElementById('time');
const start = document.getElementById('start');
const bombsLeft = document.getElementById('bombs-left');
const inpMode = document.getElementById('mode');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let mode = MODES['BEGINNER'];
console.log(mode);
let scl = 0;

const setCanvas = () => {
	const d = 0.6;
	scl = d * window.innerHeight / mode.HEIGHT;
	if (scl * mode.WIDTH > window.innerWidth) {
		scl = d * window.innerWidth / mode.WIDTH;
	}

	canvas.width = mode.WIDTH * scl;
	canvas.height = mode.HEIGHT * scl;
}

const colors = ['blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];

const drawGame = (board) => {
	ctx.font = 0.8*scl+"px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = 'middle';

	ctx.fillStyle = "#bcbcbc";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
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
			ctx.fillRect(x * scl, 0, 1, canvas.height);			
		}
		ctx.fillRect(0, y * scl, canvas.width, 1);
	}
}

let finished;
let board;
let time = 0;
let running = null;

const updateBombCount = () => {
	bombsLeft.innerText = mode.BOMBS - getCountFlagged(board) + ' 💣';
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
	setCanvas();
	board = initBoard(mode.WIDTH, mode.HEIGHT, mode.BOMBS);
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
	if (x >= mode.WIDTH) x = mode.WIDTH - 1;
	if (y >= mode.HEIGHT) y = mode.HEIGHT - 1;
	if (x < 0) x = 0;
	if (y < 0) y = 0;
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

inpMode.addEventListener('change', event => {
	const newMode = MODES[event.target.value];
	if (!newMode) {
		alert('Did not find mode');
		return;
	}
	mode = newMode;
	reset();
});
