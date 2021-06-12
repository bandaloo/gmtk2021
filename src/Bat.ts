import { Scene } from "phaser";
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
  }

  public update(): void {
    console.log("update");
    // movement logic goes here
    if (this.flapTimer <= 0) {
      this.flap();
      this.flapTimer = this.timeBetweenFlaps;
    }

    this.flapTimer--;
  }

  private flap() {
    console.log("flap");
    const acc = this.sprite.body.acceleration.add(
      new Vector2(400 * this.direction, -400)
    );
    this.sprite.body.setAcceleration(acc.x, acc.y);
    this.sprite.scene.time.delayedCall(500, () => {
      this.sprite.body.setAcceleration(0, 1);
    });
  }

  public onCollide(): void {
    console.log("Collided!");
    if (this.sprite.body.touching.right) {
      this.direction = -1;
    } else if (this.sprite.body.touching.left) {
      this.direction = 1;
    }
  }
}

export const createBat = (scene: Scene, x: number, y: number): Bat => {
  const swdb = scene.physics.add.sprite(x, y, "circle");
  swdb.body.setSize(300, 300);
  swdb.body.setBounce(0.5, 0.5);
  swdb.body.setCollideWorldBounds(true);
  swdb.body.setDrag(100, 40);
  swdb.body.setMaxVelocity(300, 200);
  swdb.body.setAllowGravity(false);
  const bat = new Bat(swdb);
  swdb.addToUpdateList();
  swdb.update = () => {
    console.log("asdf");
    bat.update();
  };
  swdb.body.onCollide = true;
  swdb.on("collide", () => {
    console.log("beef");
    bat.onCollide();
  });
  return bat;
};
