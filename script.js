// ===== ИГРОВЫЕ ПЕРЕМЕННЫЕ =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Состояния игры
let gameState = 'menu'; // menu, playing, paused, levelComplete, gameOver, gameComplete
let currentLevelIndex = 0;
let score = 0;
let gameTime = 0;
let levelStartTime = 0;

// Игровые объекты
let player = {};
let platforms = [];
let goal = {};
let enemies = [];
let weapon = {};
let gravityChanger = {};
let collectibles = [];
let particles = [];
let powerUps = [];
let checkpoints = [];
let obstacles = [];

// Управление
let keys = {
    left: false,
    right: false,
    up: false,
    space: false
};

// Физика
let gravity = 0.5;
const jumpStrength = 12;
const maxSpeed = 8;

// Новые механики
let doubleJumpAvailable = true;
let dashAvailable = true;
let dashCooldown = 0;
let wallJumpAvailable = false;
let wallSlideSpeed = 2;
let isWallSliding = false;
let wallJumpCooldown = 0;

// Система частиц
class Particle {
    constructor(x, y, vx, vy, color, life, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        this.size *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Система звуков (без внешних файлов)
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API не поддерживается');
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playJump() {
        this.playTone(400, 0.1, 'sine', 0.05);
        setTimeout(() => this.playTone(600, 0.1, 'sine', 0.05), 50);
    }

    playCollect() {
        this.playTone(800, 0.2, 'square', 0.1);
        setTimeout(() => this.playTone(1000, 0.2, 'square', 0.1), 100);
    }

    playDamage() {
        this.playTone(200, 0.3, 'sawtooth', 0.15);
    }

    playVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 0.3, 'sine', 0.1), index * 200);
        });
    }
}

const soundManager = new SoundManager();

// ===== УРОВНИ =====
const levels = [
    {
        name: "Пробуждение",
        playerStart: { x: 50, y: 500 },
        platforms: [
            { x: 0, y: 580, width: 800, height: 20, type: 'normal' },
            { x: 150, y: 450, width: 150, height: 20, type: 'normal' },
            { x: 400, y: 350, width: 150, height: 20, type: 'moving', moveY: 50, speed: 0.5 },
            { x: 600, y: 250, width: 100, height: 20, type: 'bouncy' }
        ],
        enemies: [
            { x: 400, y: 530, width: 50, height: 50, speed: 1, direction: 1, path: { start: 400, end: 510 }, type: 'patrol' },
            { x: 600, y: 150, width: 50, height: 50, speed: 2, direction: 1, path: { start: 100, end: 200 }, type: 'fly' }
        ],
        collectibles: [
            { x: 200, y: 400, width: 20, height: 20, type: 'coin', value: 100 },
            { x: 450, y: 300, width: 20, height: 20, type: 'coin', value: 100 }
        ],
        weapon: { x: 630, y: 200, width: 40, height: 40, isCollected: false },
        goal: { x: 700, y: 190, width: 40, height: 40 },
        background: 'gradient1',
        obstacles: [
            { x: 300, y: 550, width: 100, height: 30, type: 'spikes' }
        ]
    },
    {
        name: "Гравитационный сдвиг",
        playerStart: { x: 50, y: 500 },
        platforms: [
            { x: 0, y: 580, width: 200, height: 20, type: 'normal' },
            { x: 250, y: 480, width: 150, height: 20, type: 'invisible' },
            { x: 500, y: 400, width: 200, height: 20, type: 'normal' },
            { x: 300, y: 300, width: 100, height: 20, type: 'normal' },
            { x: 100, y: 200, width: 100, height: 20, type: 'normal' }
        ],
        gravityChanger: { x: 550, y: 350, width: 30, height: 30, isCollected: false },
        powerUps: [
            { x: 350, y: 250, width: 30, height: 30, type: 'doubleJump', isCollected: false },
            { x: 150, y: 150, width: 30, height: 30, type: 'dash', isCollected: false }
        ],
        goal: { x: 120, y: 140, width: 40, height: 40 },
        background: 'gradient2',
        obstacles: [
             { x: 400, y: 550, width: 200, height: 30, type: 'spikes' },
             { x: 250, y: 450, width: 150, height: 30, type: 'spikes' }
        ]
    },
    {
        name: "Лабиринт сознания",
        playerStart: { x: 50, y: 500 },
        platforms: [
            { x: 0, y: 580, width: 800, height: 20, type: 'normal' },
            { x: 100, y: 450, width: 100, height: 20, type: 'normal' },
            { x: 300, y: 400, width: 100, height: 20, type: 'normal' },
            { x: 500, y: 350, width: 100, height: 20, type: 'normal' },
            { x: 200, y: 300, width: 100, height: 20, type: 'normal' },
            { x: 400, y: 250, width: 100, height: 20, type: 'normal' },
            { x: 100, y: 200, width: 100, height: 20, type: 'normal' },
            { x: 600, y: 150, width: 100, height: 20, type: 'normal' }
        ],
        enemies: [
            { x: 350, y: 350, width: 40, height: 50, speed: 1.5, direction: 1, path: { start: 350, end: 450 }, type: 'patrol' },
            { x: 250, y: 250, width: 40, height: 50, speed: 1.5, direction: -1, path: { start: 200, end: 300 }, type: 'patrol' }
        ],
        collectibles: [
            { x: 350, y: 350, width: 20, height: 20, type: 'coin', value: 100 },
            { x: 250, y: 250, width: 20, height: 20, type: 'coin', value: 100 },
            { x: 650, y: 100, width: 20, height: 20, type: 'coin', value: 100 }
        ],
        goal: { x: 650, y: 100, width: 40, height: 40 },
        background: 'gradient3',
        obstacles: [
            { x: 100, y: 420, width: 100, height: 30, type: 'spikes' },
            { x: 300, y: 370, width: 100, height: 30, type: 'spikes' },
            { x: 500, y: 320, width: 100, height: 30, type: 'spikes' }
        ]
    }
];

// ===== ФУНКЦИИ ИГРЫ =====
function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    currentLevelIndex = levelIndex;
    levelStartTime = Date.now();
    
    // Инициализация игрока
    player = {
        x: level.playerStart.x,
        y: level.playerStart.y,
        width: 40,
        height: 60,
        speed: 5,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        health: 3,
        maxHealth: 3,
        hasWeapon: false,
        isAttacking: false,
        attackTimer: 0,
        isInvincible: false,
        invincibilityTimer: 0,
        isGravityReversed: false,
        gravityTimer: 0,
        canDoubleJump: false,
        canDash: false,
        dashCooldown: 0,
        isDashing: false,
        dashTimer: 0,
        wallJumpCooldown: 0,
        isWallSliding: false,
        onWall: false,
        facingDirection: 1 // 1 = right, -1 = left
    };
    
    platforms = level.platforms || [];
    enemies = level.enemies || [];
    weapon = level.weapon;
    gravityChanger = level.gravityChanger;
    collectibles = level.collectibles || [];
    powerUps = level.powerUps || [];
    checkpoints = level.checkpoints || [];
    obstacles = level.obstacles || [];
    
    // Сброс состояний
    if (weapon) weapon.isCollected = false;
    if (gravityChanger) gravityChanger.isCollected = false;
    collectibles.forEach(c => c.isCollected = false);
    powerUps.forEach(p => p.isCollected = false);
    
    goal = level.goal;
    gravity = 0.5;
    player.isGravityReversed = false;
    particles = [];
    
    updateUI();
}

function updateUI() {
    document.getElementById('levelNumber').textContent = `Уровень ${currentLevelIndex + 1}: ${levels[currentLevelIndex].name}`;
    document.getElementById('score').textContent = score;
    
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('healthFill').style.width = healthPercent + '%';
    
    const weaponStatus = document.getElementById('weaponStatus');
    weaponStatus.textContent = player.hasWeapon ? 'Есть' : 'Нет';
    weaponStatus.style.color = player.hasWeapon ? '#4ecdc4' : '#ff6b6b';
    
    const gravityBar = document.getElementById('gravityBar');
    if (player.isGravityReversed) {
        gravityBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
        gravityBar.style.width = (player.gravityTimer / 600 * 100) + '%';
    } else {
        gravityBar.style.background = 'linear-gradient(90deg, #4ecdc4, #45b7d1)';
        gravityBar.style.width = '100%';
    }
}

function createParticles(x, y, count, color, speed = 2) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const velocity = Math.random() * speed + 1;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * velocity,
            Math.sin(angle) * velocity,
            color,
            Math.random() * 30 + 20
        ));
    }
}

function updateParticles() {
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
}

function drawParticles() {
    particles.forEach(particle => particle.draw());
}

function drawPlayer() {
    if (player.x === undefined) return;
    ctx.save();
    
    // Эффект неуязвимости
    if (player.isInvincible) {
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
    }
    
    // Эффект рывка
    if (player.isDashing) {
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = '#4ecdc4';
        ctx.shadowBlur = 20;
    }
    
    // Рисуем игрока
    if (assetManager.images.player && assetManager.images.player.complete) {
        ctx.drawImage(assetManager.images.player, player.x, player.y, player.width, player.height);
    } else {
        const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
        gradient.addColorStop(0, '#4ecdc4');
        gradient.addColorStop(1, '#45b7d1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Глаза игрока
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 8, player.y + 10, 6, 6);
    ctx.fillRect(player.x + 26, player.y + 10, 6, 6);
    
    // Зрачки
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 10, player.y + 12, 2, 2);
    ctx.fillRect(player.x + 28, player.y + 12, 2, 2);
    
    // Анимация дыхания
    const breathScale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
    ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.fillRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
    
    ctx.restore();
}

function drawPlatforms() {
    const tileset = assetManager.images.tileset;
    const tileW = 32;
    const tileH = 32;

    platforms.forEach(platform => {
        ctx.save();

        // Использовать новый тайлсет для обычных платформ, если он загружен
        if (platform.type === 'normal' && tileset && tileset.complete) {
            const tileCount = Math.ceil(platform.width / tileW);
            
            for (let i = 0; i < tileCount; i++) {
                const x = platform.x + i * tileW;
                const w = Math.min(tileW, platform.width - i * tileW);
                
                let sx;
                if (tileCount === 1) {
                    // Для платформы из одного тайла используем средний
                    sx = tileW; 
                } else if (i === 0) {
                    // Первый тайл
                    sx = 0;
                } else if (i === tileCount - 1) {
                    // Последний тайл
                    sx = tileW * 2;
                } else {
                    // Средний тайл
                    sx = tileW;
                }
                
                ctx.drawImage(tileset, sx, 0, w, tileH, x, platform.y, w, platform.height);
            }
        } else {
            // Резервный метод отрисовки для других типов платформ или если ассет не загружен
            let style = '';
            switch (platform.type) {
                case 'normal':
                    const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                    gradient.addColorStop(0, '#96ceb4');
                    gradient.addColorStop(1, '#4ecdc4');
                    style = gradient;
                    break;
                case 'invisible':
                    style = player.isJumping ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
                    break;
                case 'moving':
                    const moveGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                    moveGradient.addColorStop(0, '#ff6b6b');
                    moveGradient.addColorStop(1, '#ff8e8e');
                    style = moveGradient;
                    break;
                case 'bouncy':
                    const bounceGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                    bounceGradient.addColorStop(0, '#ffd93d');
                    bounceGradient.addColorStop(1, '#ffed4e');
                    style = bounceGradient;
                    break;
            }
            if (style) {
                ctx.fillStyle = style;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        }
        ctx.restore();
    });
}

function drawObstacles() {
    if (!obstacles) return;
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'spikes') {
            if (assetManager.images.spikes && assetManager.images.spikes.complete) {
                ctx.drawImage(assetManager.images.spikes, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        }
    });
}

function drawCollectibles() {
    collectibles.forEach(collectible => {
        if (collectible.isCollected) return;
        
        ctx.save();
        
        // Анимация вращения
        const time = Date.now() * 0.005;
        const scale = 1 + Math.sin(time) * 0.1;
        
        ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2);
        ctx.scale(scale, scale);
        
        // Рисуем монету
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath();
        ctx.arc(0, 0, collectible.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffed4e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Блики
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-3, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (powerUp.isCollected) return;
        
        ctx.save();
        
        const time = Date.now() * 0.003;
        const pulse = 1 + Math.sin(time) * 0.2;
        
        ctx.translate(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
        ctx.scale(pulse, pulse);
        
        // Рисуем power-up
        if (powerUp.type === 'doubleJump') {
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(-powerUp.width/2, -powerUp.height/2, powerUp.width, powerUp.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('2X', 0, 4);
        } else if (powerUp.type === 'dash') {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(-powerUp.width/2, -powerUp.height/2, powerUp.width, powerUp.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', 0, 4);
        }
        
        ctx.restore();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        
        // Анимация врага
        const time = Date.now() * 0.005;
        const wobble = Math.sin(time) * 2;
        
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        ctx.rotate(wobble * 0.1);
        
        let img;
        if (enemy.type === 'patrol') {
            img = assetManager.images.enemy_patrol;
        } else if (enemy.type === 'fly') {
            img = assetManager.images.enemy_fly;
        }

        if (img && img.complete) {
            ctx.drawImage(img, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        } else {
            // Рисуем врага
            const gradient = ctx.createLinearGradient(-enemy.width / 2, -enemy.height / 2, enemy.width / 2, enemy.height / 2);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, '#ff8e8e');

            ctx.fillStyle = gradient;
            ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        }
        
        // Глаза врага
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-enemy.width/2 + 5, -enemy.height/2 + 5, 8, 8);
        ctx.fillRect(enemy.width/2 - 13, -enemy.height/2 + 5, 8, 8);
        
        // Зрачки
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-enemy.width/2 + 7, -enemy.height/2 + 7, 4, 4);
        ctx.fillRect(enemy.width/2 - 11, -enemy.height/2 + 7, 4, 4);
        
        ctx.restore();
    });
}

function drawGoal() {
    if (goal.x === undefined) return;
    ctx.save();
    
    const time = Date.now() * 0.005;
    const pulse = 1 + Math.sin(time) * 0.1;
    
    ctx.translate(goal.x + goal.width/2, goal.y + goal.height/2);
    ctx.scale(pulse, pulse);
    
    // Рисуем цель
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, goal.width/2);
    gradient.addColorStop(0, '#96ceb4');
    gradient.addColorStop(1, '#4ecdc4');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, goal.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Символ выхода
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('→', 0, 6);
    
    ctx.restore();
}

function drawBackground() {
    const level = levels[currentLevelIndex];
    const time = Date.now() * 0.0005;
    
    switch (level.background) {
        case 'gradient1':
            const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient1.addColorStop(0, '#000428');
            gradient1.addColorStop(1, '#004e92');
            ctx.fillStyle = gradient1;
            break;
            
        case 'gradient2':
            const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient2.addColorStop(0, '#1a1a2e');
            gradient2.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient2;
            break;
            
        case 'gradient3':
            const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient3.addColorStop(0, '#0c0c0c');
            gradient3.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = gradient3;
            break;
    }
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Добавляем звезды
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73) % canvas.height;
        const brightness = Math.sin(time + i) * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

function draw() {
    // Очистка canvas
    drawBackground();
    
    if (gameState === 'menu') {
        return; 
    }

    // Рисуем игровые объекты
    drawPlatforms();
    drawObstacles();
    drawCollectibles();
    drawPowerUps();
    drawEnemies();
    drawPlayer();
    drawGoal();
    drawParticles();
    
    // UI элементы
    drawGameUI();
    
    // Состояния игры
    drawGameStates();
}

function drawGameUI() {
    // Время уровня
    const levelTime = Math.floor((Date.now() - levelStartTime) / 1000);
    const minutes = Math.floor(levelTime / 60);
    const seconds = levelTime % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function drawGameStates() {
    if (gameState === 'levelComplete') {
        drawOverlay('rgba(0, 0, 0, 0.8)', 'Уровень пройден!', '#4ecdc4', 'Нажми Enter, чтобы продолжить');
    } else if (gameState === 'gameOver') {
        drawOverlay('rgba(0, 0, 0, 0.8)', 'ИГРА ОКОНЧЕНА', '#ff6b6b', 'Нажми Enter, чтобы начать заново');
    } else if (gameState === 'gameComplete') {
        drawOverlay('rgba(0, 0, 0, 0.8)', 'Ты проснулся...', '#96ceb4', 'Нажми Enter, чтобы сыграть снова');
    } else if (gameState === 'paused') {
        drawOverlay('rgba(0, 0, 0, 0.7)', 'Пауза', '#ffffff', 'Нажми P, чтобы продолжить');
    }
}

function drawOverlay(bgColor, title, titleColor, subtitle) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 40px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
}

function update() {
    if (gameState !== 'playing') return;
    
    updatePlayer();
    updateEnemies();
    updatePlatforms();
    updateParticles();
    updateCollisions();
    updateUI();
}

function updatePlayer() {
    // Таймеры
    if (player.isGravityReversed) {
        player.gravityTimer--;
        if (player.gravityTimer <= 0) {
            player.isGravityReversed = false;
            gravity = Math.abs(gravity);
        }
    }
    
    if (player.isInvincible) {
        player.invincibilityTimer--;
        if (player.invincibilityTimer <= 0) {
            player.isInvincible = false;
        }
    }
    
    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
    
    if (player.isDashing) {
        player.dashTimer--;
        if (player.dashTimer <= 0) {
            player.isDashing = false;
        }
    }
    
    if (player.dashCooldown > 0) {
        player.dashCooldown--;
    }
    
    if (player.wallJumpCooldown > 0) {
        player.wallJumpCooldown--;
    }
    
    // Движение
    if (!player.isDashing) {
        if (keys.left) {
            player.velocityX = Math.max(player.velocityX - 1, -maxSpeed);
            player.facingDirection = -1;
        } else if (keys.right) {
            player.velocityX = Math.min(player.velocityX + 1, maxSpeed);
            player.facingDirection = 1;
        } else {
            player.velocityX *= 0.8; // Трение
        }
    }
    
    // Прыжки
    if (keys.up && !player.isJumping && !player.isDashing) {
        player.velocityY = -jumpStrength * Math.sign(gravity);
        player.isJumping = true;
        doubleJumpAvailable = true;
        soundManager.playJump();
        createParticles(player.x + player.width/2, player.y + player.height, 8, '#4ecdc4');
    } else if (keys.up && doubleJumpAvailable && player.canDoubleJump && !player.isDashing) {
        player.velocityY = -jumpStrength * Math.sign(gravity);
        doubleJumpAvailable = false;
        soundManager.playJump();
        createParticles(player.x + player.width/2, player.y + player.height, 12, '#4ecdc4');
    }
    
    // Рывок
    if (keys.space && player.canDash && player.dashCooldown <= 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashTimer = 10;
        player.dashCooldown = 60;
        player.velocityX = player.facingDirection * 15;
        player.velocityY = 0;
        createParticles(player.x + player.width/2, player.y + player.height/2, 15, '#ff6b6b', 3);
    }
    
    // Применение гравитации
    if (!player.isDashing) {
        player.velocityY += gravity;
    }
    
    // Обновление позиции
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Проверка падения
    if (player.y > canvas.height || (gravity < 0 && player.y + player.height < 0)) {
        player.health--;
        if (player.health <= 0) {
            gameState = 'gameOver';
        } else {
            // Респаун
            const level = levels[currentLevelIndex];
            player.x = level.playerStart.x;
            player.y = level.playerStart.y;
            player.velocityY = 0;
            player.isInvincible = true;
            player.invincibilityTimer = 120;
            createParticles(player.x + player.width/2, player.y + player.height/2, 20, '#ff6b6b');
        }
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Движение врагов
        if (enemy.type === 'patrol') {
            enemy.x += enemy.speed * enemy.direction;
            if (enemy.x <= enemy.path.start || enemy.x + enemy.width >= enemy.path.end) {
                enemy.direction *= -1;
            }
        } else if (enemy.type === 'fly') {
            enemy.y += Math.sin(Date.now() * 0.002) * enemy.speed;
        }
        
        // Столкновение с игроком
        if (!player.isInvincible &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            if (player.isAttacking) {
                enemies.splice(index, 1);
                score += 200;
                createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 15, '#ff6b6b');
            } else {
                player.health--;
                player.isInvincible = true;
                player.invincibilityTimer = 120;
                soundManager.playDamage();
                createParticles(player.x + player.width/2, player.y + player.height/2, 10, '#ff6b6b');
                
                if (player.health <= 0) {
                    gameState = 'gameOver';
                }
            }
        }
    });
}

function updatePlatforms() {
    platforms.forEach(platform => {
        if (platform.type === 'moving') {
            platform.y += Math.sin(Date.now() * 0.001 * platform.speed) * platform.moveY;
        }
        
        // Коллизия с платформами
        const isFalling = player.velocityY > 0 && gravity > 0;
        const isRising = player.velocityY < 0 && gravity < 0;
        
        if ((isFalling || isRising) &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + Math.abs(player.velocityY)) {
            
            if (gravity > 0) {
                player.y = platform.y - player.height;
            } else {
                player.y = platform.y + platform.height;
            }
            
            player.velocityY = 0;
            player.isJumping = false;
            doubleJumpAvailable = true;
            
            // Эффект отскока
            if (platform.type === 'bouncy') {
                player.velocityY = -jumpStrength * 1.5 * Math.sign(gravity);
                createParticles(player.x + player.width/2, player.y + player.height, 8, '#ffd93d');
            }
        }
    });
}

function updateCollisions() {
    // Сбор монет
    collectibles.forEach((collectible, index) => {
        if (!collectible.isCollected &&
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y) {
            
            collectible.isCollected = true;
            score += collectible.value;
            soundManager.playCollect();
            createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 10, '#ffd93d');
        }
    });
    
    // Сбор power-ups
    powerUps.forEach((powerUp, index) => {
        if (!powerUp.isCollected &&
            player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y) {
            
            powerUp.isCollected = true;
            
            if (powerUp.type === 'doubleJump') {
                player.canDoubleJump = true;
            } else if (powerUp.type === 'dash') {
                player.canDash = true;
            }
            
            soundManager.playCollect();
            createParticles(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 15, '#4ecdc4');
        }
    });
    
    // Гравитационный сдвиг
    if (gravityChanger && !gravityChanger.isCollected &&
        player.x < gravityChanger.x + gravityChanger.width &&
        player.x + player.width > gravityChanger.x &&
        player.y < gravityChanger.y + gravityChanger.height &&
        player.y + player.height > gravityChanger.y) {
        
        gravityChanger.isCollected = true;
        if (!player.isGravityReversed) {
            gravity *= -1;
            player.isGravityReversed = true;
            player.gravityTimer = 600;
        }
        soundManager.playCollect();
        createParticles(gravityChanger.x + gravityChanger.width/2, gravityChanger.y + gravityChanger.height/2, 20, '#ff6b6b');
    }
    
    // Оружие
    if (weapon && !weapon.isCollected &&
        player.x < weapon.x + weapon.width &&
        player.x + player.width > weapon.x &&
        player.y < weapon.y + weapon.height &&
        player.y + player.height > weapon.y) {
        
        weapon.isCollected = true;
        player.hasWeapon = true;
        soundManager.playCollect();
        createParticles(weapon.x + weapon.width/2, weapon.y + weapon.height/2, 12, '#4ecdc4');
    }
    
    // Цель
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        
        gameState = 'levelComplete';
        soundManager.playVictory();
        createParticles(goal.x + goal.width/2, goal.y + goal.height/2, 30, '#96ceb4');
    }

    // Столкновение с препятствиями
    if(obstacles) {
        obstacles.forEach(obstacle => {
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y) {

                if (!player.isInvincible) {
                    player.health--;
                    player.isInvincible = true;
                    player.invincibilityTimer = 120;
                    soundManager.playDamage();
                    createParticles(player.x + player.width / 2, player.y + player.height / 2, 10, '#ff6b6b');
                    if (player.health <= 0) {
                        gameState = 'gameOver';
                    }
                }
            }
        });
    }
}

// ===== МЕНЮ И УПРАВЛЕНИЕ =====
function showMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
    gameState = 'menu';
}

function hideMenu() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    gameState = 'playing';
}

function startGame() {
    hideMenu();
    currentLevelIndex = 0;
    score = 0;
    gameTime = 0;
    loadLevel(currentLevelIndex);
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pauseMenu').classList.remove('hidden');
    }
}

function resumeGame() {
    gameState = 'playing';
    document.getElementById('pauseMenu').classList.add('hidden');
}

function restartLevel() {
    gameState = 'playing';
    document.getElementById('pauseMenu').classList.add('hidden');
    loadLevel(currentLevelIndex);
}

// ===== ИГРОВОЙ ЦИКЛ =====
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
window.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
        if (e.key === 'ArrowUp') keys.up = true;
        if (e.code === 'Space' && player.hasWeapon && !player.isAttacking) {
            player.isAttacking = true;
            player.attackTimer = 30;
        }
    }
    
    if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
    
    if (e.key === 'Enter') {
        if (gameState === 'levelComplete') {
            currentLevelIndex++;
            if (currentLevelIndex < levels.length) {
                loadLevel(currentLevelIndex);
                gameState = 'playing';
            } else {
                gameState = 'gameComplete';
            }
        } else if (gameState === 'gameOver' || gameState === 'gameComplete') {
            currentLevelIndex = 0;
            score = 0;
            loadLevel(currentLevelIndex);
            gameState = 'playing';
        }
    }
    
    if (e.key === 'Escape') {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

// Обработчики кнопок меню
document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('resumeGame').addEventListener('click', resumeGame);
document.getElementById('restartLevel').addEventListener('click', restartLevel);
document.getElementById('mainMenuBtn').addEventListener('click', () => {
    document.getElementById('pauseMenu').classList.add('hidden');
    showMenu();
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    assetManager.loadAssets(() => {
        // Запускаем игровой цикл после загрузки всех ассетов
        gameLoop();
    });
}

// Запускаем игру
init(); 