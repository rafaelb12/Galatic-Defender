const game = document.getElementById('game');
const player = document.getElementById('player');
const backgroundSound = document.getElementById('background-sound');
const shootSound = document.getElementById('shoot-sound');
const collisionSound = document.getElementById('collision-sound');
const toggleSoundButton = document.getElementById('toggle-sound');

const gameWidth = game.offsetWidth;
const gameHeight = game.offsetHeight;
let bullets = [];
let enemies = [];

let playerX = gameWidth / 2 - 20;
let playerY = gameHeight - 50;
let playerSpeed = 0;
const playerMaxSpeed = 5;
let keys = {};
let shootingInterval = null;

let soundEnabled = true;

backgroundSound.play();

toggleSoundButton.addEventListener('click', () => {
  if (soundEnabled) {
    backgroundSound.pause();
    toggleSoundButton.src = 'img/off.png';
  } else {
    backgroundSound.play();
    toggleSoundButton.src = 'img/on.png'; 
  }
  soundEnabled = !soundEnabled;
});

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

// Controle por toque
game.addEventListener('touchstart', (e) => {
  const touchX = e.touches[0].clientX;
  keys[touchX < gameWidth / 2 ? 'ArrowLeft' : 'ArrowRight'] = true;

  if (shootingInterval === null) {
    startShooting(); 
  }
});

game.addEventListener('touchend', () => {
  keys['ArrowLeft'] = false; 
  keys['ArrowRight'] = false;
  stopShooting(); 
});

// Função para mover o jogador 
function movePlayer() {
  if (keys['ArrowLeft']) {
    playerSpeed = Math.max(playerSpeed - 0.5, -playerMaxSpeed);
  } else if (keys['ArrowRight']) {
    playerSpeed = Math.min(playerSpeed + 0.5, playerMaxSpeed); 
  } else {
    if (playerSpeed > 0) playerSpeed -= 0.5;
    else if (playerSpeed < 0) playerSpeed += 0.5;
  }

  playerX += playerSpeed;

  if (playerX < 0) playerX = 0;
  if (playerX > gameWidth - 40) playerX = gameWidth - 40;
  player.style.left = playerX + 'px';
}

// Função para criar tiros
function shootBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = playerX + 17 + 'px';
  bullet.style.top = playerY + 'px';
  game.appendChild(bullet);
  bullets.push(bullet);

  if (soundEnabled) {
    const newShootSound = shootSound.cloneNode(); 
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
  bullets.forEach((bullet, index) => {
    let bulletTop = parseInt(bullet.style.top);
    bullet.style.top = bulletTop - 10 + 'px';

    if (bulletTop < 0) {
      bullet.remove();
      bullets.splice(index, 1);
    }
  });
}

// Gerar inimigos
function createEnemy() {
  const enemy = document.createElement('img');
  enemy.src = 'img/inimigo.png';
  enemy.alt = 'Inimigo';
  enemy.className = 'enemy';
  
  enemy.style.position = 'absolute';
  enemy.style.left = Math.random() * (gameWidth - 40) + 'px';
  enemy.style.top = '0px';
  enemy.style.width = '72px';
  enemy.style.height = 'auto'; 
  enemy.style.transform = 'rotate(180deg)';

  game.appendChild(enemy);
  enemies.push(enemy);
}

function moveEnemies() {
  enemies.forEach((enemy, index) => {
    let enemyTop = parseInt(enemy.style.top);
    enemy.style.top = enemyTop + 5 + 'px';

    if (enemyTop > gameHeight) {
      enemy.remove();
      enemies.splice(index, 1);
    }

    // Verifica colisão entre tiro e inimigo
    bullets.forEach((bullet, bulletIndex) => {
      if (isCollision(bullet, enemy)) {
        bullet.remove();
        enemy.remove();
        bullets.splice(bulletIndex, 1);
        enemies.splice(index, 1);

        if (soundEnabled) {
          const newCollisionSound = collisionSound.cloneNode(); 
          newCollisionSound.play();
        }
      }
    });
  });
}

function isCollision(bullet, enemy) {
  const bulletRect = bullet.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();
  return (
    bulletRect.top <= enemyRect.bottom &&
    bulletRect.bottom >= enemyRect.top &&
    bulletRect.left <= enemyRect.right &&
    bulletRect.right >= enemyRect.left
  );
}

function gameLoop() {
  movePlayer();
  moveBullets();
  moveEnemies();
  requestAnimationFrame(gameLoop);
}

setInterval(createEnemy, 1000);
gameLoop();
