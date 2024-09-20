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

// Controle de som de fundo
let soundEnabled = true;

// Iniciar o som de fundo
backgroundSound.play();

// Função para alternar o som de fundo (ligar/desligar)
toggleSoundButton.addEventListener('click', () => {
  if (soundEnabled) {
    backgroundSound.pause();
    toggleSoundButton.src = 'img/off.png'; // Troca para o ícone de som desligado
  } else {
    backgroundSound.play();
    toggleSoundButton.src = 'img/on.png'; // Troca para o ícone de som ligado
  }
  soundEnabled = !soundEnabled;
});

// Detecta quando as teclas são pressionadas ou liberadas
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;

  if (e.key === ' ' && shootingInterval === null) {
    // Inicia o disparo contínuo ao pressionar a barra de espaço
    startShooting();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;

  if (e.key === ' ') {
    // Para o disparo contínuo quando a barra de espaço é solta
    stopShooting();
  }
});

// Controle por toque
game.addEventListener('touchstart', (e) => {
  const touchX = e.touches[0].clientX;
  keys[touchX < gameWidth / 2 ? 'ArrowLeft' : 'ArrowRight'] = true;

  if (shootingInterval === null) {
    startShooting(); // Inicia o disparo ao tocar
  }
});

game.addEventListener('touchend', () => {
  keys['ArrowLeft'] = false; // Para de mover para a esquerda
  keys['ArrowRight'] = false; // Para de mover para a direita
  stopShooting(); // Para o disparo ao soltar
});

// Nova função: Mover a nave conforme o dedo se move na tela
game.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const touchX = touch.clientX - game.getBoundingClientRect().left; // Coordenada X do toque relativo ao game

  // Centraliza o player onde o dedo está
  playerX = touchX - player.offsetWidth / 2;

  // Limita a nave para permanecer dentro da tela
  if (playerX < 0) playerX = 0;
  if (playerX > gameWidth - player.offsetWidth) playerX = gameWidth - player.offsetWidth;

  // Aplica a nova posição ao estilo da nave
  player.style.left = playerX + 'px';
});

// Função para mover o jogador suavemente com teclado
function movePlayer() {
  if (keys['ArrowLeft']) {
    playerSpeed = Math.max(playerSpeed - 0.5, -playerMaxSpeed); // Suaviza a aceleração para a esquerda
  } else if (keys['ArrowRight']) {
    playerSpeed = Math.min(playerSpeed + 0.5, playerMaxSpeed); // Suaviza a aceleração para a direita
  } else {
    // Reduz a velocidade gradualmente quando nenhuma tecla é pressionada
    if (playerSpeed > 0) playerSpeed -= 0.5;
    else if (playerSpeed < 0) playerSpeed += 0.5;
  }

  // Atualiza a posição do jogador
  playerX += playerSpeed;

  // Limita a nave para permanecer dentro da tela
  if (playerX < 0) playerX = 0;
  if (playerX > gameWidth - 40) playerX = gameWidth - 40;

  // Aplica a nova posição ao estilo da nave
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

  // Toca o som de tiro a cada disparo, criando uma nova instância do som
  if (soundEnabled) {
    const newShootSound = shootSound.cloneNode(); // Cria uma nova instância do som
    newShootSound.play();
  }
}

// Inicia o disparo contínuo
function startShooting() {
  shootBullet(); // Dispara um tiro imediatamente
  shootingInterval = setInterval(shootBullet, 150); // Dispara tiros a cada 150ms
}

// Para o disparo contínuo
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
  enemy.src = 'img/inimigo.png'; // Caminho para a imagem do inimigo
  enemy.alt = 'Inimigo';
  enemy.className = 'enemy';
  
  enemy.style.position = 'absolute';
  enemy.style.left = Math.random() * (gameWidth - 40) + 'px';
  enemy.style.top = '0px';
  enemy.style.width = '72px'; // Ajuste conforme necessário
  enemy.style.height = 'auto'; // Mantém a proporção da imagem
  enemy.style.transform = 'rotate(180deg)'; // Rotaciona a imagem 180 graus

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

        // Toca o som de colisão
        if (soundEnabled) {
          const newCollisionSound = collisionSound.cloneNode(); // Cria uma nova instância do som de colisão
          newCollisionSound.play();
        }
      }
    });
  });
}

// Função de colisão simples
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

// Loop do jogo
function gameLoop() {
  movePlayer();
  moveBullets();
  moveEnemies();
  requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
setInterval(createEnemy, 1000);
gameLoop();
