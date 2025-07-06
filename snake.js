const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BLOCK_SIZE = 20;
let SPEED = 150; // easy

// for starting stopping game
let gameInterval;
// starting direction
let direction = 'RIGHT';
let score = 0;
let difficulty = "Easy";
let pause = true;

// start the snake with a head, 1 body segment, and a tail
let snake = [
    { x: 320, y: 240 },
    { x: 300, y: 240 },
    { x: 280, y: 240 }
];

let food = null;

// initialize image variables
const images = {
    head: {
        LEFT: new Image(),
        RIGHT: new Image(),
        UP: new Image(),
        DOWN: new Image()
    },
    tail: {
        LEFT: new Image(),
        RIGHT: new Image(),
        UP: new Image(),
        DOWN: new Image()
    },
    body: new Image(),
    food: new Image()
};

// preload images so they arent glitchy
function preloadImages() {
    images.head.LEFT.src = './imgs/snake_head_left.png';
    images.head.RIGHT.src = './imgs/snake_head_right.png';
    images.head.UP.src = './imgs/snake_head_up.png';
    images.head.DOWN.src = './imgs/snake_head_down.png';

    images.tail.LEFT.src = './imgs/snake_tail_left.png';
    images.tail.RIGHT.src = './imgs/snake_tail_right.png';
    images.tail.UP.src = './imgs/snake_tail_up.png';
    images.tail.DOWN.src = './imgs/snake_tail_down.png';

    images.body.src = './imgs/snake_body.png';
    images.food.src = './imgs/food.png';

    // unpack all image objects into a list so we can asynchronously aquire them at the start of the game
    const allImages = [
        ...Object.values(images.head),
        ...Object.values(images.tail),
        images.body,
        images.food
    ];

    return Promise.all(allImages.map(img => new Promise(resolve => {
        img.onload = resolve;
    })));
}

// for randomly placing food(egg) on screen
function placeFood() {
    let x = Math.floor(Math.random() * (canvas.width / BLOCK_SIZE)) * BLOCK_SIZE;
    let y = Math.floor(Math.random() * (canvas.height / BLOCK_SIZE)) * BLOCK_SIZE;
    // if we place food on the snake recall placeFood function
    if (snake.some(bodyPart => bodyPart.x === x && bodyPart.y === y)) {
        return placeFood();
    }
    // new food placement destination
    return { x, y };
}

function draw() {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(images.food, food.x, food.y, BLOCK_SIZE, BLOCK_SIZE);

    // draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        // beginning of list is the head
        if (i === 0) {
            // draw snakes head based on direction of key pressing
            ctx.drawImage(images.head[direction], segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
            // tail
        } else if (i === snake.length - 1) {
            // body part next to tail
            const nextBodyPart = snake[i - 1];
            let tailDirection;
            if (nextBodyPart.x < segment.x) tailDirection = 'RIGHT';
            else if (nextBodyPart.x > segment.x) tailDirection = 'LEFT';
            else if (nextBodyPart.y < segment.y) tailDirection = 'DOWN';
            else if (nextBodyPart.y > segment.y) tailDirection = 'UP';
            // draw snakes tail based on direction body part next to it
            ctx.drawImage(images.tail[tailDirection], segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
        } else {
            // draw body
            ctx.drawImage(images.body, segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // display score and game difficulty
    ctx.fillStyle = 'white';
    ctx.font = '25px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
    ctx.fillText('Difficulty: ' + difficulty, 150, 25);
}

// moving the snake consists of continuously adding a new head with a new position to 
// the front of snake list wile removing tail, this unshifting and popping will simulate movement.
function moveSnake() {
    // make a shallow copy of snakes head
    const head = { ...snake[0] };
    switch (direction) {
        // movement based on key presses
        case 'RIGHT':
            head.x += BLOCK_SIZE;
            break;
        case 'LEFT':
            head.x -= BLOCK_SIZE;
            break;
        case 'UP':
            head.y -= BLOCK_SIZE;
            break;
        case 'DOWN':
            head.y += BLOCK_SIZE;
            break;
    }

    // check out of bounds
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return gameOver();
    }

    // check if snake overlaps with itself
    if (snake.some((seg, i) => i > 0 && seg.x === head.x && seg.y === head.y)) {
        return gameOver();
    }

    // add updated head copy to from front of list
    snake.unshift(head);

    // if on food update score and randomly place food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = placeFood();
    } else {
        // remove tail to simulate movement
        snake.pop();
    }

    draw();
}

// game must be reset to continue
function gameOver() {
    clearInterval(gameInterval);
    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.fillText('Game Over!', 150, 150);
}

// Keyboard input
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowLeft':
            // this lets the player try to go in the opposite direction without penalty
            if (direction !== 'RIGHT') {
                direction = 'LEFT'
            };
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') {
                direction = 'RIGHT'
            };
            break;
        case 'ArrowUp':
            if (direction !== 'DOWN') {
                direction = 'UP'
            };
            break;
        case 'ArrowDown':
            if (direction !== 'UP') {
                direction = 'DOWN'
            };
            break;
    }
});

// restart game
document.getElementById('resetButton').addEventListener('click', () => {
    location.reload();
});

// pause and play the game
document.getElementById('pauseButton').addEventListener('click', () => {
    pause = !pause;
    if (!pause) {
        gameInterval = setInterval(moveSnake, SPEED);
        document.getElementById('pauseButton').innerHTML = 'Pause';
        document.getElementById('easy').classList.add('hidden');
        document.getElementById('medium').classList.add('hidden');
        document.getElementById('hard').classList.add('hidden');
    } else {
        clearInterval(gameInterval);
        document.getElementById('pauseButton').innerHTML = 'Play';
    }
});

// set difficulty
document.getElementById('easy').addEventListener('click', () => {
    SPEED = 150;
    difficulty = 'Easy';
    draw();
});
document.getElementById('medium').addEventListener('click', () => {
    SPEED = 100;
    difficulty = 'Medium';
    draw();
});
document.getElementById('hard').addEventListener('click', () => {
    SPEED = 50;
    difficulty = 'Hard';
    draw();
});

// Load all images and start game
preloadImages().then(() => {
    food = placeFood();
    draw();
});