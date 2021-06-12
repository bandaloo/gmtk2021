import "phaser";
import { createBat } from "./Bat";
import { Enemy } from "./Enemy";
import { GAME_HEIGHT, GAME_WIDTH, SPRITE_SIZE } from "./consts";
import { addObjects, padRoom, randomizeRoom, splitRoom } from "./gen";
import { rooms } from "./rooms";

class Player {
  body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  isGrounded: boolean;
}

export default class Demo extends Phaser.Scene {
  private player: Player;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies: Enemy[] = [];
  private pointerDown = false;

  constructor() {
    super("demo");
  }

  preload(): void {
    this.load.image("rectangle", "assets/rectangle.png");
    this.load.glsl("stars", "assets/starfields.glsl.js");
    this.load.image("oldcircle", "assets/blank circle.png");
    this.load.spritesheet("circle", "assets/circle tileset.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet("bat_flying", "assets/bat_flying.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
  }

  create(): void {
    this.add.shader("RGB Shift Field", 0, 0, 1920, 1080).setOrigin(0);
    this.add
      .shader("RGB Shift Field", 0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0);

    const bat = createBat(this, 500, 500);
    this.enemies.push(bat);

    this.player = new Player();
    this.player.body = this.physics.add.sprite(200, 0, "circle");

    const platforms = this.physics.add.staticGroup();

    addObjects(
      padRoom(
        randomizeRoom(
          splitRoom(rooms[Math.floor((rooms.length - 1) * Math.random())]),
          0.5,
          0.5
        )
      ),
      platforms
    );

    this.player.body.setBounce(0);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setDrag(1200, 0);
    this.player.body.setMaxVelocity(300, 10000);

    this.anims.create({
      key: "left",
      // frames: this.anims.generateFrameNumbers("circle", { start: 1, end: 1 }),
      frames: [{ key: "circle", frame: 0 }],
      frameRate: 10,
      // repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "circle", frame: 1 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      // frames: this.anims.generateFrameNumbers("circle", { start: 5, end: 8 }),
      frames: [{ key: "circle", frame: 2 }],
      frameRate: 10,
      // repeat: -1,
    });

    this.physics.add.collider(this.player.body, platforms);
    this.physics.add.collider(bat.sprite, platforms);

    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        if (!this.pointerDown) {
          console.log(pointer.worldX);
          console.log(pointer.worldY);
          this.pointerDown = true;
        }
      },
      this
    );

    this.input.on(
      "pointerup",
      () => {
        if (this.pointerDown) {
          this.pointerDown = false;
        }
      },
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cursors.left.onDown = () => {
      this.cursors.left.isDown = true;
      this.player.body.setAccelerationX(-1800);
      this.player.body.anims.play("left", true);
    };
    this.cursors.right.onDown = () => {
      this.cursors.right.isDown = true;
      this.player.body.setAccelerationX(1800);
      this.player.body.anims.play("right", true);
    };

    this.cursors.space.setEmitOnRepeat(false);
    this.cursors.space.onDown = () => {
      this.cursors.up.isDown = true;
      if (this.player.isGrounded) {
        this.player.body.setVelocityY(-500);
      }
    };
  }

  update(): void {
    this.enemies.forEach((e) => e.update());

    this.player.isGrounded = this.player.body.body.touching.down;

    if (!(this.cursors.right.isDown || this.cursors.left.isDown)) {
      this.player.body.setAccelerationX(0);
      this.player.body.anims.play("turn");
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 800 },
    },
  },
};

new Phaser.Game(config);
