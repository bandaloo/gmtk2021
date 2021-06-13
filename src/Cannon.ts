import { GameObjects, Scene } from "phaser";
import { PLAYER_PROPERTY_NAME } from "./consts";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;

const MIN_PROXIMITY = 500;
const MAX_SPEED = 140;
export class Cannon extends Enemy {
  /** -1 for left, 1 for right*/
  private direction: -1 | 1 = 1;

  private distanceToPlayer = 0;
  private timeBetweenShots = 120;
  private justRotate = false;
  private shotTimer = this.timeBetweenShots;
  private playerRef: GameObjects.GameObject;

  constructor(sprite: SpriteWithDynamicBody) {
    super(sprite);
    this.currentHealth = 1;
    this.maxHealth = 1;
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.anims.play("cannon_walk", true);
  }

  public update(): void {
    this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
    // movement logic goes here
    this.updateDistanceToPlayer();
    console.log("direction: " + this.direction);
    console.log(this.distanceToPlayer + " distance to player");
    if (this.distanceToPlayer >= MIN_PROXIMITY) {
      // if cannon is touching a wall AND too far from the player, just stop
      console.log("moving backward");
      this.direction = -1;
      this.justRotate = false;
    } else if (this.distanceToPlayer <= -MIN_PROXIMITY) {
      console.log("moving foward");
      this.direction = 1;
      this.justRotate = false;
    } else {
      console.log("stopped");
      this.direction = this.distanceToPlayer >= 0 ? 1 : -1;
      this.justRotate = true;
    }

    this.shotTimer--;
    if (this.shotTimer <= 0) {
      this.shoot();
      this.shotTimer = this.timeBetweenShots;
    }
    this.move();
  }

  public shoot(): void {
    // don't shoot if there's another bullet on the screen

    // add or subtract the spawn point using the direction were headed
    this.sprite.scene.physics.add.sprite(
      this.sprite.body.position.x +
        (this.direction * this.sprite.displayWidth) / 2 +
        this.direction * 50,
      this.sprite.body.position.y,
      "bullet"
    );

    // use the update method to move the bullet across the screen

    this.sprite.scene.registry;
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

  public onCollide(other: GameObjectWithBody): void {
    const player = other.getData("outerObject");
    if (player !== undefined && player instanceof Player) {
      console.log("hit player");
    }
  }

  private move() {
    if (!this.justRotate) {
      this.sprite.body.setVelocity(
        MAX_SPEED * this.direction,
        this.sprite.body.velocity.y
      );
    } else {
      this.sprite.body.setVelocity(
        0.0001 * this.direction,
        this.sprite.body.velocity.y
      );
      // flip the sprite at slow speeds to make sure that the cannon faces the right way
      if (this.sprite.body.velocity.x > 0) {
        this.sprite.setFlipX(false);
      } else {
        this.sprite.setFlipX(true);
      }
    }
  }
}

export const createCannon = (scene: Scene, x: number, y: number): Cannon => {
  const swdb = scene.physics.add.sprite(x, y, "circle");
  swdb.setSize(120, 120);
  swdb.body.setSize(120, 120);
  swdb.body.setBounce(0, 0);
  swdb.body.setCollideWorldBounds(true);
  swdb.body.setDrag(10, 10);
  swdb.body.setMaxVelocity(350, Infinity);
  swdb.body.setAllowGravity(true);
  swdb.anims.create({
    key: "cannon_walk",
    frames: swdb.anims.generateFrameNumbers("cannon_walk", {
      start: 0,
      end: 7,
    }),
    frameRate: 15,
    repeat: -1,
  });
  const cannon = new Cannon(swdb);
  return cannon;
};
