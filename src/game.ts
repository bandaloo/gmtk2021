import "phaser";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import { Projectile } from "./Projectile";
import { Enemy } from "./Enemy";
import { GAME_HEIGHT, GAME_WIDTH, SPRITE_SIZE, TILE_SIZE } from "./consts";
import { addObjects, padRoom, randomizeRoom, splitRoom } from "./gen";
import { rooms } from "./rooms";
import { Player } from "./Player";
import { Grapple } from "./Grapple";
import StartScreenScene from "./StartScreenScene";
import HowToScene from "./HowToScreenScene";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default class RandomLevel extends Phaser.Scene {
  public player: Player;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  public enemies: Enemy[];
  private projectiles: Projectile[];
  private platforms: StaticGroup;
  private pointerDown = false;
  private pickups;
  public grappleGroup;
  public playerGroup;
  public shouldReset;

  // Incraments each restart
  private levelNumber = 0;

  constructor() {
    super("RandomLevel");
  }

  init(data: unknown): void {
    console.log("init scene");
    console.log(data);
    this.levelNumber += 1;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
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
    this.load.image("grapple_grabbing", "assets/Grapple_Grabbing.png");
    this.load.image("oldcircle", "assets/blank circle.png");
    this.load.image("bullet", "assets/Bullet.png");
    this.load.image("fruit", "assets/fruit.png");
    this.load.spritesheet("circle", "assets/circle tileset.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet("portal", "assets/portal.png", {
      frameWidth: 320,
      frameHeight: 320,
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
    this.load.spritesheet("cannon_walk", "assets/cannon_walk.png", {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet("cannon_shoot", "assets/cannon_shoot.png", {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  /**
   * inits colliders for projectiles. Sets dead to true when it collides with the platform
   */
  projectileRenderInit(scene: RandomLevel): (projectile: Projectile) => void {
    return (projectile: Projectile) => {
      scene.projectiles.push(projectile);
      scene.physics.add.collider(scene.platforms, projectile.sprite, (obj1) => {
        if (obj1.getData("outerObject") instanceof Projectile) {
          obj1.getData("outerObject").kill();
        }
      });

      scene.physics.add.collider(
        projectile.sprite,
        scene.playerGroup,
        (obj1, obj2) => {
          if (obj1.getData("outerObject") instanceof Projectile) {
            obj1.getData("outerObject").onCollide(obj2);
          }
        }
      );
    };
  }

  private generateWorld() {
    addObjects(
      padRoom(
        randomizeRoom(
          splitRoom(rooms[Math.floor(rooms.length * Math.random())]),
          0.5,
          0.5
        )
      ),
      this.platforms,
      this.pickups,
      this
    );
  }

  create(): void {
    this.shouldReset = false;
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");
    console.warn("CREATING GAME #" + this.levelNumber);

    // Create groups before level gen
    this.platforms = this.physics.add.staticGroup();
    this.pickups = this.physics.add.staticGroup();
    this.grappleGroup = this.physics.add.group();
    this.playerGroup = this.physics.add.group();

    this.generateWorld();

    const grappleCollideCallback = (
      obj1: SpriteWithDynamicBody,
      obj2: SpriteWithDynamicBody
    ) => {
      const object = obj1.getData("outerObject");
      const object2 = obj2.getData("outerObject");
      if (object instanceof Grapple) {
        object.collide(object2);
      } else if (object2 instanceof Grapple) {
        object2.collide(object);
      }
    };

    // Add grapple collision sensors
    this.physics.add.overlap(
      this.grappleGroup,
      this.platforms,
      grappleCollideCallback
    );
    this.physics.add.overlap(
      this.grappleGroup,
      this.playerGroup,
      grappleCollideCallback
    );
    this.enemies.forEach((e) => {
      this.physics.add.overlap(
        this.grappleGroup,
        e.sprite,
        grappleCollideCallback
      );
    });

    this.physics.add.collider(this.playerGroup, this.platforms);

    this.physics.add.overlap(this.playerGroup, this.pickups, (obj1, obj2) => {
      const player = obj1.getData("outerObject");
      if (player instanceof Player) {
        if (obj2.name === "fruit") {
          player.eatFruit();
        }
        obj2.destroy();
      }
    });

    this.enemies.forEach((e) => {
      this.physics.add.overlap(e.sprite, this.playerGroup, (obj1, obj2) => {
        const enemy = obj1.getData("outerObject");
        if (enemy instanceof Enemy) {
          enemy.onOverlap(obj2);
        }
      });
    });
    this.enemies.forEach((e) => {
      this.physics.add.collider(e.sprite, this.platforms);
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
    this.projectiles.forEach((p) => p.update());
    this.enemies.forEach((e) => e.update());

    // clear dead projectiles
    this.projectiles = this.projectiles.filter((p) => !p.isDead());
    // remove dead enemies from the world
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy.isDead()) {
        enemy.sprite.destroy(false);
        return false;
      }
      return true;
    });

    if (this.shouldReset) {
      this.scene.restart({});
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#222222",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: [StartScreenScene, RandomLevel, HowToScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 800 },
    },
  },
};

new Phaser.Game(config);
