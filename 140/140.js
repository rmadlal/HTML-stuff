var canvas;
var canvasContext;
var x;
var y;
var canJump;
var triangleRotation;
var groundHeight;
var direction;
var horizontalSpeed;
var verticalSpeed;
var platformTime;
var platformDirection;
var platformCoords = [];
var prevPlatformCoords = [];
var platformBounds = [];
var platformOrientations = [];
var platformWaitingTime;
var onPlatform = [];
var touchingPlatform;
var platformsMoving;
//var blockY;

const LEFT_OR_DOWN = 0;
const RIGHT_OR_UP = 1;
const STOP = 2;
const SQUARE_SIZE = 20;
const TRIANGLE_SIZE = 20;
const RADIUS = 10;
const MAX_SPEED = 5;
const JUMP_V0 = -12;
const GROUND_WIDTH = 100;
const NUM_OF_PLATFORMS = 2;
const PLATFORM_SIZE = 40;
//const PLATFORM1_RIGHT = 600;	
//const PLATFORM1_LEFT = 350;
//const PLATFORM2_TOP = 80;
//const PLATFORM2_BOTTOM = 330;
const PLATFORM_SPEED = 5;
const PLATFORM_HORIZONTAL = 0;
const PLATFORM_VERTICAL = 1;
//const BLOCK_X = 600;
//const BLOCK_SIZE = 50;

window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key == 38 || key == 32){
		if (isAirborn())
			canJump = false;
		else if (canJump) {
			verticalSpeed += JUMP_V0;
			for (var i = 0; i < NUM_OF_PLATFORMS; i++) {
				if (onPlatform[i] && platformsMoving && 
					platformDirection == RIGHT_OR_UP && platformOrientations[i] == PLATFORM_VERTICAL) {
					verticalSpeed -= PLATFORM_SPEED-1;
					break;
				}
			}
			canJump = false;
		}
	}
	if (key == 37) {
		direction = LEFT_OR_DOWN;
	}
	if (key == 39) {
		direction = RIGHT_OR_UP;
	}
}

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if ((key == 37 && direction == LEFT_OR_DOWN) || (key == 39 && direction == RIGHT_OR_UP))
		direction = STOP;
	
	if (key == 38 || key == 32)
		canJump = true;
}

window.onload = function() {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');
	initGame();
	var fps = 1000 / 30;
	setInterval(function() { moveEverything(); drawEverything(); }, fps);
	
}

function initGame() {
	//x = (canvas.width - SQUARE_SIZE) / 2;
	x = canvas.width - 100;
	y = canvas.height / 2;
	canJump = true;
	triangleRotation = 30;
	groundHeight = canvas.height - GROUND_WIDTH;
	horizontalSpeed = 0;
	verticalSpeed = 0;
	direction = STOP;
	platformCoords[0] = [canvas.width / 2, groundHeight - 65];
	platformCoords[1] = [(canvas.width / 2) - 150, groundHeight - 130];
	prevPlatformCoords[0] = [canvas.width / 2, groundHeight - 65];
	prevPlatformCoords[1] = [(canvas.width / 2) - 150, groundHeight - 130];
	platformBounds[0] = [350, 600];
	platformBounds[1] = [groundHeight - 330, groundHeight - 80];
	platformOrientations[0] = PLATFORM_HORIZONTAL;
	platformOrientations[1] = PLATFORM_VERTICAL;
	platformWaitingTime = 0;
	onPlatform.length = NUM_OF_PLATFORMS;
	onPlatform.fill(false);
	touchingPlatform = false;
	platformDirection = RIGHT_OR_UP;
	platformsMoving = true;
	//blockY = groundHeight - 50;
}

function moveEverything() {
	
	for (var i = 0; i < NUM_OF_PLATFORMS; i++) {
		movePlatform(i);
	}
	
	var prevX = x;
	var prevY = y;
	x += horizontalSpeed;
	y += verticalSpeed;
	
	//platform collision
	for (var i = 0; i < NUM_OF_PLATFORMS; i++) {
		
		if (x > platformCoords[i][0] - SQUARE_SIZE &&
			x < platformCoords[i][0] + PLATFORM_SIZE) {
			
			if (onPlatform[i] && y == platformCoords[i][1] - SQUARE_SIZE) break;

			if (!onPlatform[i] && prevY <= prevPlatformCoords[i][1] - SQUARE_SIZE &&
				y >= platformCoords[i][1] - SQUARE_SIZE) {
				y = platformCoords[i][1] - SQUARE_SIZE;
				verticalSpeed = 0;
				onPlatform[i] = true;
				break;
			
			}
			if (prevY >= prevPlatformCoords[i][1] + PLATFORM_SIZE &&
				y <= platformCoords[i][1] + PLATFORM_SIZE) {
				
				y = platformCoords[i][1] + PLATFORM_SIZE;
				if (verticalSpeed < 0) {
					verticalSpeed = 0;
					touchingPlatform = true;
				}
				break;
			}
		}
		
		if (y > platformCoords[i][1] - SQUARE_SIZE &&
			y < platformCoords[i][1] + PLATFORM_SIZE) {
			
			if (prevX <= prevPlatformCoords[i][0] - SQUARE_SIZE &&
				x >= platformCoords[i][0] - SQUARE_SIZE) {
				
				x = platformCoords[i][0] - SQUARE_SIZE;
				horizontalSpeed = 0;
				touchingPlatform = true;
				break;
			}
			if (prevX >= prevPlatformCoords[i][0] + PLATFORM_SIZE &&
				x <= platformCoords[i][0] + PLATFORM_SIZE) {
				
				x = platformCoords[i][0] + PLATFORM_SIZE;
				horizontalSpeed = 0;
				touchingPlatform = true;
				break;
			}
		}
		
		onPlatform[i] = false;
		touchingPlatform = false;
	}
	
	//floor collision
	y = Math.min(y, (groundHeight - SQUARE_SIZE));
	
	/*
	//block collision 
	onPlatform[2] = false;
	if (x > BLOCK_X - SQUARE_SIZE && x < BLOCK_X + BLOCK_SIZE) {
		if (prevY < blockY - SQUARE_SIZE && y >= blockY - SQUARE_SIZE) {
			y = blockY - SQUARE_SIZE;
			onPlatform[2] = true;
		} else if (y > blockY - SQUARE_SIZE) {
			if (prevX <= BLOCK_X - SQUARE_SIZE && x >= BLOCK_X - SQUARE_SIZE)
				x = BLOCK_X - SQUARE_SIZE;
			else if (prevX >= BLOCK_X + BLOCK_SIZE && x <= BLOCK_X + BLOCK_SIZE)
				x = BLOCK_X + BLOCK_SIZE;
			touchingPlatform = true;
			horizontalSpeed = 0;
		}
	}
	
	if (y > blockY - SQUARE_SIZE && 
		(x == BLOCK_X + BLOCK_SIZE || x == BLOCK_X - SQUARE_SIZE))
		
		touchingPlatform = true;
	*/	
	
	//wall collision
	if (horizontalSpeed > 0 && x >= canvas.width - SQUARE_SIZE) {
		horizontalSpeed = 0;
		x = canvas.width - SQUARE_SIZE;
	}
	else if (horizontalSpeed < 0 && x <= 0) {
		horizontalSpeed = 0;
		x = 0;
	}
	
	//acceleration
	if (direction == STOP)
		horizontalSpeed = 0;
	else if (direction == RIGHT_OR_UP && horizontalSpeed < MAX_SPEED) 
		horizontalSpeed += MAX_SPEED / 2.0;
	else if (direction == LEFT_OR_DOWN && horizontalSpeed > -MAX_SPEED) 
		horizontalSpeed -= MAX_SPEED / 2.0;
		
	if (isAirborn())
		verticalSpeed++;
	else if (verticalSpeed > 0)
		verticalSpeed = 0;
			
}

function drawEverything() {
	//Game area
	colorRect(0, 0, canvas.width, canvas.height, canvas.style.backgroundColor);
	
	//ground
	colorRect(0, groundHeight, canvas.width, GROUND_WIDTH, 'darkblue');
		
	//solid block
	//colorRect(BLOCK_X, blockY, BLOCK_SIZE, BLOCK_SIZE, 'darkblue');
	
	//player		
	if (!isAirborn()) {
		triangleRotation = 30;
	}
	if (touchingPlatform)
		square();
	else if (isAirborn()) {
		if (horizontalSpeed > 0) {
			triangleRotation = (triangleRotation + 0.9*horizontalSpeed + 0.1*Math.abs(verticalSpeed)) % 360;
		} else if (horizontalSpeed < 0) {
			triangleRotation = (triangleRotation + 0.9*horizontalSpeed - 0.1*Math.abs(verticalSpeed)) % 360;
		}
		triangle();
	} else {		
		if (horizontalSpeed == 0)
			square();
		else
			circle();
	}

	//platforms
	for (var i = 0; i < NUM_OF_PLATFORMS; i++) {
		colorRect(platformCoords[i][0], platformCoords[i][1], PLATFORM_SIZE, PLATFORM_SIZE, 'grey');
	}
}

function isAirborn() {
	return (!isOnAPlatform() && y < groundHeight - SQUARE_SIZE);
}

function isOnAPlatform() {
	return onPlatform.some((value) => value);
	//return (x > BLOCK_X - SQUARE_SIZE && x < BLOCK_X + BLOCK_SIZE &&
	//	y == blockY - SQUARE_SIZE);
}

function movePlatform(i) {
	var j = platformOrientations[i];
	var speed = PLATFORM_SPEED;
	if (j == PLATFORM_VERTICAL) {
		speed *= -1;
	}
	prevPlatformCoords[i][j] = platformCoords[i][j];
	if (platformsMoving) {
		platformCoords[i][j] += platformDirection == RIGHT_OR_UP ? speed : -speed;
		if (platformCoords[i][j] <= platformBounds[i][0] || platformCoords[i][j] >= platformBounds[i][1]) {
			platformsMoving = false;
		}
		if (onPlatform[i]) {
			if (j == PLATFORM_HORIZONTAL) {
				x += platformDirection == RIGHT_OR_UP ? speed : -speed;
			}
			else {
				y += platformDirection == RIGHT_OR_UP ? speed : -speed;
			}
		}
	}
	else {
		if (platformWaitingTime < 50)
			platformWaitingTime++;
		else {
			platformWaitingTime = 0;
			platformsMoving = true;
			platformDirection = 1 - platformDirection;
		}
	}
}

function square() { colorRect(x, y, SQUARE_SIZE, SQUARE_SIZE, 'black'); }

function circle() { colorCircle('black'); }

function triangle() { colorTriangle('black'); }

function colorRect(LeftX, topY, width, height, drawColor) {
	canvasContext.fillStyle = drawColor;
	canvasContext.fillRect(LeftX, topY, width, height);
}

function colorCircle(drawColor) {
	var centerX = x + RADIUS;
	var centerY = y + RADIUS;
	canvasContext.fillStyle = drawColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX, centerY, RADIUS, 0, Math.PI*2, true);
	canvasContext.fill();
}

function colorTriangle(drawColor) {
	var centerX = (2.0 * x + TRIANGLE_SIZE) / 2;
	var centerY = y + TRIANGLE_SIZE * 2.0 / 3;
	var radians = triangleRotation * Math.PI / 180;
	var radius = TRIANGLE_SIZE / Math.sqrt(3);
	var angle1 = radians;
	var angle2 = (angle1 + 1.0/3 * 2 * Math.PI) % (2 * Math.PI);
	var angle3 = (angle2 + 1.0/3 * 2 * Math.PI) % (2 * Math.PI);
	
	canvasContext.fillStyle = drawColor;
	canvasContext.beginPath();
	canvasContext.moveTo(radius * Math.cos(angle1) + centerX, radius * Math.sin(angle1) + centerY);
	canvasContext.lineTo(radius * Math.cos(angle2) + centerX, radius * Math.sin(angle2) + centerY);
	canvasContext.lineTo(radius * Math.cos(angle3) + centerX, radius * Math.sin(angle3) + centerY);
	canvasContext.fill();
}
