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

    // Controle de som de fundo
    let soundEnabled = true;

    // Iniciar o som de fundo
    backgroundSound.volume = 1;
    backgroundSound.play();

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
      bullets.forEach((bullet, bulletIndex) => {
        bullet.style.top = (parseInt(bullet.style.top) - 5) + 'px';

        if (parseInt(bullet.style.top) < 0) {
          bullet.remove();
          bullets.splice(bulletIndex, 1);
        } else {
          // Verificar colisão da bala com os inimigos
          enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
              // Se houver colisão, remover bala e inimigo
              bullet.remove();
              enemy.remove();
              bullets.splice(bulletIndex, 1);
              enemies.splice(enemyIndex, 1);

              // Tocar som de colisão
              colisaoSound.currentTime = 0; // Reiniciar o som
              colisaoSound.play();

              // Atualizar a pontuação
              updateScore();
            }
          });
        }
      });
    }

    // Criar inimigos
    function createEnemy() {
      const enemy = document.createElement('div');
      enemy.classList.add('enemy');
      enemy.style.left = Math.random() * (gameWidth - 40) + 'px';
      enemy.style.top = '0px';
      game.appendChild(enemy);
      enemies.push(enemy);
    }

    // Mover inimigos
    function moveEnemies() {
      enemies.forEach((enemy, index) => {
        enemy.style.top = (parseInt(enemy.style.top) + 2) + 'px';

        // Verificar colisão com o jogador
        if (checkCollision(enemy, player)) {
          health -= 10;
          healthBar.style.width = health + '%';
          enemy.remove();
          enemies.splice(index, 1);
          if (health <= 0) {
            endGame();
          }
        }

        // Verificar se o inimigo saiu da tela
        if (parseInt(enemy.style.top) > gameHeight) {
          enemy.remove();
          enemies.splice(index, 1);
        }
      });
    }

    // Verificar colisão entre dois elementos
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

    // Atualizar a pontuação
    function updateScore() {
      score += 1;
      scoreValue.textContent = score;
    }

    // Encerrar o jogo
    function endGame() {
      clearInterval(enemyCreationInterval);
      clearInterval(shootingInterval);
      gameOverScreen.style.display = 'block';
    }

    // Reiniciar o jogo
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

    // Iniciar o jogo
    function startGame() {
      startScreen.style.display = 'none';
      gameOverScreen.style.display = 'none'; // Esconder a tela de game over se estiver visível
      health = 100; // Resetar a saúde
      score = 0; // Resetar a pontuação
      bullets = []; // Limpar balas
      enemies = []; // Limpar inimigos
      scoreValue.textContent = score; // Atualizar pontuação no display
      healthBar.style.width = health + '%'; // Resetar barra de saúde

      // Recriar a nave na posição inicial
      playerX = gameWidth / 2 - 20; // Posição inicial da nave
      player.style.left = playerX + 'px'; // Definir a posição da nave

      // Iniciar o movimento da nave e a criação de inimigos
      enemyCreationInterval = setInterval(() => {
        createEnemy();
        updateScore();
      }, 2000);

      // Iniciar o loop de animação
      requestAnimationFrame(gameLoop);
    }

    // Loop principal do jogo
    function gameLoop() {
      movePlayer();
      moveBullets();
      moveEnemies();
      
      // Continuar o loop
      requestAnimationFrame(gameLoop);
    }

    // Iniciar ao clicar no botão de iniciar
    startButton.addEventListener('click', startGame);

    // Tela de Seleção de Tema
    themeButton.addEventListener('click', () => {
      startScreen.style.display = 'none';
      themeScreen.style.display = 'flex';
    });

    // Selecionar tema e voltar para a tela inicial
    selectThemeButton.addEventListener('click', () => {
      const selectedTheme = document.querySelector('.theme-card.selected');
      if (selectedTheme) {
        const videoSrc = selectedTheme.getAttribute('data-video');
        const backgroundVideo = document.getElementById('background-video');
        backgroundVideo.src = videoSrc; // Atualiza o vídeo de fundo
        backgroundVideo.load(); // Carrega o novo vídeo
      }
      
      themeScreen.style.display = 'none'; // Oculta a tela de temas
      startScreen.style.display = 'flex'; // Exibe a tela inicial
    });

    // Adiciona evento de clique para selecionar o tema
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });// Espera que o DOM esteja totalmente carregado
    document.addEventListener('DOMContentLoaded', () => {
        const aboutButton = document.getElementById('about-button'); // Botão "Sobre"
        const aboutScreen = document.getElementById('about-screen'); // Tela "Sobre"

        // Ao clicar no botão "Sobre"
        aboutButton.addEventListener('click', () => {
            aboutScreen.style.display = 'flex'; // Mostrar a tela "Sobre"
        });

        // Fechar a tela "Sobre" ao clicar em qualquer lugar nela
        aboutScreen.addEventListener('click', (event) => {
            if (event.target === aboutScreen) {
                aboutScreen.style.display = 'none'; // Esconder a tela "Sobre"
            }
        });
    });
    document.addEventListener('DOMContentLoaded', () => {
      // Referências aos elementos do jogo
      const game = document.getElementById('game');
      const player = document.getElementById('player');
      const gameWidth = game.offsetWidth;
  
      let isTouching = false;
      let initialTouchX = 0;
      let playerInitialX = 0;
  
      // Função para iniciar disparo contínuo
      function startTouchShooting() {
          if (shootingInterval === null) {
              startShooting(); // Função que já dispara continuamente a cada 150ms
          }
      }
  
      // Função para parar o disparo contínuo
      function stopTouchShooting() {
          stopShooting(); // Função que para o disparo contínuo
      }
  
      // Detectar início do toque
      game.addEventListener('touchstart', (event) => {
          const touch = event.touches[0];
          initialTouchX = touch.clientX;
          playerInitialX = playerX; // Posição inicial do jogador no momento do toque
          isTouching = true;
  
          // Iniciar disparo quando o toque começar
          startTouchShooting();
      });
  
      // Detectar movimento do toque
      game.addEventListener('touchmove', (event) => {
          if (isTouching) {
              const touch = event.touches[0];
              const touchX = touch.clientX;
              const deltaX = touchX - initialTouchX; // Diferença entre o ponto inicial do toque e o ponto atual
              playerX = playerInitialX + deltaX; // Atualizar a posição do jogador com base no arrasto
              playerX = Math.min(Math.max(playerX, 0), gameWidth - 40); // Limitar a posição dentro dos limites do jogo
              player.style.left = playerX + 'px'; // Atualizar a posição da nave na tela
          }
      });
  
      // Detectar fim do toque
      game.addEventListener('touchend', () => {
          isTouching = false;
          // Parar disparo quando o toque terminar
          stopTouchShooting();
      });
  
      // Detectar fim do toque caso saia da tela
      game.addEventListener('touchcancel', () => {
          isTouching = false;
          // Parar disparo quando o toque for cancelado
          stopTouchShooting();
      });
  
      // Restante do código do jogo (como movimento do jogador, criação de inimigos, etc.)
  });
  
