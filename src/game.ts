import "phaser";
import { Enemy } from "./Enemy";
import { GAME_HEIGHT, GAME_WIDTH, SPRITE_SIZE } from "./consts";
import { addObjects, padRoom, randomizeRoom, splitRoom } from "./gen";
import { rooms } from "./rooms";
import { Player } from "./Player";

export default class Demo extends Phaser.Scene {
  private player: Player;
  enemies: Enemy[] = [];
  private pointerDown = false;

  constructor() {
    super("demo");
  }

  preload(): void {
    this.load.image("rectangle", "assets/rectangle.png");
    this.load.image("tile_1", "assets/tile_1.png");
    this.load.image("tile_2", "assets/tile_2.png");
    this.load.image("tile_3", "assets/tile_3.png");
    this.load.image("tile_bart", "assets/tile_bart.png");
    this.load.image("background", "assets/background.png");
    this.load.image("heart_empty", "assets/heart_empty.png");
    this.load.image("heart_full", "assets/heart_full.png");
    this.load.image("grapple_arm", "assets/grapple_arm.png");
    this.load.image("grapple_base", "assets/Grapple_Base.png");
    this.load.image("grapple_hand", "assets/Grapple_Hand.png");
    this.load.image("oldcircle", "assets/blank circle.png");
    this.load.image("fruit", "assets/fruit.png");
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
    this.load.spritesheet("blob_rising", "assets/blob_rising.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_falling", "assets/blob_falling.png", {
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
    this.load.spritesheet("blob_dropping", "assets/blob_dropping.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_egg", "assets/blob_egg.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet(
      "blob_double_jump_wings",
      "assets/blob_double_jump_wings.png",
      {
        frameWidth: SPRITE_SIZE,
        frameHeight: SPRITE_SIZE,
      }
    );
    this.load.spritesheet(
      "blob_falling_wings",
      "assets/blob_falling_wings.png",
      {
        frameWidth: SPRITE_SIZE,
        frameHeight: SPRITE_SIZE,
      }
    );
    this.load.spritesheet("blob_jump_wings", "assets/blob_jump_wings.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_move_wings", "assets/blob_move_wings.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("blob_still_wings", "assets/blog_still_wings.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");

    const platforms = this.physics.add.staticGroup();
    const pickups = this.physics.add.staticGroup();

    addObjects(
      padRoom(
        randomizeRoom(
          splitRoom(rooms[Math.floor((rooms.length - 1) * Math.random())]),
          0.5,
          0.5
        )
      ),
      platforms,
      pickups,
      this
    );

    this.player = new Player(
      this.physics.add.sprite(200, 200, "blob_move"),
      this.input.keyboard,
      platforms
    );

    this.physics.add.collider(this.player.sprite, platforms);

    this.physics.add.overlap(this.player.sprite, pickups, (obj1, obj2) => {
      const player = obj1.getData("outerObject");
      if (player instanceof Player) {
        if (obj2.name === "fruit") {
          player.eatFruit();
        }
        obj2.destroy();
      }
    });

    this.enemies.forEach((e) => {
      this.physics.add.overlap(e.sprite, this.player.sprite, (obj1, obj2) => {
        const enemy = obj1.getData("outerObject");
        if (enemy instanceof Enemy) {
          enemy.onOverlap(obj2);
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
  }

  update(): void {
    this.player.update();
    this.enemies.forEach((e) => e.update());
    // remove dead enemies from the world
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy.isDead()) {
        enemy.sprite.destroy(false);
        return false;
      }
      return true;
    });
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
