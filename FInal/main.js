//Constants 
const wander = 0.5
const attraction = 3
const deltaVolume = 1
let enemyList = []
const thingRadius = 40
const colideMult = 0.3;
const enemySpeed = 1;
const gameWidth = 7000
const gameHeight = 7000
const enemyStartGap = 300
let lastFrame = 0

const wallColor = [50, 50, 50]
const backgroundColor = [0, 0, 10]
const testColor = [0, 255, 0]

let position = [gameWidth/2, gameHeight/2]
let velocity = [0,0]
let angle = -Math.PI/2
let angleVel = 0
const angleDecay = 0.05
let boosting = false
let turningRight = false
let turningLeft = false

const playerSpeed = 0.3
const turningSpeed = 0.002
const playerDrag = 0.01

let finalVolume = 0
let currentVolume = 50

const starRadii = [4, 8]
const starColor = "rgb(245, 235, 235)"
const starList = []
const numStars = 600

let preGameFrames = true


window.addEventListener("DOMContentLoaded", function() {
  for (let i = 0 ; i<numStars ; i++) {
    starList.push(new star())
  }

  window.addEventListener("keydown", keyDownHandler)
  window.addEventListener("keyup", keyUpHandler)
  document.querySelector("#start").addEventListener("click", restart)
  document.querySelector("#endRestart").addEventListener("click", restart)
  document.querySelector("#volumeSetRestart").addEventListener("click", restart)
  document.querySelector("#setVolume").addEventListener("click", setVolume)

  window.requestAnimationFrame(preGameLoop)

})

function preGameLoop () {
  displayBackground()
  if (preGameFrames) {
    window.requestAnimationFrame(preGameLoop)
  }
}

function loop () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const image = document.querySelector("#minePhoto")

  const frameDelta = (Date.now() - lastFrame)*60/1000
  lastFrame = Date.now()

  // console.log(frameDelta)

  displayBackground()

  for (enemy of enemyList) {
    enemy.desire(frameDelta);
    enemy.colide();
  }
  for (enemy of enemyList) {
    enemy.move(frameDelta);
    ctx.fillStyle = "black"
    enemy.create(ctx, image);
  }

  updatePlayer(frameDelta, ctx, canvas)

  for (mine of enemyList) {
    if (vecDist(position, mine.coord) < 2*thingRadius) {
      finalVolume = mine.volume
      setVolume()
      return
    }
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
      vecScale(frameDelta * attraction / (dis ** 0.1), vecPoint(this.coord, position))
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

  create(ctx, image) {
    ctx.drawImage(image, this.coord[0]-(image.width/2), this.coord[1]-(image.width/2))
    ctx.font = "22px 'Helvetica Neue', Helvetica, Arial, sans-serif"
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillText(this.volume, this.coord[0], this.coord[1])
  }
}

class star {
  constructor () {
    this.radius = getRandom(...starRadii)
    this.position = [getRandom(0, gameWidth), getRandom(0, gameHeight)]
  }
  draw (ctx) {
    ctx.beginPath()
    ctx.arc(this.position[0] + this.radius, this.position[1] + this.radius, this.radius, Math.PI, 3*Math.PI/2)
    ctx.arc(this.position[0] + this.radius, this.position[1] - this.radius, this.radius, Math.PI/2, Math.PI)
    ctx.arc(this.position[0] - this.radius, this.position[1] - this.radius, this.radius, 0, Math.PI/2)
    ctx.arc(this.position[0] - this.radius, this.position[1] + this.radius, this.radius, 3*Math.PI/2, 0)
    ctx.fill()
  }
}

function updatePlayer (frameDelta, ctx, canvas) {
  if (boosting) {
    velocity = vecAdd(velocity, vecScale(frameDelta*playerSpeed, [Math.cos(angle), Math.sin(angle)]))
  }
  if (turningLeft) {
    angleVel -= turningSpeed
  }
  if (turningRight) {
    angleVel += turningSpeed
  }

  angleVel *= 1 - angleDecay
  angle += angleVel
  velocity = vecScale(1-(frameDelta*playerDrag), velocity)
  position = vecAdd(position, vecScale(frameDelta, velocity))

  angle = angle % (2*Math.PI)
  if (position[0] < thingRadius) {
    // angle = Math.PI - angle;
    velocity[0] *= -1
  } else if(position[0] > gameWidth - thingRadius) {
    // angle = Math.PI - angle;
    velocity[0] *= -1
  } else if (position[1] < thingRadius) {
    // angle *= -1;
    velocity[1] *= -1
  } else if (position[1] > gameHeight - thingRadius) {
    // angle *= -1;
    velocity[1] *= -1
  }

  position = [
    constrain(position[0], thingRadius, gameWidth - thingRadius),
    constrain(position[1], thingRadius, gameHeight - thingRadius),
  ];

  let image
  if (boosting) {
    image = document.querySelector("#boostingShip")
  } else {
    image = document.querySelector("#stillShip")
  }

  
  ctx.save()
  ctx.translate(position[0], position[1])
  ctx.rotate((Math.PI/2)+angle)
  ctx.drawImage(image, -1*thingRadius, -1*thingRadius)
  ctx.restore()
}

function restart () {
  document.querySelector("#endScreen").classList.add("hidden")
  document.querySelector("#startScreen").classList.add("hidden")
  document.querySelector("#volumeSetScreen").classList.add("hidden")

  preGameFrames = false

  enemyList = []

  position = [gameWidth/2, gameHeight/2]
  velocity = [0,0]
  angle = -Math.PI/2
  angleVel = 0

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

  document.querySelector("audio").volume = ((10**(currentVolume/100))-1)/9
  document.querySelector("audio").play()

  lastFrame = Date.now()
  window.requestAnimationFrame(loop)
}

function gameOver () {
  document.querySelector("#endText").textContent = `You got a volume of ${finalVolume}! Do you want to:`
  document.querySelector("#endScreen").classList.remove("hidden")
}

function setVolume () {
  document.querySelector("#volumeSetText").textContent = `Your volume has been set to ${finalVolume}`
  document.querySelector("#volumeSetScreen").classList.remove("hidden")
  document.querySelector("#endScreen").classList.add("hidden")
  currentVolume = finalVolume
  document.querySelector("audio").volume = ((10**(currentVolume/100))-1)/9
}

function keyUpHandler (event) {
  if (event.key == " ") {
    boosting = false
  } else if (event.key == "A" || event.key == "a" || event.key == "ArrowLeft") {
    turningLeft = false
  } else if (event.key == "D" || event.key == "d" || event.key == "ArrowRight") {
    turningRight = false
  }
}
function keyDownHandler (event) {
  if (event.key == " ") {
    boosting = true
  } else if (event.key == "A" || event.key == "a" || event.key == "ArrowLeft") {
    turningLeft = true
  } else if (event.key == "D" || event.key == "d" || event.key == "ArrowRight") {
    turningRight = true
  }
}

function displayBackground () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.screen.availWidth
  canvas.height = window.screen.availHeight

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(-1*(position[0]-(canvas.width/2)), -1*(position[1]-(canvas.height/2)))

  ctx.fillStyle = `rgb(${backgroundColor[0]} ${backgroundColor[1]} ${backgroundColor[2]})`;
  ctx.fillRect(-10, -10, gameWidth+20, gameHeight+20);
  ctx.fillStyle = `rgb(${wallColor[0]} ${wallColor[1]} ${wallColor[2]})`;
  ctx.fillRect(-1 * canvas.width, -1 * canvas.height, gameWidth + canvas.width*2, canvas.height);
  ctx.fillRect(-1 * canvas.width, -1 * canvas.height, canvas.width, gameHeight + canvas.height*2);
  ctx.fillRect(gameWidth, -1 * canvas.height, canvas.width, gameHeight + canvas.height*2);
  ctx.fillRect(-1 * canvas.width, gameHeight, gameWidth + canvas.width*2, canvas.height);
  // ctx.fillStyle = `green`;
  // ctx.fillRect(position[0]-(enemyStartGap+thingRadius), position[1]-(enemyStartGap+thingRadius), (enemyStartGap+thingRadius)*2, (enemyStartGap+thingRadius)*2);
  for (star of starList) {
    ctx.fillStyle = starColor
    star.draw(ctx)
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