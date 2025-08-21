class Item extends Body {
  constructor(t, x, y, v) {
    let bd;
    if (t === "coin") bd = Bodies.circle(x + blockSize / 2, y + blockSize / 2, 10);
    if (t === "chest") bd = Bodies.rectangle(x + blockSize / 2, y - blockSize / 2, 100, 75, {
      isStatic: false,
      friction: 0.9,
      density: 0.01,
      chamfer: {
        radius: [20, 5, 20, 5]
      }
    })
    if (t === "arcanium") bd = Bodies.rectangle(x + blockSize / 2, y - blockSize / 2, 100, 100, {
      isStatic: false,
      friction: 0.9,
      density: 0.01,
      chamfer: 5
    })
    super(bd, t)
    this.health = 100;
    this.value = v || (1 + Math.floor(Math.random() * 3));
    this.dead = false;
    this.team = null;

    if (this.type === 'arcanium') {
      this.health = 200;
      this.team = "b"
    }

    this.distCriteria = (b) => dist(b.x, b.y, this.body.position.x, this.body.position.y) <= 85 / 2;

    if(this.type === 'coin') this.distCriteria = null;
  }

  strike(b) {
    if (this.type === 'chest') {
      if (this.health - b.stats.damage <= 0) {
        if (bodies[bodies.findIndex(u => u.id === b.stats.fromId)]) bodies[bodies.findIndex(u => u.id === b.stats.fromId)].xp += 50;
      }
      this.health -= b.stats.damage;
      if (this.health <= 0 && b.stats.fromId === player.id) {
        playSound("chest-break.mp3", 0.075, true)
      }
      bd.applyForce(this.body, {
        x: b.x,
        y: b.y
      }, {
        x: constrain((Cos(b.r) * b.stats.damage) / 250, -0.025, 0.025),
        y: constrain((Sin(b.r) * b.stats.damage) / 250, -0.025, 0.025)
      })
      b.kill();

    } else if (this.type === 'arcanium') {
      if (this.health - b.stats.damage <= 0) {
        if (bodies[bodies.findIndex(u => u.id === b.stats.fromId)]) bodies[bodies.findIndex(u => u.id === b.stats.fromId)].xp += 100;
      }
      this.health -= b.stats.damage;
      if (this.health <= 0 && b.stats.fromId === player.id) {
        playSound("chest-break.mp3", 0.075, true)
      }
      bd.applyForce(this.body, {
        x: b.x,
        y: b.y
      }, {
        x: constrain((Cos(b.r) * b.stats.damage) / 250, -0.025, 0.025),
        y: constrain((Sin(b.r) * b.stats.damage) / 250, -0.025, 0.025)
      })
      b.kill();
    }
  }

  run() {
    let { x, y } = this.body.position;
    if (this.type === "coin") {
      for (let i = bodies.length; i--;) {
        let u = bodies[i];
        if (u.type === "player" || u.type === "unit") {
          if (dist(u.body.position.x, u.body.position.y, x, y) <= 90) {
            u.credits += this.value;
            u.xp += Math.round(this.value / 2);
            if (bodies.filter(x => x.type === "coin").length <= levels[level].coinCount) {
              let emy = Math.floor(Math.random() * levels[level].m.length);
              let emx = Math.floor(Math.random() * levels[level].m[0].length);
              while (levels[level].m[emy][emx] !== ' ') {
                emy = Math.floor(Math.random() * levels[level].m.length);
                emx = Math.floor(Math.random() * levels[level].m[0].length);
              }
              bodies.push(new Item("coin", emx * blockSize, emy * blockSize));
            }
            if (this.onScreen() && u.type === 'player') {
              playSound("coin.mp3", 0.075, true)
            }
            this.kill();
          }
        }
      }
    }

    if (this.type === "chest") {
      if (this.health <= 0) {
        for (let i = 10 + Math.floor(Math.random() * 25); i--;) {
          bodies.push(new Item("coin", x + random(-1, 1), y + random(-1, 1)));
        }
        setTimeout(() => {
          if (bodies.filter(f => f.type === "chest").length < levels[level].chestCount) {
            bodies.push(new Item("chest", x, y));
          }
        }, 10000 + (Math.random() * 100000))
        this.kill();
      }
    }

    if (this.type === "arcanium") {
      if (this.health <= 0) {
        for (let i = 10; i--;) particles.push(new Particle("explosion", this.x, this.y));
        this.kill();
      }
    }
  }

  draw() {
    let { x, y } = this.body.position;
    if (this.type === "coin") {
      imageMode(CENTER);
      image(sprites.coin, x, y, 30 * this.value / 4, 30 * this.value / 4);
    }
    if (this.type === "chest") {
      imageMode(CENTER);
      image(sprites.chest, x, y, 100, 75);
    }
    if (this.type === "arcanium") {
      imageMode(CENTER);
      image(sprites.arcanium, x, y, 100, 100);
    }
  }
}