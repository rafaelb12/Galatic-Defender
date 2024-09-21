const game = document.getElementById('game');
const player = document.getElementById('player');
const backgroundSound = document.getElementById('background-sound');
const shootSound = document.getElementById('shoot-sound');
const toggleSoundButton = document.getElementById('toggle-sound');
const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu');
const backgroundVolumeControl = document.getElementById('background-volume');
const shootVolumeControl = document.getElementById('shoot-volume');
const restartButton = document.getElementById('restart-button');
const scoreValue = document.getElementById('score-value');
const healthBar = document.getElementById('health');
const gameOverScreen = document.getElementById('game-over');
const restartGameButton = document.getElementById('restart-game');

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

// Controle de som de fundo
let soundEnabled = true;

// Iniciar o som de fundo
backgroundSound.play();
backgroundSound.volume = 1;

// Alternar som de fundo
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

// Exibir ou ocultar o menu
menuButton.addEventListener('click', () => {
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

// Atualizar volume do som de fundo
backgroundVolumeControl.addEventListener('input', () => {
  backgroundSound.volume = backgroundVolumeControl.value / 100;
});

// Atualizar volume do som de tiro
shootVolumeControl.addEventListener('input', () => {
  shootSound.volume = shootVolumeControl.value / 100;
});

// Reiniciar o jogo
restartButton.addEventListener('click', () => {
  location.reload();
});

// Reiniciar o jogo após Game Over
restartGameButton.addEventListener('click', resetGame);

// Detectar teclas pressionadas
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

// Mover a nave conforme o toque
game.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const touchX = touch.clientX - game.getBoundingClientRect().left;
  playerX = Math.min(Math.max(touchX - player.offsetWidth / 2, 0), gameWidth - 40);
  player.style.left = playerX + 'px';
});

game.addEventListener('touchend', () => {
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
  stopShooting();
});

// Mover o jogador
function movePlayer() {
  if (keys['ArrowLeft']) {
    playerSpeed = Math.max(playerSpeed - 0.5, -playerMaxSpeed);
  } else if (keys['ArrowRight']) {
    playerSpeed = Math.min(playerSpeed + 0.5, playerMaxSpeed);
  } else {
    playerSpeed *= 0.9; // Reduz a velocidade gradualmente
  }

  playerX += playerSpeed;
  playerX = Math.min(Math.max(playerX, 0), gameWidth - 40);
  player.style.left = playerX + 'px';
}

// Criar tiros
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

// Inicia o disparo contínuo
function startShooting() {
  shootBullet();
  shootingInterval = setInterval(shootBullet, 150);
}

// Para o disparo contínuo
function stopShooting() {
  clearInterval(shootingInterval);
  shootingInterval = null;
}

// Mover balas
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

// Criar inimigos
function createEnemy() {
  if (enemies.length < 10) {
    const enemy = document.createElement('img');
    enemy.src = 'img/inimigo.png';
    enemy.alt = 'Inimigo';
    enemy.className = 'enemy';
    enemy.style.position = 'absolute';
    enemy.style.left = Math.random() * (gameWidth - 40) + 'px';
    enemy.style.top = '0px';
    enemy.style.width = '72px';
    game.appendChild(enemy);
    enemies.push(enemy);
  }
}

// Mover inimigos
function moveEnemies() {
  enemies.forEach((enemy, index) => {
    let enemyTop = parseInt(enemy.style.top);
    enemy.style.top = enemyTop + 5 + 'px';

    if (enemyTop > gameHeight) {
      enemy.remove();
      enemies.splice(index, 1);
      decreaseHealth();
    }

    bullets.forEach((bullet, bulletIndex) => {
      if (isColliding(bullet, enemy)) {
        score++;
        scoreValue.textContent = score;
        bullet.remove();
        bullets.splice(bulletIndex, 1);
        enemy.remove();
        enemies.splice(index, 1);
      }
    });

    if (isColliding(player, enemy)) {
      decreaseHealth();
      enemy.remove();
      enemies.splice(index, 1);
    }
  });
}

// Verificar colisão
function isColliding(a, b) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();
  return !(rectA.top > rectB.bottom || rectA.bottom < rectB.top || rectA.right < rectB.left || rectA.left > rectB.right);
}

// Diminuir saúde
function decreaseHealth() {
  health -= 10;
  healthBar.style.width = health + '%';
  if (health <= 0) {
    endGame();
  }
}

// Finalizar o jogo
function endGame() {
  clearInterval(enemyCreationInterval);
  gameOverScreen.style.display = 'block';
}

// Resetar o jogo
function resetGame() {
  // Redefine variáveis
  score = 0;
  health = 100;
  scoreValue.textContent = score;
  healthBar.style.width = health + '%';
  
  // Limpa balas e inimigos
  bullets.forEach(bullet => bullet.remove());
  enemies.forEach(enemy => enemy.remove());
  bullets = [];
  enemies = [];
  
  // Oculta a tela de Game Over
  gameOverScreen.style.display = 'none';
  
  // Reinicia a criação de inimigos
  enemyCreationInterval = setInterval(createEnemy, 1000);
  
  // Reinicia o loop do jogo
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
function startGame() {
  enemyCreationInterval = setInterval(createEnemy, 1000);
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

// Loop do jogo usando requestAnimationFrame
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  movePlayer();
  moveBullets();
  moveEnemies();

  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
startGame();
