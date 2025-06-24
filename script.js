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
const difficultySelect = document.getElementById('difficulty');

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
  // Get selected difficulty
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  // Set dirty tile chance based on difficulty
  let dirtyChance = 0.15; // default easy
  if (difficulty === 'normal') dirtyChance = 0.28;
  if (difficulty === 'hard') dirtyChance = 0.45;
  for (let y = 0; y < size; y++) {
    let row = [];
    for (let x = 0; x < size; x++) {
      // Only place obstacles if not near start or home
      if (!isNearStartOrHome(x, y) && Math.random() < dirtyChance) {
        row.push('dirty');
      } else {
        row.push('clean');
      }
    }
    maze.push(row);
  }
  // For hard mode, make sure there is a path:
  // Clear the top row and rightmost column
  if (difficulty === 'hard') {
    for (let i = 0; i < size; i++) {
      maze[0][i] = 'clean'; // Top row
      maze[i][size - 1] = 'clean'; // Rightmost column
    }
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

// Update timer display when difficulty changes
if (difficultySelect) {
  difficultySelect.addEventListener('change', function() {
    // Set the time based on selected difficulty
    if (difficultySelect.value === 'easy') time = 30;
    else if (difficultySelect.value === 'normal') time = 20;
    else if (difficultySelect.value === 'hard') time = 10;
    updateUI(); // Update the display
  });
}

function startGame() {
  // Get selected difficulty
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  initMaze();
  player = { x: 0, y: 0 };
  steps = 0;
  water = 100;
  // Set timer based on difficulty
  if (difficulty === 'easy') time = 30;
  else if (difficulty === 'normal') time = 20;
  else if (difficulty === 'hard') time = 10;
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

// Milestone messages for steps
const milestones = [
  { steps: 3, message: "Great start! Keep going!" },
  { steps: 6, message: "Halfway there! You can do it!" },
  { steps: 9, message: "Almost home! Stay focused!" }
];
let milestonesShown = [];

// Show a milestone message in the popup div (non-blocking)
function showMilestoneMessage(message) {
  const popup = document.getElementById('milestone-popup');
  popup.textContent = message;
  popup.style.display = 'block';
  popup.style.opacity = '1';
  // Hide after 2.5 seconds
  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  }, 2500);
}

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

  // Check for milestone messages
  milestones.forEach((milestone, i) => {
    if (steps === milestone.steps && !milestonesShown[i]) {
      showMilestoneMessage(milestone.message);
      milestonesShown[i] = true;
    }
  });

  // If the player steps on a dirty tile, lose water and reset to start
  if (maze[newY][newX] === 'dirty') {
    water -= 15;
    // Remove the dirty water drop after collision
    maze[newY][newX] = 'clean';
    // Animate to the dirty tile, then reset to start
    animatePlayerMove(oldX, oldY, newX, newY, function() {
      player.x = 0;
      player.y = 0;
      drawMaze();
      updateUI();
    });
    updateUI();
    return;
  }

  // Animate the player moving to the new position
  animatePlayerMove(oldX, oldY, newX, newY, function() {
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
  });
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

// Store the most recent game record
let mostRecentRecord = {
  time: null,
  difficulty: '-',
  water: '-',
  steps: '-'
};

// Update the scoreboard table to show the most recent game
function updateScoreboard() {
  document.getElementById('recent-time').textContent = mostRecentRecord.time !== null ? mostRecentRecord.time + 's' : '-';
  document.getElementById('recent-difficulty').textContent = mostRecentRecord.difficulty;
  document.getElementById('recent-water').textContent = mostRecentRecord.water;
  document.getElementById('recent-steps').textContent = mostRecentRecord.steps;
}

function showWinPopup() {
  // Calculate how long the user took to finish the game
  let startingTime = 30;
  if (difficultySelect && difficultySelect.value === 'normal') startingTime = 20;
  if (difficultySelect && difficultySelect.value === 'hard') startingTime = 10;
  const playerTime = startingTime - time;
  const playerDifficulty = difficultySelect ? difficultySelect.value : '-';
  const playerWater = water;
  const playerSteps = steps;

  // Update the most recent record
  mostRecentRecord.time = playerTime;
  mostRecentRecord.difficulty = playerDifficulty;
  mostRecentRecord.water = playerWater + '%';
  mostRecentRecord.steps = playerSteps;
  updateScoreboard();

  // Create the popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'win-popup-overlay';
  overlay.innerHTML = `
    <canvas id="fireworks-canvas"></canvas>
    <div class="win-popup">
      <h2>🎉 You made it home! 🎉</h2>
      <p>Congratulations! You completed the Quest for Water.</p>
      <button id="play-again-btn">Play Again</button>
      <a href="https://www.charitywater.org/" target="_blank" id="learn-more-btn">Learn more about charity: water</a>
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
  fireworksCanvas.style.zIndex = '1000'; // Lower than popup
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

// Helper function to animate player movement
function animatePlayerMove(oldX, oldY, newX, newY, callback) {
  // Animation duration in milliseconds
  const duration = 150;
  const startTime = performance.now();

  function animate(now) {
    // Calculate how far along the animation is (0 to 1)
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    // Calculate the current position between old and new
    const currentX = oldX + (newX - oldX) * t;
    const currentY = oldY + (newY - oldY) * t;
    // Draw the maze without the player
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (maze[y][x] === 'dirty') {
          ctx.fillStyle = 'saddlebrown';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
          ctx.drawImage(dropImg, x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
        } else if (maze[y][x] === 'home') {
          ctx.fillStyle = 'green';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
          ctx.font = `${tileSize - 8}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(homeEmoji, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
        } else {
          ctx.fillStyle = 'lightgray';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
        }
      }
    }
    // Draw the player at the animated position
    ctx.font = `${tileSize - 8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(playerEmoji, currentX * tileSize + tileSize / 2, currentY * tileSize + tileSize / 2);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation done, call the callback
      if (callback) callback();
    }
  }
  requestAnimationFrame(animate);
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
  milestonesShown = [];
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

// Call updateScoreboard on load
updateScoreboard();

