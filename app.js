import { MODES } from './constants';
import { initBoard, open, flagg, win, openBombs, getCountFlagged } from './game';

const out = document.getElementById('out');
const outTime = document.getElementById('time');
const start = document.getElementById('start');
const bombsLeft = document.getElementById('bombs-left');
const inpMode = document.getElementById('mode');
const hsBeginner = document.getElementById('hs-beginner');
const hsIntermadiate = document.getElementById('hs-intermediate');
const hsExpert = document.getElementById('hs-expert');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let highScore = {
	'BEGINNER': 999,
	'INTERMEDIATE': 999,
	'EXPERT': 999,
};
let ls = null;
try {
	ls = window.localStorage;
} catch (_) {}

const updateHighScoreOutput = () => {
	hsBeginner.innerText = highScore['BEGINNER'];
	hsIntermadiate.innerText = highScore['INTERMEDIATE'];
	hsExpert.innerText = highScore['EXPERT'];
}

const loadHighScore = () => {
	if (ls) {
		const loadedHS = ls.getItem('highScore');
		if (loadedHS) {
			highScore = JSON.parse(loadedHS);
		}
	}
	updateHighScoreOutput();
}

loadHighScore();

const setHighScore = (m, score) => {
	if (ls) {
		if (highScore[m] > score) {
			highScore[m] = score;
			updateHighScoreOutput();
			ls.setItem('highScore', JSON.stringify(highScore));
		}
	}
}

let mode = 'BEGINNER';
let scl = 0;

const setCanvas = () => {
	const m = MODES[mode];
	const d = 0.6;
	scl = d * window.innerHeight / m.HEIGHT;
	if (scl * m.WIDTH > window.innerWidth) {
		scl = d * window.innerWidth / m.WIDTH;
	}

	canvas.width = m.WIDTH * scl;
	canvas.height = m.HEIGHT * scl;
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
	bombsLeft.innerText = MODES[mode].BOMBS - getCountFlagged(board) + ' 💣';
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
	const m = MODES[mode];
	board = initBoard(m.WIDTH, m.HEIGHT, m.BOMBS);
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
	let firstClick = false;
	if (finished) return;
	if (!running) {
		firstClick = true;
		startTimer();
	}
	const loss = open(board, x, y);
	if (loss) {
		if (firstClick) {
			reset();
			clicked(x, y);
			return
		}
		finishWithMessage('Boom! You loose');
		openBombs(board);
	}
	if (win(board)) {
		finishWithMessage('You win');
		updateBombCount();
		setHighScore(mode, time);
	}
	drawGame(board);
}

const flagged = (x, y) => {
	if (finished || !running) return;
	// if (!running) {startTimer();}
	if (flagg(board, x, y)) {
		updateBombCount();
		drawGame(board)
	};
}

const getCoords = (event) => {
	const rect = event.target.getBoundingClientRect();
	let x = Math.floor((event.clientX - rect.left) / scl);
	let y = Math.floor((event.clientY - rect.top) / scl);
	const m = MODES[mode];
	if (x >= m.WIDTH) x = m.WIDTH - 1;
	if (y >= m.HEIGHT) y = m.HEIGHT - 1;
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
	const newMode = event.target.value;
	if (!(newMode in MODES)) {
		alert('Did not find mode');
		return;
	}
	mode = newMode;
	reset();
});
