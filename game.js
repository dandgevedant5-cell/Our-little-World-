const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game",
  physics: {
    default: "arcade"
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let interactKey;
let heartsCollected = 0;
let totalHearts = 4;
let hillUnlocked = false;

function preload() {
  // simple colored squares as textures
}

function create() {
  const scene = this;

  // Warm background
  this.add.rectangle(400, 300, 800, 600, 0xffe8c6);

  // Player
  player = this.add.rectangle(100, 100, 28, 28, 0x4a90e2);
  this.physics.add.existing(player);

  // Locations
  createLocation(this, 150, 150, 80, 80, 0xffc4a3, 
    "🏡 Home — Welcome to Our Little World.");

  createLocation(this, 350, 120, 90, 70, 0xcaffbf, 
    "☕ Café — This is where our story began.");

  createLocation(this, 600, 180, 100, 60, 0xbdb2ff, 
    "🌳 Park Bench — I could sit and talk with you forever.");

  createLocation(this, 250, 380, 110, 80, 0xffadad, 
    "🎮 Snack & Fun Zone — Our chaos is my favorite.");

  // Locked hill
  scene.hillZone = createLocation(this, 650, 420, 110, 90, 0x999999,
    "🌌 Final Hill — Locked. Collect all hearts first.");

  // Hearts (collectibles)
  scene.hearts = this.physics.add.group();

  addHeart(this, 500, 100, "You make my days brighter.");
  addHeart(this, 200, 300, "You are my favorite notification.");
  addHeart(this, 420, 450, "I love your smile.");
  addHeart(this, 700, 260, "Life feels warmer with you.");

  this.physics.add.overlap(player, scene.hearts, collectHeart, null, this);

  cursors = this.input.keyboard.createCursorKeys();
  interactKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );
}

function update() {
  const speed = 160;
  player.body.setVelocity(0);

  if (cursors.left.isDown) player.body.setVelocityX(-speed);
  if (cursors.right.isDown) player.body.setVelocityX(speed);
  if (cursors.up.isDown) player.body.setVelocityY(-speed);
  if (cursors.down.isDown) player.body.setVelocityY(speed);

  if (Phaser.Input.Keyboard.JustDown(interactKey)) {
    checkInteractions(this);
  }
}

function createLocation(scene, x, y, w, h, color, message) {
  const rect = scene.add.rectangle(x, y, w, h, color).setStrokeStyle(2,0x333333);
  scene.physics.add.existing(rect, true);
  rect.message = message;
  if (!scene.locations) scene.locations = [];
  scene.locations.push(rect);
  return rect;
}

function addHeart(scene, x, y, text) {
  const heart = scene.add.circle(x, y, 12, 0xff4d6d);
  scene.physics.add.existing(heart);
  heart.message = text;

  // gentle floating animation
  scene.tweens.add({
    targets: heart,
    y: y - 10,
    duration: 1200,
    yoyo: true,
    repeat: -1
  });

  scene.hearts.add(heart);
}

function collectHeart(player, heart) {
  showMessage("❤️ " + heart.message);
  heart.destroy();
  heartsCollected++;

  if (heartsCollected === totalHearts) {
    hillUnlocked = true;
    showMessage("🌟 All hearts found — Final Hill unlocked!");
  }
}

function checkInteractions(scene) {
  scene.locations.forEach(loc => {
    if (Phaser.Geom.Intersects.RectangleToRectangle(
      player.getBounds(),
      loc.getBounds()
    )) {
      if (loc === scene.hillZone && !hillUnlocked) {
        showMessage(loc.message);
      } else if (loc === scene.hillZone && hillUnlocked) {
        showMessage(
          "🌌 Under these stars — I’m so grateful for you. This is just the beginning of our story."
        );
        scene.cameras.main.setBackgroundColor("#0b1d3a");
      } else {
        showMessage(loc.message);
      }
    }
  });
}

function showMessage(text) {
  const box = document.getElementById("messageBox");
  box.innerText = text;
  box.classList.remove("hidden");

  setTimeout(() => {
    box.classList.add("hidden");
  }, 3500);
}
