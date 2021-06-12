import { Scene } from "phaser";
import { PLAYER_PROPERTY_NAME } from "./consts";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
//import Vector2 = Phaser.Math.Vector2;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;

export class Cannon extends Enemy {
  /** -1 for left, 1 for right */
  private direction: -1 | 1 = 1;

  private timeBetweenShots = 120;
  private shotTimer = this.timeBetweenShots;

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
    if (this.sprite.body.touching.right) {
      this.direction = -1;
    } else if (this.sprite.body.touching.left) {
      this.direction = 1;
    } else {
      this.rotateToPlayer();
    }

    this.shotTimer--;
    if (this.shotTimer <= 0) {
      this.shoot();
      this.shotTimer = this.timeBetweenShots;
    }
    this.move();
  }

  public shoot(): void {
    console.log("shooting");
  }

  public rotateToPlayer(): void {
    const player = this.sprite.scene.children.getFirst(
      "name",
      PLAYER_PROPERTY_NAME
    );
    if (player instanceof Player) {
      const dx = this.sprite.body.position.x - player.body.position.x;
      if (dx <= 0) {
        this.direction = 1;
      } else {
        this.direction = -1;
      }
    }
  }

  public onCollide(other: GameObjectWithBody): void {
    const player = other.getData("outerObject");
    if (player !== undefined && player instanceof Player) {
      console.log("Collided with player!");
      console.log(player);
    } else if (other.name === "platform") {
      this.direction *= -1;
    }
  }

  private move() {
    this.sprite.body.setVelocity(
      400 * this.direction,
      this.sprite.body.velocity.y
    );
  }
}

export const createCannon = (scene: Scene, x: number, y: number): Cannon => {
  const swdb = scene.physics.add.sprite(x, y, "circle");
  swdb.setSize(120, 120);
  swdb.body.setSize(120, 120);
  swdb.body.setBounce(0.1, 0.1);
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
