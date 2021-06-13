import { GameObjects } from "phaser";
import { ENTITY_SIZE, PLAYER_PROPERTY_NAME } from "./consts";
import { Projectile } from "./Projectile";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Demo from "./game";
import Vec2 = Phaser.Math.Vector2;

const MIN_PROXIMITY = 500;
const MAX_SPEED = 140;
export class Cannon extends Enemy {
  /**
   *  This tracks what way we need to move to get closer to the player
   * -1 for left, 1 for right
   */
  private direction: -1 | 1 = 1;

  private distanceToPlayer = 0;
  private timeBetweenShots = 200;
  private justRotate = false;
  private shotTimer = this.timeBetweenShots;
  private playerRef: GameObjects.GameObject;
  private canMove = true;

  constructor(sprite: SpriteWithDynamicBody, private demo: Demo) {
    super(sprite);
    this.currentHealth = 1;
    this.maxHealth = 1;
    sprite.setSize(ENTITY_SIZE, ENTITY_SIZE);
    sprite.body.setSize(ENTITY_SIZE, ENTITY_SIZE);
    sprite.body.setBounce(0, 0);
    sprite.body.setCollideWorldBounds(true);
    sprite.body.setDrag(10, 10);
    sprite.body.setMaxVelocity(350, Infinity);
    sprite.body.setAllowGravity(true);
    sprite.anims.create({
      key: "cannon_walk",
      frames: sprite.anims.generateFrameNumbers("cannon_walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 15,
      repeat: -1,
    });
    sprite.anims.create({
      key: "cannon_shoot",
      frames: sprite.anims.generateFrameNumbers("cannon_shoot", {
        start: 0,
        end: 11,
      }),
      frameRate: 15,
      repeat: 0,
    });
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.anims.play("cannon_walk", true);
  }

  public playerStuff = {
    initialize: this.playerInitialize,
    action: (player: Player): void => {
      // TODO shoot
      console.log(player);
    },
    charges: 3,
    cooldown: 30,
  };

  public update(): void {
    if (this.canMove) {
      this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
      // movement logic goes here
      this.updateDistanceToPlayer();
      if (this.distanceToPlayer >= MIN_PROXIMITY) {
        // if cannon is touching a wall AND too far from the player, just stop
        this.direction = -1;
        this.justRotate = false;
      } else if (this.distanceToPlayer <= -MIN_PROXIMITY) {
        this.direction = 1;
        this.justRotate = false;
      } else {
        this.direction = this.distanceToPlayer >= 0 ? -1 : 1;
        this.justRotate = true;
      }

      this.shotTimer--;
      if (this.shotTimer <= 0) {
        this.shoot();
        this.shotTimer = this.timeBetweenShots;
      }
      this.move();
    }
  }

  public shoot(): void {
    this.sprite.anims.play("cannon_shoot");
    // don't move while shooting
    this.canMove = false;
    this.sprite.once("animationcomplete", () => {
      // add or subtract the spawn point using the direction were headed
      const projectileSprite = this.sprite.scene.physics.add.sprite(
        this.sprite.body.x +
          (this.direction * this.sprite.body.width) / 2 +
          this.direction * 50,
        this.sprite.body.y + this.sprite.body.height / 2,
        "bullet"
      );
      projectileSprite.scaleX = 0.15;
      projectileSprite.scaleY = 0.15;
      if (this.direction == 1) {
        projectileSprite.toggleFlipX();
      }
      new Projectile(
        projectileSprite,
        new Vec2(350 * this.direction, 0),
        this.demo
      );
      this.canMove = true;
      this.sprite.anims.play("cannon_walk", true);
    });
  }

  public updateDistanceToPlayer(): void {
    if (this.playerRef === undefined) {
      this.playerRef = this.sprite.scene.children.getFirst(
        "name",
        PLAYER_PROPERTY_NAME
      );
    }
    if (this.playerRef !== undefined) {
      this.distanceToPlayer =
        this.sprite.body.position.x - this.playerRef.body.position.x;
    }
  }

  private move() {
    if (!this.justRotate) {
      this.sprite.body.setVelocity(
        MAX_SPEED * this.direction,
        this.sprite.body.velocity.y
      );
    } else {
      this.sprite.body.setVelocity(0, this.sprite.body.velocity.y);
      // flip the sprite at slow speeds to make sure that the cannon faces the right way
      if (this.direction == 1) {
        this.sprite.setFlipX(true);
      } else {
        this.sprite.setFlipX(false);
      }
    }
  }

  onEaten(player: Player): void {
    this.currentHealth = 0;
    player.absorb(this);
  }

  private playerInitialize(player: Player): void {
    // set up cosmetic cannon
    const s = player.sprite.scene.add.sprite(
      player.sprite.x,
      player.sprite.y,
      "blob_still_cannon"
    );
    s.setDepth(110);

    s.anims.create({
      key: "player_still_cannon",
      frames: s.anims.generateFrameNumbers("blob_still_cannon", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_move_cannon",
      frames: s.anims.generateFrameNumbers("blob_move_cannon", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_dropping_cannon",
      frames: s.anims.generateFrameNumbers("blob_dropping_cannon", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_egg_cannon",
      frames: s.anims.generateFrameNumbers("blob_egg_cannon", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_falling_cannon",
      frames: s.anims.generateFrameNumbers("blob_falling_cannon", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_rising_cannon",
      frames: s.anims.generateFrameNumbers("blob_rising_cannon", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    player.addCosmetic(s, {
      still: "player_still_cannon",
      move: "player_move_cannon",
      dropping: "player_dropping_cannon",
      egg: "player_egg_cannon",
      falling: "player_falling_cannon",
      rising: "player_rising_cannon",
    });
  }
}
