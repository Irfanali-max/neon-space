const canvas = document.getElementById("gameCanvas"); const ctx = canvas.getContext("2d");
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight - 35; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

let totalCoins = parseInt(localStorage.getItem("totalCoins")) || 0;
let unlockedItems = JSON.parse(localStorage.getItem("unlockedItems")) || ["default", "w_basic", "bg_stars"];
if (!unlockedItems.includes("bg_stars")) unlockedItems.push("bg_stars");
let equippedRobot = localStorage.getItem("equippedRobot") || "default";
let equippedWeapon = localStorage.getItem("equippedWeapon") || "w_basic";
let equippedBg = localStorage.getItem("equippedBg") || "bg_stars";

function saveGameData() {
    localStorage.setItem("totalCoins", totalCoins); localStorage.setItem("unlockedItems", JSON.stringify(unlockedItems));
    localStorage.setItem("equippedRobot", equippedRobot); localStorage.setItem("equippedWeapon", equippedWeapon); 
    localStorage.setItem("equippedBg", equippedBg); updateMenuUI();
}

function updateMenuUI() {
    document.getElementById("menu-total-coins").innerText = totalCoins; document.getElementById("shop-total-coins").innerText = totalCoins;
    const items = ['default', 'ninja', 'gold', 'diamond', 'shadow', 'w_basic', 'w_double', 'w_laser', 'w_spread', 'w_death', 'bg_stars', 'bg_jupiter', 'bg_moon', 'bg_sun', 'bg_earth'];
    items.forEach(item => {
        let btnId = item.startsWith('w_') ? (item === 'w_basic' ? 'btn-equip-w_basic' : 'btn-buy-' + item) : 
                   (item.startsWith('bg_') ? (item === 'bg_stars' ? 'btn-equip-bg_stars' : 'btn-buy-' + item) : 
                   (item === 'default' ? 'btn-equip-default' : 'btn-buy-' + item));
        
        let btn = document.getElementById(btnId); let priceText = document.getElementById('price-' + item);
        if (btn) {
            if (unlockedItems.includes(item)) {
                let isEquipped = (item.startsWith('w_') && equippedWeapon === item) || 
                                 (item.startsWith('bg_') && equippedBg === item) || 
                                 (!item.startsWith('w_') && !item.startsWith('bg_') && equippedRobot === item);
                if (isEquipped) { btn.className = 'btn-selected'; btn.innerText = 'Equipped'; btn.onclick = null; } 
                else { btn.className = 'btn-select'; btn.innerText = 'Equip'; 
                       btn.onclick = () => equipItem(item.startsWith('w_') ? 'weapon' : (item.startsWith('bg_') ? 'bg' : 'robot'), item); }
                if(priceText) priceText.innerText = "Owned";
            }
        }
    });
}

function openShop() { document.querySelectorAll('.screen-overlay').forEach(el => el.style.display = 'none'); updateMenuUI(); document.getElementById("shop-screen").style.display = "block"; }
function closeShop() { document.querySelectorAll('.screen-overlay').forEach(el => el.style.display = 'none'); document.getElementById("main-menu").style.display = "block"; }

function buyItem(type, itemName, price) { 
    if (totalCoins >= price) { 
        totalCoins -= price; unlockedItems.push(itemName); 
        if(type === 'robot') equippedRobot = itemName; 
        else if(type === 'weapon') equippedWeapon = itemName; 
        else if(type === 'bg') equippedBg = itemName;
        saveGameData(); playSound('coin'); alert("Congratulations! Item Unlocked."); 
    } else { alert("Not enough coins! Play more or watch ads to earn."); } 
}

function equipItem(type, itemName) { 
    if(type === 'robot') equippedRobot = itemName; 
    else if(type === 'weapon') equippedWeapon = itemName; 
    else if(type === 'bg') equippedBg = itemName;
    saveGameData(); playSound('ding'); 
}

updateMenuUI();

let audioCtx;
function initAudio() { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } if (audioCtx.state === 'suspended') { audioCtx.resume(); } }
function playSound(type) {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    let now = audioCtx.currentTime;
    
    if (type === 'laser') { osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'coin') { osc.type = 'sine'; osc.frequency.setValueAtTime(1000, now); osc.frequency.setValueAtTime(1500, now + 0.05); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'boom') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(20, now + 0.2); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); } 
    else if (type === 'rockBreak') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.15); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15); } 
    else if (type === 'ding') { osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); } 
    else if (type === 'warning') { osc.type = 'square'; osc.frequency.setValueAtTime(400, now); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.15); osc.start(now); osc.stop(now + 0.15); }
}
let currentStage = 1; let score = 0; let matchCoins = 0; let lives = 3; let timeLeft = 60; let targetScore = 1000;
let isGameOver = false; let isStageClear = false; let animationId; let gameTime = 0;
let obstacles = []; let powerUps = []; let coins = []; let timeCapsules = []; let bullets = []; let particles = []; let floatingTexts = []; let starsLayers = [[], [], []]; 
let isShielded = false; let shieldTimeLeft = 0; let shieldInterval; let shakeTime = 0;

const player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 60, targetX: canvas.width / 2 - 25, speed: 0.2, animFrame: 0, recoilY: 0, invincible: 0 };

class Particle {
    constructor(x, y, color) { this.x = x; this.y = y; this.color = color; this.size = Math.random() * 4 + 1; this.speedX = (Math.random() - 0.5) * 6; this.speedY = (Math.random() - 0.5) * 6; this.life = 1.0; }
    update() { this.x += this.speedX; this.y += this.speedY; this.life -= 0.04; this.size *= 0.95; }
    draw() { ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0; }
}
class FloatingText {
    constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; this.life = 1.0; this.speedY = -2; }
    update() { this.y += this.speedY; this.life -= 0.02; }
    draw() { ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.font = "bold 20px Arial"; ctx.fillText(this.text, this.x, this.y); ctx.globalAlpha = 1.0; }
}
function createExplosion(x, y, color, amount) { for(let i=0; i<amount; i++) particles.push(new Particle(x, y, color)); }
function createSmoke(x, y, color, speedUp) { let p = new Particle(x, y, color); p.speedY = -Math.random() * speedUp - 1; p.speedX = (Math.random() - 0.5) * 2; p.size = Math.random() * 6 + 3; p.life = 0.8; particles.push(p); }

function initParallaxStars() { starsLayers = [[], [], []]; for(let i=0; i<3; i++) { for(let j=0; j<40; j++) starsLayers[i].push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: (i+1)*0.8, speed: (i+1)*0.5}); } }

function drawPlayer(x, y, frame) {
    ctx.save(); ctx.translate(x + player.width / 2, y + player.height / 2 + player.recoilY);
    
    if (isShielded) { ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.fillStyle = shieldTimeLeft <= 3 ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 210, 255, 0.3)'; ctx.fill(); ctx.strokeStyle = shieldTimeLeft <= 3 ? '#ff4444' : '#00d2ff'; ctx.lineWidth = 2; ctx.stroke(); }
    
    if (player.invincible > 0) {
        let bColor = 'rgba(255, 255, 255, 0.4)'; let sColor = '#ffffff';
        if (equippedRobot === 'ninja') { bColor = 'rgba(255, 50, 50, 0.4)'; sColor = '#ff3333'; }
        else if (equippedRobot === 'gold') { bColor = 'rgba(255, 215, 0, 0.4)'; sColor = '#ffd700'; }
        else if (equippedRobot === 'diamond') { bColor = 'rgba(0, 255, 255, 0.4)'; sColor = '#00ffff'; }
        else if (equippedRobot === 'shadow') { bColor = 'rgba(142, 68, 173, 0.4)'; sColor = '#8e44ad'; }
        
        if (player.invincible > 60 || Math.floor(player.invincible / 10) % 2 === 0) {
            ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fillStyle = bColor; ctx.fill(); ctx.strokeStyle = sColor; ctx.lineWidth = 3; ctx.stroke();
        }
    }

    if (!isGameOver && !isStageClear) { const flameY = 25 + Math.sin(frame * 0.5) * 6; ctx.beginPath(); ctx.moveTo(-10, 25); ctx.lineTo(0, flameY + 15); ctx.lineTo(10, 25); ctx.fillStyle = "#ffcc00"; ctx.fill(); ctx.beginPath(); ctx.moveTo(-15, 25); ctx.lineTo(0, flameY + 25); ctx.lineTo(15, 25); ctx.fillStyle = "#ff6600"; ctx.fill(); }
    
    let bodyColor = "#e0e0e0"; let legColor = "#c0c0c0"; let glassColor = "#333";
    if (equippedRobot === 'ninja') { bodyColor = "#800000"; legColor = "#500000"; glassColor = "#ffeb3b"; } 
    else if (equippedRobot === 'gold') { bodyColor = "#ffd700"; legColor = "#daa520"; glassColor = "#000"; }
    else if (equippedRobot === 'diamond') { bodyColor = "#00ffff"; legColor = "#00cccc"; glassColor = "#ffffff"; } 
    else if (equippedRobot === 'shadow') { bodyColor = "#2c3e50"; legColor = "#1a252f"; glassColor = "#8e44ad"; }

    ctx.fillStyle = bodyColor; ctx.fillRect(-20, -15, 40, 30); ctx.beginPath(); ctx.arc(0, -20, 15, 0, Math.PI * 2); 
    ctx.fillStyle = (equippedRobot==='ninja' || equippedRobot==='shadow') ? "#000" : "#fff"; ctx.fill(); 
    ctx.fillStyle = glassColor; ctx.fillRect(-10, -25, 20, 10); 
    
    if(equippedRobot === 'shadow') { ctx.fillStyle = "#ff0000"; ctx.beginPath(); ctx.arc(-4, -20, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(4, -20, 2, 0, Math.PI*2); ctx.fill(); }
    
    ctx.fillStyle = legColor; ctx.fillRect(-15, 15, 10, 10); ctx.fillRect(5, 15, 10, 10); ctx.fillRect(-25, -10, 8, 20); ctx.fillRect(17, -10, 8, 20); ctx.restore();
}

function drawAsteroid(obs) { ctx.save(); ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2); ctx.rotate(obs.angle); ctx.beginPath(); ctx.moveTo(obs.points[0].x, obs.points[0].y); for (let i = 1; i < obs.points.length; i++) ctx.lineTo(obs.points[i].x, obs.points[i].y); ctx.closePath(); ctx.fillStyle = currentStage % 2 === 0 ? "#4a4a4a" : "#554433"; ctx.fill(); ctx.strokeStyle = "#111"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
function drawCoin(c) { ctx.save(); ctx.translate(c.x + c.width/2, c.y + c.height/2); ctx.rotate(gameTime * 0.05); ctx.beginPath(); ctx.arc(0, 0, c.width/2, 0, Math.PI * 2); ctx.fillStyle = "#ffcc00"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "#daa520"; ctx.beginPath(); ctx.arc(0, 0, c.width/3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
function drawPowerUp(pu) { ctx.save(); ctx.translate(pu.x + pu.width/2, pu.y + pu.height/2); ctx.scale(1 + Math.sin(gameTime * 0.1) * 0.1, 1 + Math.sin(gameTime * 0.1) * 0.1); ctx.beginPath(); ctx.arc(0, 0, pu.width/2, 0, Math.PI * 2); ctx.fillStyle = "#00d2ff"; ctx.shadowBlur = 15; ctx.shadowColor = "#00d2ff"; ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif"; ctx.fillText("S", -7, 7); ctx.restore(); }
function drawTimeCapsule(tc) { ctx.save(); ctx.translate(tc.x + tc.width/2, tc.y + tc.height/2); ctx.beginPath(); ctx.arc(0, 0, tc.width/2, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#ff0044"; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#ff0044"; ctx.font = "bold 16px Arial"; ctx.fillText("⏱️", -8, 6); ctx.restore(); }
function drawBullet(b) { ctx.fillStyle = b.color; ctx.shadowBlur = 10; ctx.shadowColor = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); ctx.shadowBlur = 0; }

function drawCosmicBackground() {
    ctx.fillStyle = "white"; 
    for(let i=0; i<3; i++) {
        starsLayers[i].forEach(star => { ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI*2); ctx.fill(); star.y += star.speed + (currentStage * 0.1); if(star.y > canvas.height) star.y = 0; });
    }

    ctx.save();
    ctx.translate(canvas.width * 0.8, canvas.height * 0.2); 
    
    if (equippedBg === 'bg_stars') {
    } else if (equippedBg === 'bg_jupiter') {
        let grad = ctx.createLinearGradient(-100, 0, 100, 0); grad.addColorStop(0, "#cc9966"); grad.addColorStop(0.3, "#eeecc5"); grad.addColorStop(0.6, "#cc9966"); grad.addColorStop(1, "#996633");
        ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-90, -30); ctx.lineTo(90, -30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-98, 10); ctx.lineTo(98, 10); ctx.stroke();
    } else if (equippedBg === 'bg_moon') {
        ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.fillStyle = "#b0b0b0"; ctx.fill();
        ctx.fillStyle = "#808080"; 
        ctx.beginPath(); ctx.arc(-30, -30, 15, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(20, 20, 20, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(10, -40, 10, 0, Math.PI * 2); ctx.fill();
    } else if (equippedBg === 'bg_sun') {
        ctx.shadowBlur = 50; ctx.shadowColor = "#ffcc00";
        let grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 120); grad.addColorStop(0, "#fff"); grad.addColorStop(0.5, "#ffcc00"); grad.addColorStop(1, "#ff6600");
        ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill(); ctx.shadowBlur = 0;
    } else if (equippedBg === 'bg_earth') {
        ctx.beginPath(); ctx.arc(0, 0, 110, 0, Math.PI * 2); ctx.fillStyle = "#1e3fdb"; ctx.fill(); 
        ctx.fillStyle = "#2ecc71"; 
        ctx.beginPath(); ctx.moveTo(-50, -80); ctx.bezierCurveTo(-20,-100, 50,-50, 80,-80); ctx.bezierCurveTo(100,-50, 50,0, 20,-20); ctx.bezierCurveTo(-20,0, -80,-50, -50,-80); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-30, 20); ctx.bezierCurveTo(0,10, 50,50, 20,80); ctx.bezierCurveTo(0,100, -50,60, -30,20); ctx.fill();
    }
    ctx.restore();
}
canvas.addEventListener("touchmove", function(e) { if (isGameOver || isStageClear) return; e.preventDefault(); player.targetX = e.touches[0].clientX - (player.width / 2); }, { passive: false });
function returnToMenu() { document.querySelectorAll('.screen-overlay').forEach(el => el.style.display = 'none'); document.getElementById("game-container").style.display = "none"; updateMenuUI(); document.getElementById("main-menu").style.display = "block"; }
function initGame(stage) { initAudio(); playSound('ding'); currentStage = stage; score = 0; matchCoins = 0; lives = 3; startStageLevel(); }
function startNextStage() { playSound('ding'); currentStage++; lives = 3; startStageLevel(); }
function retryStage() { playSound('ding'); score = (currentStage - 1) * 1000; matchCoins = 0; lives = 3; startStageLevel(); }

function startStageLevel() {
    document.querySelectorAll('.screen-overlay').forEach(el => el.style.display = 'none'); document.getElementById("game-container").style.display = "block";
    timeLeft = 60; targetScore = Math.floor(score) + 1000; isGameOver = false; isStageClear = false; gameTime = 0; shakeTime = 0;
    obstacles = []; powerUps = []; coins = []; timeCapsules = []; bullets = []; particles = []; floatingTexts = [];
    player.x = canvas.width / 2 - 25; player.targetX = player.x; player.recoilY = 0; player.invincible = 0; isShielded = false; clearInterval(shieldInterval); document.getElementById("shield-timer").style.display = "none";
    initParallaxStars(); updateHUD(); if (animationId) cancelAnimationFrame(animationId); updateGame();
}

function updateHUD() { document.getElementById("stage-board").innerText = "Stage: " + currentStage; document.getElementById("time-board").innerText = "⏳ " + timeLeft + "s"; document.getElementById("score-board").innerText = "Score: " + Math.floor(score) + " / " + targetScore; let heartStr = ""; for(let i=0; i<lives; i++) heartStr += "❤️"; document.getElementById("lives-board").innerText = heartStr; }
function activateShield() { playSound('ding'); isShielded = true; shieldTimeLeft = 10; let shieldEl = document.getElementById("shield-timer"); shieldEl.style.display = "block"; shieldEl.style.color = "#00d2ff"; shieldEl.innerText = "Shield: 10s"; clearInterval(shieldInterval); shieldInterval = setInterval(() => { shieldTimeLeft--; if(shieldTimeLeft <= 0) { isShielded = false; clearInterval(shieldInterval); shieldEl.style.display = "none"; } else { if(shieldTimeLeft <= 3) { playSound('warning'); shieldEl.style.color = "#ff4444"; shieldEl.innerText = "⚠️ " + shieldTimeLeft + "s"; } else { shieldEl.innerText = "Shield: " + shieldTimeLeft + "s"; } } }, 1000); }
function createObstacle() { let maxSize = Math.min(150, 30 + Math.random() * 40 + (currentStage * 15)); const size = maxSize; const pts = []; const num = 8 + Math.floor(Math.random() * 5); for(let i=0; i<num; i++) pts.push({ x: Math.cos((i/num)*Math.PI*2)*size/2*(0.8+Math.random()*0.4), y: Math.sin((i/num)*Math.PI*2)*size/2*(0.8+Math.random()*0.4) }); let speedLimit = 2 + (currentStage * 1.5) + Math.random() * 3; obstacles.push({ x: Math.random()*(canvas.width-size), y: -size, width: size, height: size, speed: speedLimit, speedX: 0, angle: 0, rotateSpeed: (Math.random()-0.5)*0.1, points: pts }); }

function splitAsteroid(obs) {
    if (obs.width < 50) return; 
    let numPieces = 2 + Math.floor(Math.random() * 2); let newSize = obs.width / 1.8; 
    for(let i=0; i<numPieces; i++) {
        const pts = []; const num = 6 + Math.floor(Math.random() * 4);
        for(let p=0; p<num; p++) pts.push({ x: Math.cos((p/num)*Math.PI*2)*newSize/2*(0.8+Math.random()*0.4), y: Math.sin((p/num)*Math.PI*2)*newSize/2*(0.8+Math.random()*0.4) });
        obstacles.push({ x: obs.x + Math.random() * 10, y: obs.y, width: newSize, height: newSize, speed: obs.speed * (0.8 + Math.random() * 0.4), speedX: (Math.random() - 0.5) * 8, angle: Math.random() * Math.PI, rotateSpeed: (Math.random()-0.5)*0.3, points: pts });
    }
}

function createCoin() { coins.push({ x: Math.random()*(canvas.width-25), y: -25, width: 25, height: 25, speed: 4 + (currentStage*0.5) }); }
function createPowerUp() { powerUps.push({ x: Math.random()*(canvas.width-30), y: -30, width: 30, height: 30, speed: 3 + (currentStage*0.3) }); }
function createTimeCapsule() { timeCapsules.push({ x: Math.random()*(canvas.width-35), y: -35, width: 35, height: 35, speed: 4 + (currentStage*0.4) }); }

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) { 
        let obs = obstacles[i]; 
        if (player.x < obs.x + obs.width*0.8 && player.x + player.width > obs.x + obs.width*0.2 && player.y < obs.y + obs.height*0.8 && player.y + player.height > obs.y + obs.height*0.2) { 
            if (isShielded || player.invincible > 0) {
                score += 10; updateHUD(); playSound('rockBreak'); createExplosion(obs.x + obs.width/2, obs.y + obs.height/2, "#665544", 10); floatingTexts.push(new FloatingText(obs.x, obs.y, "SMASH!", "#fff")); splitAsteroid(obs); obstacles.splice(i, 1); i--;
            } else { 
                lives--; updateHUD(); playSound('boom'); createExplosion(obs.x + obs.width/2, obs.y + obs.height/2, "#ff4444", 25); shakeTime = 15; player.recoilY = 40; 
                player.invincible = 180; 
                obstacles.splice(i, 1); i--; if (lives <= 0) gameOverSequence("Destroyed!"); 
            } 
        } 
    }
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        for (let j = 0; j < obstacles.length; j++) {
            let obs = obstacles[j];
            if (b.x < obs.x + obs.width && b.x + b.width > obs.x && b.y < obs.y + obs.height && b.y + b.height > obs.y) {
                score += 10; updateHUD(); playSound('rockBreak'); createExplosion(obs.x + obs.width/2, obs.y + obs.height/2, "#665544", 10); floatingTexts.push(new FloatingText(obs.x, obs.y, "+10", "#fff")); splitAsteroid(obs); obstacles.splice(j, 1); 
                if(equippedWeapon !== 'w_laser' && equippedWeapon !== 'w_death') { bullets.splice(i, 1); i--; break; } 
            }
        }
    }
    for (let i = 0; i < coins.length; i++) { let c = coins[i]; if (player.x < c.x + c.width && player.x + player.width > c.x && player.y < c.y + c.height && player.y + player.height > c.y) { playSound('coin'); score += 20; matchCoins += 2; updateHUD(); floatingTexts.push(new FloatingText(c.x, c.y, "+20", "#ffcc00")); coins.splice(i, 1); i--; } }
    for (let i = 0; i < powerUps.length; i++) { let pu = powerUps[i]; if (player.x < pu.x + pu.width && player.x + player.width > pu.x && player.y < pu.y + pu.height && player.y + player.height > pu.y) { activateShield(); score += 20; updateHUD(); floatingTexts.push(new FloatingText(pu.x, pu.y, "SHIELD 10s", "#00d2ff")); powerUps.splice(i, 1); i--; } }
    for (let i = 0; i < timeCapsules.length; i++) { let tc = timeCapsules[i]; if (player.x < tc.x + tc.width && player.x + player.width > tc.x && player.y < tc.y + tc.height && player.y + player.height > tc.y) { playSound('ding'); timeLeft += 30; score += 20; updateHUD(); floatingTexts.push(new FloatingText(tc.x, tc.y, "+30 Sec!", "#fff")); timeCapsules.splice(i, 1); i--; } }
}

function saveMatchCoins() { totalCoins = parseInt(totalCoins) + parseInt(matchCoins); saveGameData(); }

function gameOverSequence(reason) {
    isGameOver = true; saveMatchCoins(); clearInterval(shieldInterval); document.getElementById("shield-timer").style.display = "none"; document.getElementById("game-container").style.display = "none";
    let adScreen = document.getElementById("interstitial-ad"); let adTimerText = document.getElementById("ad-timer"); adScreen.style.display = "flex"; let adTime = 3;
    let adInterval = setInterval(() => { adTime--; adTimerText.innerText = "Ad closing in " + adTime + "..."; if(adTime <= 0) { clearInterval(adInterval); adScreen.style.display = "none"; document.getElementById("fail-title").innerText = reason === "Time Out!" ? "Time's Up!" : "Mission Failed"; document.getElementById("fail-reason").innerText = reason === "Time Out!" ? "آپ وقت پر ٹارگٹ پورا نہیں کر سکے!" : "روبوٹ پتھروں سے ٹکرا کر تباہ ہو گیا!"; document.getElementById("fail-coins-earned").innerText = matchCoins; document.getElementById("game-over-screen").style.display = "block"; } }, 1000);
}

function stageClear() { isStageClear = true; playSound('ding'); saveMatchCoins(); document.getElementById("clear-coins-earned").innerText = matchCoins; document.getElementById("game-container").style.display = "none"; document.getElementById("stage-clear-screen").style.display = "block"; clearInterval(shieldInterval); document.getElementById("shield-timer").style.display = "none"; }

function updateGame() {
    if (isGameOver || isStageClear) return;
    ctx.save(); if(shakeTime > 0) { const dx = (Math.random()-0.5) * 10; const dy = (Math.random()-0.5) * 10; ctx.translate(dx, dy); shakeTime--; }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); drawCosmicBackground();
    gameTime++; player.animFrame++;
    
    if (player.invincible > 0) player.invincible--; 
    
    if (gameTime % 60 === 0) { timeLeft--; updateHUD(); if (timeLeft <= 0) { if (score >= targetScore) stageClear(); else gameOverSequence("Time Out!"); ctx.restore(); return; } }
    if (score >= targetScore) { stageClear(); ctx.restore(); return; }
    
    player.recoilY *= 0.8; 
    player.x += (player.targetX - player.x) * player.speed; if (player.x < 0) player.x = 0; if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    drawPlayer(player.x, player.y, player.animFrame);
    
    if (lives === 2 && gameTime % 12 === 0) { createSmoke(player.x + player.width/2, player.y + player.height/2, "rgba(150, 150, 150, 0.6)", 2); } 
    else if (lives === 1 && gameTime % 5 === 0) { createSmoke(player.x + player.width/2, player.y + player.height/2, "rgba(50, 50, 50, 0.8)", 4); if(Math.random() > 0.5) createSmoke(player.x + player.width/2, player.y + player.height/2, "#ff8800", 5); }
    
    if (gameTime % 20 === 0) { 
        playSound('laser');
        if (equippedWeapon === 'w_basic') { bullets.push({x: player.x + player.width/2 - 2, y: player.y - 10, width: 4, height: 15, speed: 12, color: "#fff"}); }
        else if (equippedWeapon === 'w_double') { bullets.push({x: player.x + player.width/2 - 15, y: player.y - 10, width: 5, height: 15, speed: 12, color: "#0f0"}); bullets.push({x: player.x + player.width/2 + 10, y: player.y - 10, width: 5, height: 15, speed: 12, color: "#0f0"}); }
        else if (equippedWeapon === 'w_laser') { bullets.push({x: player.x + player.width/2 - 4, y: player.y - 40, width: 8, height: 60, speed: 20, color: "#f00"}); }
        else if (equippedWeapon === 'w_spread') { 
            bullets.push({x: player.x + player.width/2 - 2, y: player.y - 10, width: 5, height: 15, speed: 15, color: "#00ffff"});
            bullets.push({x: player.x + player.width/2 - 15, y: player.y - 5, width: 5, height: 15, speed: 15, color: "#00ffff"});
            bullets.push({x: player.x + player.width/2 + 10, y: player.y - 5, width: 5, height: 15, speed: 15, color: "#00ffff"});
        }
        else if (equippedWeapon === 'w_death') { 
            bullets.push({x: player.x + player.width/2 - 10, y: player.y - 60, width: 20, height: 80, speed: 25, color: "#8e44ad"}); 
        }
    }
    bullets.forEach(b => { b.y -= b.speed; drawBullet(b); }); bullets = bullets.filter(b => b.y > -50);

    obstacles.forEach(obs => { obs.y += obs.speed; if(obs.speedX) obs.x += obs.speedX; obs.angle += obs.rotateSpeed; drawAsteroid(obs); }); 
    obstacles = obstacles.filter(obs => obs.y < canvas.height && obs.x > -100 && obs.x < canvas.width + 100);
    
    coins.forEach(c => { c.y += c.speed; drawCoin(c); }); coins = coins.filter(c => c.y < canvas.height);
    powerUps.forEach(pu => { pu.y += pu.speed; drawPowerUp(pu); }); powerUps = powerUps.filter(pu => pu.y < canvas.height);
    timeCapsules.forEach(tc => { tc.y += tc.speed; drawTimeCapsule(tc); }); timeCapsules = timeCapsules.filter(tc => tc.y < canvas.height);
    
    checkCollision();
    particles.forEach(p => { p.update(); p.draw(); }); particles = particles.filter(p => p.life > 0);
    floatingTexts.forEach(ft => { ft.update(); ft.draw(); }); floatingTexts = floatingTexts.filter(ft => ft.life > 0);

    score += 0.05; if (gameTime % 10 === 0) updateHUD();
    
    let obsRate = Math.max(15, 45 - (currentStage * 5)); if (gameTime % obsRate === 0) createObstacle();
    if (gameTime % 120 === 0) createCoin(); if (gameTime % 800 === 0) createPowerUp();
    
    // آپ کے کہنے کے مطابق کیپسول کا ٹائم واپس 1200 (20 سیکنڈ) کر دیا گیا ہے
    if (gameTime % 1200 === 0) createTimeCapsule();
    
    ctx.restore(); animationId = requestAnimationFrame(updateGame);
}
