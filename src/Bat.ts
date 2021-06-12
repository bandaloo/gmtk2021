import { Scene } from "phaser";
import { ENTITY_SIZE, VELOCITY_EPSILON } from "./consts";
import { Enemy } from "./Enemy";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Vector2 = Phaser.Math.Vector2;

export class Bat extends Enemy {
  private timeBetweenFlaps = 120;
  private flapTimer = this.timeBetweenFlaps;
  /** -1 for left, 1 for right */
  private direction: -1 | 1 = 1;

  constructor(sprite: SpriteWithDynamicBody) {
    super(sprite);
    this.currentHealth = 1;
    this.maxHealth = 1;
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.anims.play("bat_flying", true);
  }

  public update(): void {
    if (Math.abs(this.sprite.body.velocity.x) > VELOCITY_EPSILON) {
      this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
    }
    // movement logic goes here
    if (this.flapTimer <= 0) {
      this.flap();
      this.flapTimer = this.timeBetweenFlaps;
    }
    if (this.sprite.body.touching.right) {
      this.direction = -1;
    } else if (this.sprite.body.touching.left) {
      this.direction = 1;
    }

    this.flapTimer--;
  }

  private flap() {
    const acc = this.sprite.body.acceleration.add(
      new Vector2(400 * this.direction, -400)
    );
    this.sprite.body.setAcceleration(acc.x, acc.y);
    this.sprite.scene.time.delayedCall(500, () => {
      this.sprite.body.setAcceleration(0, 3);
    });
  }
}

export const createBat = (scene: Scene, x: number, y: number): Bat => {
  const swdb = scene.physics.add.sprite(x, y, "bat_flying");
  swdb.setSize(ENTITY_SIZE, ENTITY_SIZE);
  swdb.body.setSize(ENTITY_SIZE, ENTITY_SIZE);
  swdb.body.setBounce(0.5, 0.5);
  swdb.body.setCollideWorldBounds(true);
  swdb.body.setDrag(150, 150);
  swdb.body.setMaxVelocity(300, 200);
  swdb.body.setAllowGravity(false);
  swdb.anims.create({
    key: "bat_flying",
    frames: swdb.anims.generateFrameNumbers("bat_flying", { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });
  const bat = new Bat(swdb);
  return bat;
};
