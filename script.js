// Log a message to the console to ensure the script is linked correctly
// console.log('JavaScript file is linked correctly.');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const size = 6;
const tileSize = canvas.width / size;

const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const waterDisplay = document.getElementById('water');
const stepsDisplay = document.getElementById('steps');
const timeDisplay = document.getElementById('time');

let maze = [];
let player = { x: 0, y: 0 };
let home = { x: size - 1, y: size - 1 };
let steps = 0;
let water = 100;
let time = 30;
let gameRunning = false;
let timer;

const dropImg = new Image();
dropImg.src = 'img/drop.png'; // Water drop obstacle image

// Use an emoji for the player character
const playerEmoji = "🚶";
// Use an emoji for the home tile
const homeEmoji = "🏠";

function isNearStartOrHome(x, y) {
  // Check if (x, y) is at or next to start or home
  // Start is (0,0), home is (size-1, size-1)
  // We avoid placing obstacles at these and their adjacent tiles
  const nearStart = (Math.abs(x - 0) <= 1 && Math.abs(y - 0) <= 1);
  const nearHome = (Math.abs(x - (size - 1)) <= 1 && Math.abs(y - (size - 1)) <= 1);
  return nearStart || nearHome;
}

function initMaze() {
  maze = [];
  for (let y = 0; y < size; y++) {
    let row = [];
    for (let x = 0; x < size; x++) {
      // Only place obstacles if not near start or home
      if (!isNearStartOrHome(x, y) && Math.random() < 0.2) {
        row.push('dirty');
      } else {
        row.push('clean');
      }
    }
    maze.push(row);
  }
  maze[0][0] = 'clean'; // Start
  maze[home.y][home.x] = 'home'; // Home
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Draw tile backgrounds
      if (maze[y][x] === 'dirty') {
        // Draw the drop.png image for obstacles
        ctx.fillStyle = 'saddlebrown';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
        ctx.drawImage(dropImg, x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
      } else if (maze[y][x] === 'home') {
        ctx.fillStyle = 'green';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
        // Draw the home emoji on the home tile
        ctx.font = `${tileSize - 8}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(homeEmoji, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
      } else {
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
      }
      // Draw the player character as an emoji
      if (x === player.x && y === player.y) {
        ctx.font = `${tileSize - 8}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(playerEmoji, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
      }
    }
  }
}

function updateUI() {
  waterDisplay.textContent = water;
  stepsDisplay.textContent = steps;
  timeDisplay.textContent = time;
}

function startGame() {
  initMaze();
  player = { x: 0, y: 0 };
  steps = 0;
  water = 100;
  time = 30;
  gameRunning = true;
  startBtn.textContent = 'Game in progress...';
  startBtn.disabled = true;
  timer = setInterval(() => {
    time--;
    water -= 1;
    if (time <= 0 || water <= 0) {
      endGame("Time's up or water depleted!");
    }
    updateUI();
  }, 1000);
  drawMaze();
  updateUI();
}

function showWinPopup() {
  // Create the popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'win-popup-overlay';
  overlay.innerHTML = `
    <div class="win-popup">
      <h2>🎉 You made it home! 🎉</h2>
      <p>Congratulations! You completed the Quest for Water.</p>
      <button id="play-again-btn">Play Again</button>
      <a href="https://www.charitywater.org/" target="_blank" id="learn-more-btn">Learn more about charity: water</a>
      <canvas id="fireworks-canvas"></canvas>
    </div>
  `;
  document.body.appendChild(overlay);

  // Add fireworks/confetti effect behind the popup
  const fireworksCanvas = document.getElementById('fireworks-canvas');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  fireworksCanvas.style.position = 'fixed';
  fireworksCanvas.style.left = '0';
  fireworksCanvas.style.top = '0';
  fireworksCanvas.style.pointerEvents = 'none';
  fireworksCanvas.style.zIndex = '1001';
  startFireworks(fireworksCanvas);

  // Play again button
  document.getElementById('play-again-btn').onclick = function() {
    document.body.removeChild(overlay);
    resetGame();
  };
}

// Simple fireworks/confetti animation for beginners
function startFireworks(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let colors = ['#FFC907', '#2E9DF7', '#4FCB53', '#FF902A', '#F5402C', '#F16061'];

  function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.6 + 50;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = Math.random() * 3 + 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= 0.015;
    });
    particles = particles.filter((p) => p.alpha > 0);
    if (Math.random() < 0.08) createFirework();
    requestAnimationFrame(animate);
  }
  animate();
}

function endGame(message) {
  clearInterval(timer);
  gameRunning = false;
  if (message === 'You made it home!') {
    showWinPopup();
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
    return;
  }
  alert(message);
  startBtn.textContent = 'Start';
  startBtn.disabled = false;
}

// This function moves the player in the given direction
function movePlayer(direction) {
  // Only move if the game is running
  if (!gameRunning) return;

  // Store the player's current position
  const oldX = player.x;
  const oldY = player.y;

  // Calculate the new position based on the direction
  let newX = oldX;
  let newY = oldY;

  if (direction === 'ArrowUp' && oldY > 0) {
    newY--;
  } else if (direction === 'ArrowDown' && oldY < size - 1) {
    newY++;
  } else if (direction === 'ArrowLeft' && oldX > 0) {
    newX--;
  } else if (direction === 'ArrowRight' && oldX < size - 1) {
    newX++;
  }

  // If the new position is the same as the old, don't count as a move
  if (newX === oldX && newY === oldY) {
    // No movement, so do nothing
    return;
  }

  // Check if the new tile is a wall (not used in this game, but for future-proofing)
  if (maze[newY][newX] === 'wall') {
    // Can't move into a wall
    return;
  }

  // Increase the step count only if the player actually moves
  steps++;

  // If the player steps on a dirty tile, lose water and reset to start
  if (maze[newY][newX] === 'dirty') {
    water -= 15;
    player.x = 0;
    player.y = 0;
    drawMaze();
    updateUI();
    return;
  }

  // Update the player's position
  player.x = newX;
  player.y = newY;

  // If the player reaches home, end the game
  if (newX === home.x && newY === home.y) {
    endGame('You made it home!');
  }

  // Redraw the maze and update the UI
  drawMaze();
  updateUI();
}

function resetGame() {
  clearInterval(timer);
  gameRunning = false;
  player = { x: 0, y: 0 };
  steps = 0; // Reset steps
  water = 100; // Reset water to 100%
  time = 30; // Reset time to 30s
  startBtn.textContent = 'Start';
  startBtn.disabled = false;
  initMaze();
  drawMaze();
  updateUI();
}

// Make window.move available as early as possible for on-screen arrow buttons
window.move = function(direction) {
  // For debugging: log the direction
  // Uncomment the next line to see button presses in the console
  // console.log('Button pressed:', direction);
  // Only move if the game is running
  if (!gameRunning) return;
  movePlayer(direction);
};

// Listen for keyboard arrow key presses to move the player
document.addEventListener('keydown', (e) => {
  // Only allow movement if the game is running
  // Prevent the page from scrolling when using arrow keys
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault(); // Stop the browser from scrolling
    movePlayer(e.key); // Move the player in the direction of the arrow key
  }
});

// Add event listeners for Start and Reset buttons (only once)
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initialize maze and UI on load, and make sure Start is enabled (only once)
resetGame(); // Initialize maze on load
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initialize maze and UI on load, and make sure Start is enabled
resetGame(); // Initialize maze on load
