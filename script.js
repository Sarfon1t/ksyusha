const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
const replayButton = document.getElementById("replay");
const loveButton = document.getElementById("love");

let width = 0;
let height = 0;
let particles = [];
let startTime = performance.now();
let loveBursts = [];

const palette = ["#d8b6ff", "#ff9bd5", "#a9c8ff", "#fff0ff", "#f6c4e7"];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildParticles();
}

function pointInGift() {
  const cx = width / 2;
  const cy = height / 2 + 40;
  const boxW = Math.min(260, width * .52);
  const boxH = Math.min(210, height * .31);
  const x = cx - boxW / 2 + Math.random() * boxW;
  const y = cy - boxH / 2 + Math.random() * boxH;
  return { x, y };
}

// A teddy silhouette built from overlapping ellipses.
function pointInTeddy() {
  const cx = width / 2;
  const cy = height / 2 + 25;
  const scale = Math.min(1, width / 650, height / 650);
  const shapes = [
    { x: -93, y: -150, rx: 43, ry: 48 }, // left ear
    { x: 93, y: -150, rx: 43, ry: 48 },  // right ear
    { x: 0, y: -105, rx: 118, ry: 105 },  // head
    { x: 0, y: 62, rx: 105, ry: 143 },    // body
    { x: -133, y: 30, rx: 61, ry: 83 },   // left arm
    { x: 133, y: 30, rx: 61, ry: 83 },    // right arm
    { x: -63, y: 183, rx: 66, ry: 54 },   // left foot
    { x: 63, y: 183, rx: 66, ry: 54 }     // right foot
  ];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random());
  return {
    x: cx + (shape.x + Math.cos(angle) * shape.rx * radius) * scale,
    y: cy + (shape.y + Math.sin(angle) * shape.ry * radius) * scale
  };
}

function buildParticles() {
  const count = Math.max(900, Math.min(2100, Math.floor(width * height / 430)));
  particles = Array.from({ length: count }, (_, i) => {
    const gift = pointInGift();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      gift,
      teddy: pointInTeddy(),
      color: palette[i % palette.length],
      size: Math.random() * 1.7 + .65,
      phase: Math.random() * Math.PI * 2,
      speed: .035 + Math.random() * .055
    };
  });
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function drawHeart(x, y, size, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 30, size / 30);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ff477f";
  ctx.shadowColor = "#ff477f";
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-28, -8, -15, -25, 0, -12);
  ctx.bezierCurveTo(15, -25, 28, -8, 0, 10);
  ctx.fill();
  ctx.restore();
}

function drawTeddyFace(progress) {
  if (progress < .96) return;
  const cx = width / 2;
  const cy = height / 2 + 25;
  const scale = Math.min(1, width / 650, height / 650);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#21162f";
  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.arc(-43, -112, 5, 0, Math.PI * 2);
  ctx.arc(43, -112, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#352039";
  ctx.beginPath();
  ctx.ellipse(0, -82, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heart on the teddy's tummy.
  drawHeart(0, 68, 76, 1);
  ctx.fillStyle = "#fff8ff";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("I LOVE YOU", 0, 111);
  ctx.restore();
}

function restart() {
  startTime = performance.now();
  loveBursts = [];
  buildParticles();
}

function animate(now) {
  const elapsed = (now - startTime) / 1000;
  const giftProgress = smoothstep(Math.min(1, elapsed / 2.2));
  const teddyProgress = smoothstep(Math.max(0, Math.min(1, (elapsed - 3.1) / 3.1)));
  const transition = elapsed < 3.1 ? 0 : teddyProgress;

  ctx.clearRect(0, 0, width, height);

  // A soft central glow.
  const glow = ctx.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, Math.min(width, height) * .43);
  glow.addColorStop(0, "rgba(155, 93, 220, 0.11)");
  glow.addColorStop(1, "rgba(9, 7, 20, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  for (const p of particles) {
    const target = {
      x: p.gift.x + (p.teddy.x - p.gift.x) * transition,
      y: p.gift.y + (p.teddy.y - p.gift.y) * transition
    };
    const drift = (1 - giftProgress) * 16 + (1 - transition) * 3;
    target.x += Math.sin(now * .001 + p.phase) * drift;
    target.y += Math.cos(now * .0012 + p.phase) * drift;
    p.x += (target.x - p.x) * p.speed;
    p.y += (target.y - p.y) * p.speed;

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = .72 + Math.sin(now * .002 + p.phase) * .25;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Ribbon and bow on the gift while it is forming.
  if (elapsed < 3.2) {
    const cx = width / 2;
    const cy = height / 2 + 40;
    const a = 1 - Math.min(1, elapsed / 3.2);
    ctx.save();
    ctx.globalAlpha = a * .8;
    ctx.strokeStyle = "#fff0ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 90); ctx.lineTo(cx, cy + 120);
    ctx.moveTo(cx - 125, cy - 12); ctx.lineTo(cx + 125, cy - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx - 22, cy - 95, 28, 17, -.5, 0, Math.PI * 2);
    ctx.ellipse(cx + 22, cy - 95, 28, 17, .5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawTeddyFace(transition);

  loveBursts = loveBursts.filter(b => now - b.time < 1300);
  for (const b of loveBursts) {
    const t = (now - b.time) / 1300;
    drawHeart(b.x, b.y - t * 75, 20 * (1 - t) + 5, 1 - t);
  }

  requestAnimationFrame(animate);
}

replayButton.addEventListener("click", restart);
loveButton.addEventListener("click", () => {
  loveBursts.push({ x: width / 2 + (Math.random() - .5) * 170, y: height / 2 + 40, time: performance.now() });
});
window.addEventListener("resize", resize);

resize();
requestAnimationFrame(animate);
