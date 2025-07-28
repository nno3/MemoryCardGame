const gridContainer = document.querySelector(".grid-container");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const timerDisplay = document.querySelector(".timer");
const startOverlay = document.getElementById("startOverlay");
const victoryOverlay = document.getElementById("victoryOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameContainer = document.querySelector(".game-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let timer;
let seconds = 0;
let gameStarted = false;
let matchedPairs = 0;
let isPaused = false;

document.querySelector(".score").textContent = score;

// Initialize game
fetch("data/data.json")
    .then((res) => res.json())
    .then((data) => {
        cards = [...data, ...data];
        shuffleCards();
    })
    .catch(error => {
        console.error('Error loading cards:', error);
        alert('Failed to load the game cards. Please check your connection and try again.');
    });

function startGame() {
    gameStarted = true;
    isPaused = false;
    startOverlay.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameContainer.classList.remove('blurred');
    restartBtn.disabled = false;
    pauseBtn.disabled = false;
    seconds = 0;
    score = 0;
    matchedPairs = 0;
    document.querySelector(".score").textContent = score;
    updateTimer();
    timer = setInterval(updateTimer, 1000);
    shuffleCards();
    generateCards();
}

function pauseGame() {
    if (!gameStarted || isPaused) return;
    
    isPaused = true;
    clearInterval(timer);
    pauseOverlay.classList.remove('hidden');
    gameContainer.classList.add('blurred');
    pauseBtn.textContent = 'Paused';
}

function resumeGame() {
    if (!gameStarted || !isPaused) return;
    
    isPaused = false;
    pauseOverlay.classList.add('hidden');
    gameContainer.classList.remove('blurred');
    timer = setInterval(updateTimer, 1000);
    pauseBtn.textContent = 'Pause';
}

function updateTimer() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    seconds++;
}

function shuffleCards () {
    let currentIndex = cards.length,
        randomIndex,
        temporaryValue;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
}



function generateCards () {
    gridContainer.innerHTML = '';
    for (let card of cards) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.setAttribute("data-name", card.name);
        cardElement.innerHTML = `
            <div class="front">
                <img class="front-image" src="${card.image}" onerror="this.onerror=null; console.error('Failed to load image:', this.src);" />
            </div>
            <div class="back"></div> 
        `;

        gridContainer.appendChild(cardElement);
        cardElement.addEventListener("click", flipCard);
    }
}

function flipCard() {
    if (!gameStarted || lockBoard || isPaused) return;
    if (this === firstCard) return;

    this.classList.add("flipped");
    if (!firstCard) {
        firstCard = this;
        return;
    }
    secondCard = this;
    score++;
    document.querySelector(".score").textContent = score;
    lockBoard = true;

    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset. name;
    isMatch ? disableCards() : unflipCards();
}

function tryAgainSameCards() {
    clearInterval(timer);
    resetBoard();
    gameStarted = true;
    isPaused = false;
    victoryOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameContainer.classList.remove('blurred');
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    score = 0;
    seconds = 0;
    matchedPairs = 0;
    document.querySelector(".score").textContent = score;
    timerDisplay.textContent = "00:00";
    updateTimer();
    timer = setInterval(updateTimer, 1000);
    generateCards();
}

function newShuffledGame() {
    clearInterval(timer);
    resetBoard();
    shuffleCards();
    gameStarted = true;
    isPaused = false;
    victoryOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameContainer.classList.remove('blurred');
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    score = 0;
    seconds = 0;
    matchedPairs = 0;
    document.querySelector(".score").textContent = score;
    timerDisplay.textContent = "00:00";
    updateTimer();
    timer = setInterval(updateTimer, 1000);
    generateCards();
}

function showVictoryScreen() {
    clearInterval(timer);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    document.querySelector('.victory-time').textContent = `Time: ${timeString}`;
    document.querySelector('.victory-moves').textContent = `Moves: ${score}`;
    
    victoryOverlay.classList.remove('hidden');
    gameContainer.classList.add('blurred');
}

function checkWinCondition() {
    if (matchedPairs === cards.length / 2) {
        setTimeout(showVictoryScreen, 500);
    }
}

function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    matchedPairs++;
    resetBoard();
    checkWinCondition();
}
function unflipCards () {
    setTimeout (() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000) ;
}

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function restart() {
    clearInterval(timer);
    resetBoard();
    gameStarted = false;
    startOverlay.classList.remove('hidden');
    victoryOverlay.classList.add('hidden');
    gameContainer.classList.add('blurred');
    restartBtn.disabled = true;
    score = 0;
    seconds = 0;
    matchedPairs = 0;
    document.querySelector(".score").textContent = score;
    timerDisplay.textContent = "00:00";
    gridContainer.innerHTML = "";
}

// Initialize the game state
gameContainer.classList.add('blurred');

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', tryAgainSameCards); // "Try Again" button keeps same card positions
playAgainBtn.addEventListener('click', newShuffledGame); // "Play Again" button shuffles cards
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);

