const game = document.getElementById('game');
const player = document.getElementById('player');
const backgroundSound = document.getElementById('background-sound');
const shootSound = document.getElementById('shoot-sound');
const toggleSoundButton = document.getElementById('toggle-sound');
const menuButton = document.getElementById('toggle-settings');
const menu = document.getElementById('menu');
const backgroundVolumeControl = document.getElementById('background-volume');
const shootVolumeControl = document.getElementById('shoot-volume');
const restartButton = document.getElementById('restart-button');
const scoreValue = document.getElementById('score-value');
const healthBar = document.getElementById('health');
const gameOverScreen = document.getElementById('game-over');
const restartGameButton = document.getElementById('restart-game');
const startScreen = document.getElementById('start-screen');
const levelSelect = document.getElementById('level-select');
const startButton = document.getElementById('start-button');
const themeButton = document.getElementById('theme-button');
const themeScreen = document.getElementById('theme-screen');
const selectThemeButton = document.getElementById('select-theme-button');
const colisaoSound = document.getElementById('collision-sound');

const gameWidth = game.offsetWidth;
const gameHeight = game.offsetHeight;
let bullets = [];
let enemies = [];
let score = 0;
let health = 100;
let playerX = gameWidth / 2 - 20;
let playerY = gameHeight - 50;
let playerSpeed = 0;
const playerMaxSpeed = 5;
let keys = {};
let shootingInterval = null;
let enemyCreationInterval;
let lastTime = 0;
let soundEnabled = true;

backgroundSound.volume = 1;
backgroundSound.play();

toggleSoundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    backgroundSound.play();
    toggleSoundButton.src = 'img/on.png';
  } else {
    backgroundSound.pause();
    toggleSoundButton.src = 'img/off.png';
  }
});

menuButton.addEventListener('click', () => {
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

backgroundVolumeControl.addEventListener('input', () => {
  backgroundSound.volume = backgroundVolumeControl.value / 100;
});

shootVolumeControl.addEventListener('input', () => {
  shootSound.volume = shootVolumeControl.value / 100;
});

restartButton.addEventListener('click', () => {
  location.reload();
});

restartGameButton.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ' && shootingInterval === null) {
    startShooting();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  if (e.key === ' ') {
    stopShooting();
  }
});

function movePlayer() {
  if (keys['ArrowLeft']) {
    playerSpeed = Math.max(playerSpeed - 0.5, -playerMaxSpeed);
  } else if (keys['ArrowRight']) {
    playerSpeed = Math.min(playerSpeed + 0.5, playerMaxSpeed);
  } else {
    playerSpeed *= 0.9;
  }
  playerX += playerSpeed;
  playerX = Math.min(Math.max(playerX, 0), gameWidth - 40);
  player.style.left = playerX + 'px';
}

function shootBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = playerX + 17 + 'px';
  bullet.style.top = playerY + 'px';
  game.appendChild(bullet);
  bullets.push(bullet);
  if (soundEnabled) {
    const newShootSound = shootSound.cloneNode();
    newShootSound.volume = shootVolumeControl.value / 100;
    newShootSound.play();
  }
}

function startShooting() {
  shootBullet();
  shootingInterval = setInterval(shootBullet, 150);
}

function stopShooting() {
  clearInterval(shootingInterval);
  shootingInterval = null;
}

function moveBullets() {
  bullets.forEach((bullet, bulletIndex) => {
    bullet.style.top = (parseInt(bullet.style.top) - 5) + 'px';
    if (parseInt(bullet.style.top) < 0) {
      bullet.remove();
      bullets.splice(bulletIndex, 1);
    } else {
      enemies.forEach((enemy, enemyIndex) => {
        if (checkCollision(bullet, enemy)) {
          bullet.remove();
          enemy.remove();
          bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);
          colisaoSound.currentTime = 0;
          colisaoSound.play();
          updateScore();
        }
      });
    }
  });
}

function createEnemy() {
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');
  enemy.style.left = Math.random() * (gameWidth - 40) + 'px';
  enemy.style.top = '0px';
  game.appendChild(enemy);
  enemies.push(enemy);
}

function moveEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.style.top = (parseInt(enemy.style.top) + 2) + 'px';
    if (checkCollision(enemy, player)) {
      health -= 10;
      healthBar.style.width = health + '%';
      enemy.remove();
      enemies.splice(index, 1);
      if (health <= 0) {
        endGame();
      }
    }
    if (parseInt(enemy.style.top) > gameHeight) {
      enemy.remove();
      enemies.splice(index, 1);
    }
  });
}

function checkCollision(el1, el2) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right ||
    rect1.right < rect2.left
  );
}

function updateScore() {
  score += 1;
  scoreValue.textContent = score;
}

function endGame() {
  clearInterval(enemyCreationInterval);
  clearInterval(shootingInterval);
  gameOverScreen.style.display = 'block';
}

function resetGame() {
  score = 0;
  health = 100;
  bullets = [];
  enemies = [];
  scoreValue.textContent = score;
  healthBar.style.width = health + '%';
  gameOverScreen.style.display = 'none';
  document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
  document.querySelectorAll('.bullet').forEach(bullet => bullet.remove());
  startGame();
}

function startGame() {
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  health = 100;
  score = 0;
  bullets = [];
  enemies = [];
  scoreValue.textContent = score;
  healthBar.style.width = health + '%';
  playerX = gameWidth / 2 - 20;
  player.style.left = playerX + 'px';
  enemyCreationInterval = setInterval(() => {
    createEnemy();
    updateScore();
  }, 2000);
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  movePlayer();
  moveBullets();
  moveEnemies();
  requestAnimationFrame(gameLoop);
}

startButton.addEventListener('click', startGame);

themeButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  themeScreen.style.display = 'flex';
});

selectThemeButton.addEventListener('click', () => {
  const selectedTheme = document.querySelector('.theme-card.selected');
  if (selectedTheme) {
    const videoSrc = selectedTheme.getAttribute('data-video');
    const backgroundVideo = document.getElementById('background-video');
    backgroundVideo.src = videoSrc;
    backgroundVideo.load();
  }
  themeScreen.style.display = 'none';
  startScreen.style.display = 'flex';
});

document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const aboutButton = document.getElementById('about-button');
  const aboutScreen = document.getElementById('about-screen');

  aboutButton.addEventListener('click', () => {
    aboutScreen.style.display = 'flex';
  });

  aboutScreen.addEventListener('click', (event) => {
    if (event.target === aboutScreen) {
      aboutScreen.style.display = 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const game = document.getElementById('game');
  const player = document.getElementById('player');
  const gameWidth = game.offsetWidth;

  let isTouching = false;
  let initialTouchX = 0;
  let playerInitialX = 0;

  function startTouchShooting() {
    if (shootingInterval === null) {
      startShooting();
    }
  }

  function stopTouchShooting() {
    stopShooting();
  }

  game.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    initialTouchX = touch.clientX;
    playerInitialX = playerX;
    isTouching = true;
    startTouchShooting();
  });

  game.addEventListener('touchmove', (event) => {
    if (isTouching) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - initialTouchX;
      playerX = playerInitialX + deltaX;
      playerX = Math.min(Math.max(playerX, 0), gameWidth - 40);
      player.style.left = playerX + 'px';
    }
  });

  game.addEventListener('touchend', () => {
    isTouching = false;
    stopTouchShooting();
  });
});

