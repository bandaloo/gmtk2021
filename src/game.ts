import "phaser";
import { Bat } from "./Bat";
import { Enemy } from "./Enemy";
import { GAME_HEIGHT, GAME_WIDTH, SPRITE_SIZE } from "./consts";
import { addObjects, padRoom, randomizeRoom, splitRoom } from "./gen";
import { rooms } from "./rooms";
import { Player } from "./Player";

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
    this.load.spritesheet("bat_swooping", "assets/bat_swooping.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_jump", "assets/blob_jump.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_move", "assets/blob_move.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_still", "assets/blob_still.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
  }

  create(): void {
    this.add
      .shader("RGB Shift Field", 0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0);
    this.add
      .shader("RGB Shift Field", 0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0);

    const bat = new Bat(this.physics.add.sprite(500, 500, "bat_flying"));
    this.enemies.push(bat);

    this.player = new Player(
      this.physics.add.sprite(200, 200, "blob_move"),
      this.input.keyboard
    );

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

    this.physics.add.collider(this.player.sprite, platforms);
    this.enemies.forEach((e) => {
      this.physics.add.collider(e.sprite, this.player.sprite, (obj1, obj2) => {
        console.log("hit");
        console.log(obj1);
        console.log(obj2);
        if (obj1.getData("outerObject") instanceof Enemy) {
          obj1.getData("outerObject").onCollide(obj2);
        }
      });
    });
    this.enemies.forEach((e) => {
      this.physics.add.collider(e.sprite, platforms);
    });

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
  }

  update(): void {
    this.player.update();
    this.enemies.forEach((e) => e.update());
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
