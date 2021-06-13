import { VELOCITY_EPSILON } from "./consts";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Vector2 = Phaser.Math.Vector2;

export class Bat extends Enemy {
  private timeBetweenFlaps = 120;
  private flapTimer = this.timeBetweenFlaps;
  private timeBetweenSwoops = 500;
  private swoopTimer = this.timeBetweenSwoops;
  /** -1 for left, 1 for right */
  private direction: -1 | 1 = 1;
  private swooping = false;

  public playerStuff = {
    action: (player: Player): void => {
      // TODO flap
      console.log(player);
    },
    charges: 3,
  };

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
    this.sprite.body.setMaxVelocity(300, 10000);
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
    this.sprite.anims.create({
      key: "bat_swooping",
      frames: this.sprite.anims.generateFrameNumbers("bat_swooping", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.sprite.anims.play("bat_flying", true);
  }

  public update(): void {
    if (Math.abs(this.sprite.body.velocity.x) >= VELOCITY_EPSILON) {
      this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
    }
    if (this.swooping) {
      this.sprite.body.setAcceleration(this.sprite.body.acceleration.x, 2200);
    }

    // see if we should flap
    if (!this.swooping && this.flapTimer <= 0) {
      this.flap();
      this.flapTimer = this.timeBetweenFlaps;
    }
    // see if we can swoop at the player
    if (!this.swooping && this.swoopTimer <= 0) {
      const player = this.sprite.scene.children.getFirst("name", "player");
      const dx = this.sprite.body.position.x - player.body.position.x;
      if (Math.abs(dx) < 200) {
        // swoop
        this.sprite.anims.play("bat_swooping", true);
        this.sprite.body.setVelocity(0, 0);
        this.sprite.body.setAcceleration(dx / 20, 2200);
        this.swooping = true;
      }
    }

    // bounce off of walls
    if (this.sprite.body.touching.right) {
      this.direction = -1;
    } else if (this.sprite.body.touching.left) {
      this.direction = 1;
    }
    if (this.sprite.body.touching.down && this.swooping) {
      this.swooping = false;
      this.sprite.anims.play("bat_flying", true);
      this.swoopTimer = this.timeBetweenSwoops;
      this.sprite.body.setAcceleration(0, 10);
    }

    this.flapTimer--;
    this.swoopTimer--;
  }

  private flap() {
    const acc = this.sprite.body.acceleration.add(
      new Vector2(400 * this.direction, -300)
    );
    this.sprite.body.setAcceleration(acc.x, acc.y);
    this.sprite.scene.time.delayedCall(500, () => {
      this.sprite.body.setAcceleration(0, 3);
    });
  }
}
