// src/game.js
/* Full Sunny prototype (Shadow Slave inspired)
   - WASD movement + jump
   - Abilities Q (Shadow Form), B (Blink) or W (Blink mapped to B), E (Tentacle), R (Echo)
   - Experience/leveling with locked abilities
   - Monster roster and rank -> level mapping
   - Loot and pickups
   - All logic self-contained for quick run
*/

// ----- Utils -----
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const rand = (a,b) => Math.random()*(b-a)+a;
const choose = arr => arr[Math.floor(Math.random()*arr.length)];

// ----- Config -----
const CONFIG = {
  gravity: 1400,
  groundY: 580,
  canvasW: 1200,
  canvasH: 700,
  playerBaseSpeed: 260,
  playerAirSpeed: 220,
  jumpPower: 520,
  friction: 0.88,
};

// ----- DOM / Canvas -----
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.canvasW;
canvas.height = CONFIG.canvasH;

const UI = {
  hpval: document.getElementById('hpval'),
  hpmax: document.getElementById('hpmax'),
  xpval: document.getElementById('xpval'),
  xpmax: document.getElementById('xpmax'),
  lvlval: document.getElementById('lvlval'),
  shadval: document.getElementById('shadval'),
  log: document.getElementById('log'),
  abilityEls: {
    Q: document.getElementById('a-q'),
    W: document.getElementById('a-w'),
    E: document.getElementById('a-e'),
    R: document.getElementById('a-r'),
  }
};

function log(msg){
  const el = document.createElement('div');
  el.textContent = `[${(new Date()).toLocaleTimeString()}] ${msg}`;
  UI.log.prepend(el);
  while(UI.log.children.length>60) UI.log.removeChild(UI.log.lastChild);
}

// ----- Player / Sunny -----
class Player {
  constructor(){
    this.x = 200;
    this.y = CONFIG.groundY - 48;
    this.vx = 0;
    this.vy = 0;
    this.width = 48;
    this.height = 48;

    // stats
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
    this.maxHP = 100;
    this.hp = this.maxHP;
    this.shadFrags = 0;

    // movement
    this.onGround = true;
    this.facing = 1;
    this.animFrame = 0;
    this.walkTimer = 0;

    // abilities
    this.cooldowns = { q:0, w:0, e:0, r:0 };
    this.abilityState = { shadowForm:false, shadowFormTimer:0, echoes: [] };
  }

  giveXP(amount){
    this.xp += amount;
    log(`Gained ${amount} XP.`);
    while(this.xp >= this.xpToNext){
      this.xp -= this.xpToNext;
      this.levelUp();
    }
    updateUI();
  }

  levelUp(){
    this.level++;
    this.maxHP += 12 + Math.floor(this.level*1.6);
    this.hp = this.maxHP;
    this.xpToNext = Math.round(this.xpToNext * 1.25);
    log(`Level Up! You are now level ${this.level}.`);
    UI.lvlval.classList.add('level-up');
    setTimeout(()=> UI.lvlval.classList.remove('level-up'),900);
    updateUI();
  }

  takeDamage(d){
    if(this.abilityState.shadowForm) d = Math.round(d * 0.65);
    this.hp -= d;
    this.hp = Math.max(0, this.hp);
    log(`Sunny took ${d} damage.`);
    updateUI();
  }

  heal(amount){
    this.hp = clamp(this.hp + amount, 0, this.maxHP);
    updateUI();
  }

  addShad(n){
    this.shadFrags += n;
    updateUI();
  }

  canUseQ(){ return this.level >= 1 && this.cooldowns.q <= 0; }
  canUseW(){ return this.level >= 3 && this.cooldowns.w <= 0; }
  canUseE(){ return this.level >= 5 && this.cooldowns.e <= 0; }
  canUseR(){ return this.level >= 8 && this.cooldowns.r <= 0; }

  update(dt, input){
    // cooldowns
    for(let k in this.cooldowns) if(this.cooldowns[k] > 0) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);

    // movement acceleration
    let accel = 0;
    const speed = (this.onGround ? CONFIG.playerBaseSpeed : CONFIG.playerAirSpeed);
    if(input.left) accel -= 1;
    if(input.right) accel += 1;

    this.vx += accel * speed * dt;
    this.vx = clamp(this.vx, -speed, speed);

    // jump
    if(input.jump && this.onGround){
      this.vy = -CONFIG.jumpPower;
      this.onGround = false;
    }

    // gravity
    this.vy += CONFIG.gravity * dt;

    // friction if idle on ground
    if(this.onGround && accel === 0){
      this.vx *= Math.pow(CONFIG.friction, dt*60);
      if(Math.abs(this.vx) < 6) this.vx = 0;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // ground collision
    if(this.y + this.height >= CONFIG.groundY){
      this.y = CONFIG.groundY - this.height;
      this.onGround = true;
      this.vy = 0;
    } else {
      this.onGround = false;
    }

    // facing and bounds
    if(accel !== 0) this.facing = accel > 0 ? 1 : -1;
    this.x = clamp(this.x, 20, canvas.width - this.width - 20);

    // shadow form timers
    if(this.abilityState.shadowForm){
      this.abilityState.shadowFormTimer -= dt;
      if(this.abilityState.shadowFormTimer <= 0){
        this.abilityState.shadowForm = false;
        log('Shadow Form faded.');
      }
    }

    // echoes movement and collision
    this.abilityState.echoes = this.abilityState.echoes.filter(e=>{
      e.age += dt;
      e.x += e.vx * dt;
      if(e.age > e.duration) return false;
      monsters.forEach(m=>{
        if(!m.alive) return;
        if(Math.abs(e.x - (m.x + m.width/2)) < (m.width/2 + e.radius) && Math.abs(e.y - (m.y + m.height/2)) < (m.height/2 + e.radius)){
          m.hurt(e.damage);
          e.age = e.duration;
        }
      });
      return e.age <= e.duration;
    });

    // walking animation
    if(Math.abs(this.vx) > 6 && this.onGround){
      this.walkTimer += dt;
    } else {
      this.walkTimer = 0;
    }
    this.animFrame = Math.floor(this.walkTimer * 8) % 4;
  }

  render(ctx){
    // shadow aura
    if(this.abilityState.shadowForm){
      ctx.save();
      ctx.globalAlpha = 0.12 + 0.04*Math.sin(Date.now()/150);
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.ellipse(this.x+this.width/2, this.y+this.height/2, 44, 30, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    // body
    ctx.save();
    ctx.translate(this.x + this.width/2, this.y + this.height/2);
    ctx.scale(this.facing, 1);

    ctx.fillStyle = '#ffd98f';
    ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

    ctx.fillStyle = '#000';
    ctx.fillRect(4, -6, 8, 6);
    ctx.restore();

    // echoes
    ctx.fillStyle = 'rgba(20,20,20,0.9)';
    this.abilityState.echoes.forEach(e=>{
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.radius, e.radius*0.6, 0,0,Math.PI*2);
      ctx.fill();
    });
  }

  // Abilities
  doQ(){ // Shadow Form
    if(!this.canUseQ()) return;
    this.cooldowns.q = 6;
    this.abilityState.shadowForm = true;
    this.abilityState.shadowFormTimer = 6;
    this.addShad(6);
    log('Shadow Form activated.');
  }

  doW(){ // Blink
    if(!this.canUseW()) return;
    this.cooldowns.w = 4;
    const dist = 200;
    this.x += this.facing * dist;
    spawnDamageWave(this.x + this.width/2, this.y + this.height/2, 60, 18 + Math.floor(this.level*0.8));
    log('Blink used.');
  }

  doE(){ // Tentacle
    if(!this.canUseE()) return;
    if(this.shadFrags < 6){
      log('Not enough Shadow Fragments for Tentacle (need 6).');
      return;
    }
    this.shadFrags -= 6;
    this.cooldowns.e = 7;
    const t = {
      x: this.x + this.width/2 + this.facing*40,
      y: this.y + this.height/2,
      vx: this.facing * 500,
      vy: 0,
      radius: 18,
      age: 0,
      duration: 1.2,
      damage: 28 + Math.floor(this.level*2.5)
    };
    projectiles.push(t);
    log('Shadow Tentacle launched.');
    updateUI();
  }

  doR(){ // Echo Summon
    if(!this.canUseR()) return;
    if(this.shadFrags < 12){
      log('Need 12 Shadow Fragments to summon an Echo.');
      return;
    }
    this.shadFrags -= 12;
    this.cooldowns.r = 18;
    const e = {
      x: this.x + this.width/2 + this.facing*60,
      y: this.y + this.height/2,
      vx: this.facing * 70,
      age: 0,
      duration: 12,
      radius: 14,
      damage: 10 + Math.floor(this.level*1.2)
    };
    this.abilityState.echoes.push(e);
    log('Echo summoned.');
    updateUI();
  }
}

const player = new Player();

// ----- Input handling -----
let input = { left:false, right:false, jump:false };
window.addEventListener('keydown', e=>{
  const key = e.key.toLowerCase();
  if(key === 'a') input.left = true;
  if(key === 'd') input.right = true;
  if(key === 'w' || key === ' ') input.jump = true;
  if(key === 'q') player.doQ();
  if(key === 'e') player.doE();
  if(key === 'r') player.doR();
  if(key === 'b') player.doW();
});
window.addEventListener('keyup', e=>{
  const key = e.key.toLowerCase();
  if(key === 'a') input.left = false;
  if(key === 'd') input.right = false;
  if(key === 'w' || key === ' ') input.jump = false;
});

// UI clickable abilities
Object.entries(UI.abilityEls).forEach(([k,el])=>{
  el.addEventListener('click', ()=>{
    const key = el.getAttribute('data-key');
    if(key === 'Q') player.doQ();
    if(key === 'W') player.doW();
    if(key === 'E') player.doE();
    if(key === 'R') player.doR();
  });
});

// ----- Monsters / Ranks -----
const MONSTER_RANKS = [
  {name:'Common', multiplier: 1, baseXP: 8},
  {name:'Uncommon', multiplier: 1.6, baseXP: 18},
  {name:'Elite', multiplier: 3, baseXP: 48},
  {name:'Champion', multiplier: 6, baseXP: 120},
  {name:'Major', multiplier: 13, baseXP: 360},
  {name:'Monarch', multiplier: 30, baseXP: 1200}
];

const MONSTER_ROSTER = [
  {id:'scavenger', name:'Carapace Scavenger', color:'#7a4', baseHP:40, baseAtk:8, width:40, height:34},
  {id:'grimling', name:'Grimling', color:'#d47', baseHP:28, baseAtk:6, width:36, height:30},
  {id:'shadehound', name:'Shade Hound', color:'#777', baseHP:60, baseAtk:12, width:52, height:34},
  {id:'tangleroot', name:'Tangleroot', color:'#486', baseHP:90, baseAtk:16, width:60, height:40},
  {id:'revelling', name:'Revelling', color:'#b388ff', baseHP:140, baseAtk:30, width:72, height:48},
  {id:'nightdrake', name:'Night Drake', color:'#442266', baseHP:300, baseAtk:58, width:120, height:80},
  {id:'wraith', name:'Wraith', color:'#0ff', baseHP:80, baseAtk:20, width:44, height:48},
  {id:'boneclam', name:'Bone Clam', color:'#aab', baseHP:200, baseAtk:30, width:94, height:64},
  {id:'voidcrawler', name:'Void Crawler', color:'#111', baseHP:40, baseAtk:10, width:28, height:20},
  {id:'hiveback', name:'Hiveback', color:'#7f6', baseHP:110, baseAtk:18, width:68, height:46},
  {id:'gloomstalker', name:'Gloom Stalker', color:'#331', baseHP:160, baseAtk:36, width:78, height:50},
  {id:'dreadancer', name:'Dreadancer', color:'#b23', baseHP:220, baseAtk:40, width:88, height:60}
];

class Monster {
  constructor(spec, rankIndex, x){
    this.spec = spec;
    this.rankIndex = rankIndex;
    this.rank = MONSTER_RANKS[rankIndex];
    this.level = Math.max(1, Math.floor((rankIndex+1)* (rand(0.85,1.3) * 2) ));
    this.maxHP = Math.round(spec.baseHP * this.rank.multiplier * (1 + this.level*0.06));
    this.hp = this.maxHP;
    this.atk = Math.round(spec.baseAtk * this.rank.multiplier * (1 + this.level*0.04));
    this.x = x || (canvas.width + 80 + Math.random()*200);
    this.y = CONFIG.groundY - spec.height;
    this.width = spec.width;
    this.height = spec.height;
    this.color = spec.color;
    this.alive = true;
    this.vx = - (40 + rankIndex*10 + Math.random()*30);
    this.attackCooldown = 0;
    this.aggro = false;
    this.exp = Math.round(this.rank.baseXP * (1 + this.level*0.12));
  }

  hurt(d){
    if(!this.alive) return;
    let realD = d;
    if(player.abilityState.shadowForm) realD = Math.round(d * 0.65);
    this.hp -= realD;
    if(this.hp <= 0) this.die();
  }

  die(){
    if(!this.alive) return;
    this.alive = false;
    spawnLoot(this.x, this.y, this.rankIndex);
    player.giveXP(this.exp);
    player.addShad( Math.max(1, Math.floor(this.rankIndex*1.2)) );
    log(`${this.spec.name} (Lv ${this.level} ${this.rank.name}) died. XP ${this.exp}.`);
  }

  update(dt){
    if(!this.alive) return;
    const distX = (player.x - this.x);
    if(Math.abs(distX) < 300) this.aggro = true;
    if(this.aggro) {
      const dir = distX > 0 ? 1 : -1;
      this.x += dir * Math.min(100, Math.abs(distX)) * dt * 0.5;
      if(Math.abs(player.x - this.x) < 64 && Math.abs(player.y - this.y) < 80){
        if(this.attackCooldown <= 0){
          this.attackCooldown = 1.4 - (this.level*0.02);
          let dmg = Math.max(1, this.atk + Math.floor(this.level*0.4));
          player.takeDamage(dmg);
        }
      }
    } else {
      this.x += this.vx * dt;
    }
    if(this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);
  }

  render(ctx){
    if(!this.alive) return;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const barW = this.width;
    const barH = 6;
    const pct = this.hp / this.maxHP;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(this.x, this.y-10, barW, barH);
    ctx.fillStyle = '#ff4747';
    ctx.fillRect(this.x, this.y-10, Math.max(0, barW*pct), barH);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`${this.spec.name} L${this.level} ${this.rank.name}`, this.x, this.y - 14);
    ctx.restore();
  }
}

// ----- Game arrays -----
const monsters = [];
const projectiles = [];
const loot = [];
const damageWaves = [];

// ----- Spawn functions -----
function spawnMonsterWave(count = 3, rankIndex = 0){
  for(let i=0;i<count;i++){
    const spec = choose(MONSTER_ROSTER);
    const x = canvas.width + 60 + i*80 + Math.random()*200;
    monsters.push(new Monster(spec, rankIndex, x));
  }
}

function spawnLoot(x,y, rankIndex){
  loot.push({x:x,y:y,vx:rand(-40,40),vy:-140,age:0,ty:'shad',amt: 1+rankIndex});
  if(Math.random() < 0.45) loot.push({x:x+20,y:y,vx:rand(-20,20),vy:-100,age:0,ty:'hp',amt: 8 + rankIndex*3});
}

function spawnDamageWave(x,y,radius,damage){
  dam
