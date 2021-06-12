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
    this.sprite.setSize(120, 120);
    this.sprite.body.setSize(120, 120);
    this.sprite.body.setBounce(0.5, 0.5);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(150, 150);
    this.sprite.body.setMaxVelocity(300, 200);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.create({
      key: "bat_flying",
      frames: this.sprite.anims.generateFrameNumbers("bat_flying", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.sprite.anims.play("bat_flying", true);
  }

  public update(): void {
    this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
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
