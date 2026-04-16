//Constants
const wander = 0.5
const attraction = 5
const deltaVolume = 5
const enemyList = []
const thingRadius = 20
const colideMult = 0.3;
const enemySpeed = 1;
const gameWidth = 500
const gameHeight = 500
const enemyStartGap = 50
let lastFrame = 0

const wallColor = [50, 50, 50]
const backgroundColor = [0, 0, 10]
const testColor = [0, 255, 0]

let position = [gameWidth/2, gameHeight/2]
let velocity = [0,0]



window.addEventListener("DOMContentLoaded", function() {
    for (let volume = 0 ; volume <= 100 ; volume += deltaVolume) {
      if (volume % (deltaVolume*4) == 0) {
        enemyList.push(new enemies(getRandom(0, position[0]-(enemyStartGap+thingRadius)), getRandom(0, gameHeight), volume))
      } else if (volume % (deltaVolume*4) == 1*deltaVolume) {
        enemyList.push(new enemies(getRandom(position[0]+(enemyStartGap+thingRadius), gameWidth), getRandom(0, gameHeight), volume))
      } else if (volume % (deltaVolume*4) == 2*deltaVolume) {
        enemyList.push(new enemies(getRandom(0, gameWidth), getRandom(0, position[1]-(enemyStartGap+thingRadius)), volume))
      } else {
        enemyList.push(new enemies(getRandom(0, gameWidth), getRandom(position[1]+(enemyStartGap+thingRadius), gameHeight), volume))
      }
    }
    lastFrame = Date.now()
    window.requestAnimationFrame(loop)
})

function loop () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.screen.availWidth
  canvas.height = window.screen.availHeight

  const frameDelta = (Date.now() - lastFrame)*60/1000
  lastFrame = Date.now()

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(-1*(position[0]-(canvas.width/2)), -1*(position[1]-(canvas.height/2)))

  ctx.fillStyle = `rgb(${backgroundColor[0]} ${backgroundColor[1]} ${backgroundColor[2]})`;
  ctx.fillRect(-10, -10, gameWidth+20, gameHeight+20);
  ctx.fillStyle = `rgb(${wallColor[0]} ${wallColor[1]} ${wallColor[2]})`;
  ctx.fillRect(-1 * canvas.width, -1 * canvas.height, gameWidth + canvas.width*2, canvas.height);
  ctx.fillRect(-1 * canvas.width, -1 * canvas.height, canvas.width, gameHeight + canvas.height*2);
  ctx.fillRect(gameWidth, -1 * canvas.height, canvas.width, gameHeight + canvas.height*2);
  ctx.fillRect(-1 * canvas.width, gameHeight, gameWidth + canvas.width*2, canvas.height);

  for (enemy of enemyList) {
    enemy.desire(frameDelta);
    enemy.colide();
  }
  for (enemy of enemyList) {
    enemy.move(frameDelta);
    enemy.create(ctx);
  }

  window.requestAnimationFrame(loop)
}

class enemies {
  constructor(x, y, volume) {
    this.coord = [x, y];
    this.vel = [0, 0];
    this.wanderAng = getRandom(-Math.PI, Math.PI);
    this.volume = volume
  }

  desire(frameDelta) {
    this.wanderAng += getRandom(-0.15, 0.15);
    let wanderVec = [Math.cos(this.wanderAng), Math.sin(this.wanderAng)];

    const dis = vecDist(this.coord, position)

    this.vel = vecAdd(
      vecScale(frameDelta * wander * Math.sqrt(dis / 255), wanderVec),
      vecScale(frameDelta * attraction * this.volume / dis ** 1.3, vecPoint(this.coord, position))
    );
  }

  colide() {
    for (enemy of enemyList) {
      if (enemy != this) {
        if (vecDist(this.coord, enemy.coord) < thingRadius * 2) {
          let pointingV = vecPoint(enemy.coord, this.coord);
          this.vel = vecAdd(this.vel, vecScale(colideMult, pointingV));
        }
      }
    }
  }

  move(frameDelta) {
    this.coord = vecAdd(this.coord, vecScale(enemySpeed * frameDelta, this.vel));

    if (
      this.coord[0] < thingRadius ||
      this.coord[0] > gameWidth - thingRadius ||
      this.coord[1] < thingRadius ||
      this.coord[1] > gameHeight - thingRadius
    ) {
      this.wanderAng += Math.PI;
    }

    this.coord = [
      constrain(this.coord[0], thingRadius, gameWidth - thingRadius),
      constrain(this.coord[1], thingRadius, gameHeight - thingRadius),
    ];
  }

  create(ctx) {
    //TODO
  }
}

/** Get a random number in the range [min, max) */
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

/** constrain the value between the max and min.  If the max is less than the min, it will return the max value if the value is larger than max and min otherwise */
function constrain(value, min, max) {
  if (min > max) {
    console.log("Min > Max error")
  }
  if (value > max) {
    return max
  } else if (value < min) {
    return min
  } else {
    return value
  }
}

//Vector Math
function vecAdd(vector1, vector2) {
  return [vector1[0] + vector2[0], vector1[1] + vector2[1]];
}
function vecSub(vector1, vector2) {
  return [vector1[0] - vector2[0], vector1[1] - vector2[1]];
}
function vecScale(scalar, vector) {
  return [vector[0] * scalar, vector[1] * scalar];
}
function vecDist(vector1, vector2) {
  return Math.sqrt((vector1[0] - vector2[0]) ** 2 + (vector1[1] - vector2[1]) ** 2);
}
function vecPoint(origin, destination) {
  return vecScale(
    1 / Math.max(0.001, vecDist(origin, destination)),
    vecAdd(destination, vecScale(-1, origin))
  );
}
function vecPerp(vector) {
  return [1, -1 * (vector[0] / vector[1])];
}
function vecMag(vector) {
  return Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
}
function vecDot(vector1, vector2) {
  return vector1[0] * vector2[0] + vector1[1] * vector2[1];
}
function vecProj(vector, onto) {
  let scalar = vecDot(vector, onto) / vecMag(onto) ** 2;
  return vecScale(scalar, onto);
}