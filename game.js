const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: "game",
  backgroundColor: "#f6e7c1",
  physics: { default: "arcade" },
  scene: { create, update }
};

new Phaser.Game(config);

let player, cursors, interactKey;
let locations = [];
let hearts, heartsCollected = 0;
const totalHearts = 5;
let hillUnlocked = false;

function create() {
  const scene = this;

  // 🌿 soft ground tiles feel
  for (let i = 0; i < 60; i++) {
    this.add.circle(
      Phaser.Math.Between(0,900),
      Phaser.Math.Between(0,600),
      Phaser.Math.Between(2,5),
      0xe9d8a6,
      0.4
    );
  }

  // 👤 player
  player = this.add.rectangle(80, 80, 26, 26, 0x3a86ff);
  this.physics.add.existing(player);

  // 🌳 decorative trees (gentle sway)
  makeTree(this, 120, 520);
  makeTree(this, 820, 120);
  makeTree(this, 500, 520);

  // 🏡 locations
  addLocation(this, 160, 150, 90, 90, 0xffc8a2,
    "🏡 Home — Every good story needs a beginning. Ours started with you.");

  addLocation(this, 420, 130, 110, 70, 0xcaffbf,
    "☕ Café — First talks, first laughs, first spark.");

  addLocation(this, 720, 210, 110, 70, 0xbdb2ff,
    "🌳 Park Bench — Time feels softer when I'm with you.");

  addLocation(this, 260, 380, 120, 90, 0xffadad,
    "🎮 Fun Zone — Our jokes > everything else.");

  scene.hill = addLocation(this, 720, 460, 120, 90, 0x9e9e9e,
    "🌌 Locked — Collect all hearts to unlock our future hill.");

  // ❤️ hearts
  hearts = this.physics.add.group();

  addHeart(this, 520, 80, "You make ordinary days magical.");
  addHeart(this, 200, 300, "You are my favorite person.");
  addHeart(this, 600, 360, "I love your chaos.");
  addHeart(this, 350, 500, "You matter to me — a lot.");
  addHeart(this, 820, 340, "My safe place = you.");

  this.physics.add.overlap(player, hearts, collectHeart, null, this);

  cursors = this.input.keyboard.createCursorKeys();
  interactKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );
}

function update() {
  const s = 170;
  player.body.setVelocity(0);

  if (cursors.left.isDown) player.body.setVelocityX(-s);
  if (cursors.right.isDown) player.body.setVelocityX(s);
  if (cursors.up.isDown) player.body.setVelocityY(-s);
  if (cursors.down.isDown) player.body.setVelocityY(s);

  if (Phaser.Input.Keyboard.JustDown(interactKey)) {
    checkLocationTouch(this);
  }
}

function makeTree(scene, x, y) {
  const t = scene.add.rectangle(x,y,30,40,0x2a9d8f);
  scene.tweens.add({
    targets: t,
    angle: 2,
    yoyo: true,
    repeat: -1,
    duration: 1800
  });
}

function addLocation(scene, x,y,w,h,color,msg) {
  const r = scene.add.rectangle(x,y,w,h,color).setStrokeStyle(2,0x333);
  scene.physics.add.existing(r,true);
  r.message = msg;
  locations.push(r);
  return r;
}

function addHeart(scene,x,y,msg){
  const h = scene.add.circle(x,y,12,0xff4d6d);
  scene.physics.add.existing(h);
  h.message = msg;

  scene.tweens.add({
    targets:h,
    y:y-12,
    yoyo:true,
    repeat:-1,
    duration:1200
  });

  hearts.add(h);
}

function collectHeart(player,h){
  showMessage("❤️ "+h.message);
  h.destroy();
  heartsCollected++;

  if(heartsCollected===totalHearts){
    hillUnlocked = true;
    showMessage("🌟 The hill is now unlocked.");
  }
}

function checkLocationTouch(scene){
  locations.forEach(loc=>{
    if(Phaser.Geom.Intersects.RectangleToRectangle(
      player.getBounds(), loc.getBounds()
    )){
      if(loc===scene.hill && !hillUnlocked){
        showMessage(loc.message);
      }
      else if(loc===scene.hill && hillUnlocked){
        scene.cameras.main.setBackgroundColor("#0b1d3a");
        showMessage("🌌 With you — every future feels bright. I love us.");
      }
      else{
        showMessage(loc.message);
      }
    }
  });
}

function showMessage(t){
  const box = document.getElementById("messageBox");
  box.innerText = t;
  box.classList.remove("hidden");
  setTimeout(()=>box.classList.add("hidden"), 4000);
}
