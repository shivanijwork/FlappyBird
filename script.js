//board
let board;
let boardWidth = 400;
let boardHeight = 600;
let context;

//bird
let birdWidth = 34;   //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
// let birdImg;
let birdImgs =[];
let birdImgsIndex = 0; // Index to keep track of the current bird image

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; // Speed of the pipes moving towards the bird
let velocityY = 0; //bird jump speed

let gameOver = false; // Flag to check if the game is over
let score = 0;
let highestScore = localStorage.getItem("flappyHighScore") || 0;

let wingSound = new Audio('sfx_wing.wav');
let hitSound = new Audio('sfx_hit.wav');
let bgm = new Audio('bgm_mario.mp3');

window.onload = function () {
    // Initialize the board
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");   //used for drawing on the canvas

    // Draw the bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load the bird image
    // birdImg = new Image();
    // birdImg.src = 'flappybird.png';
    // birdImg.onload = function () {
    //     context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    // }

    for (let i = 1; i <= 3; i++) {
        let birdImg = new Image();
        birdImg.src = `flappybird${i}.png`; // Assuming images are named flappybird1.png, flappybird2.png, flappybird3.png
        birdImgs.push(birdImg);
    }

    // Load the pipe images
    topPipeImg = new Image();
    topPipeImg.src = 'toppipe.png';

    bottomPipeImg = new Image();
    bottomPipeImg.src = 'bottompipe.png';

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Place pipes every 1.5 seconds
    setInterval(animatedBird, 100); // Change bird image every 100ms

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird); // For mobile devices
    bgm.loop = true;
    bgm.play();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        context.fillStyle = "red";
        context.font = "30px Arial";
        context.fillText("Game Over 😢", boardWidth / 4, boardHeight / 2);
        bgm.pause(); // Stop the background music when the game is over
        bgm.currentTime = 0; // Reset the background music to the beginning
        return;
    }
    // Clear the board
    context.clearRect(0, 0, boardWidth, boardHeight);

    //draw the bird
    bird.y += velocityY; // Apply vertical velocity to the bird
    if (bird.y + bird.height > boardHeight) {
        bird.y = boardHeight - bird.height;
        velocityY = 0;
        gameOver = true;
        context.fillStyle = "red";
        context.font = "30px Arial";
        context.fillText("Game Over 😢", boardWidth / 4, boardHeight / 2);
        return;
    } else if (bird.y < 0) {
        bird.y = 0;
        velocityY = 0;
    }
    velocityY += 0.2; // Gravity effect
    context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);
    // birdImgsIndex++;
    // birdImgsIndex %= birdImgs.length; // Cycle through bird images 0 1 2 3 then back to 0 1 2 3

    // Draw the pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // Move the pipe towards the left
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passes && bird.x > pipe.x + pipe.width) {
            pipe.passed = true; // Mark the pipe as passed
            score += 0.5; // Increment score when the bird passes a pipe
            pipe.passes = true; // Prevent multiple score increments for the same pipe
        }
        // Check for collision
        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true; // Set game over flag if the bird collides with a pipe
        }
    }
    // Remove pipes that have gone off the screen
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Remove first element from the array
    }

    //Score
    context.fillStyle = "black";
    context.font = "30px sans-serif";
    context.fillText("Score : " + score, 5, 45);

    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem("flappyHighScore", highestScore);
    }

    context.fillStyle = "black";
    context.font = "24px sans-serif";
    context.fillText("Highest Score : " + highestScore, 5, 75);


}

function placePipes() {
    if (gameOver) {
        return;
    }
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2); // Randomize the Y position of the top pipe
    let openingSpace = board.height / 4; // Space between the top and bottom pipes
    let topPipe = {
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        img: topPipeImg,
        passed: false // Flag to check if the pipe has been passed by the bird
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace, // Position the bottom pipe below the top pipe with a gap
        width: pipeWidth,
        height: pipeHeight,
        img: bottomPipeImg,
        passed: false // Flag to check if the pipe has been passed by the bird
    }
    pipeArray.push(bottomPipe);
}

function moveBird(event) {
    // Check if the event is a keydown or touchstart
    if (event.type === "keydown" || event.type === "touchstart") {
        // Prevent default action for touch events
        if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyX") {
            // event.preventDefault(); // Prevent scrolling on space or arrow keys
            //jump
            if (bgm.paused) {
                bgm.play(); // Play the background music if it was paused
            }
            wingSound.play();
            velocityY = -6; // Set a negative velocity to make the bird jump up
        }
        if (event.type === "touchstart") {
            // event.preventDefault();
            if (!bgm.paused) {
                bgm.play(); // Play the background music if it was paused
            }
            wingSound.play();
            velocityY = -6;
        }
        if (gameOver) {
            // Reset the game if it was over
            gameOver = false;
            score = 0;
            pipeArray = []; // Clear the pipes
            bird.y = birdY; // Reset bird position
            velocityY = 0; // Reset vertical velocity
        }
    }
}
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;

}

function animatedBird() {
    // Change the bird image every 100ms
    birdImgsIndex++;
    birdImgsIndex %= birdImgs.length; // Cycle through bird images 0 1 2 3 then back to 0 1 2 3
}