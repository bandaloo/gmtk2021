import { ENTITY_SIZE, VELOCITY_EPSILON } from "./consts";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import KeyboardPlugin = Phaser.Input.Keyboard.KeyboardPlugin;

export class Player {
  public constructor(
    public sprite: SpriteWithDynamicBody,
    public kbp: KeyboardPlugin
  ) {
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setSize(ENTITY_SIZE, ENTITY_SIZE);
    this.sprite.setSize(ENTITY_SIZE, ENTITY_SIZE);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(1200, 0);
    this.sprite.body.setMaxVelocity(300, 10000);
    this.sprite.anims.create({
      key: "player_move",
      frames: this.sprite.anims.generateFrameNumbers("blob_move", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.sprite.anims.create({
      key: "player_still",
      frames: this.sprite.anims.generateFrameNumbers("blob_still", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.kbp.on("keydown-SPACE", () => {
      if (this.sprite.body.touching.down) {
        this.sprite.body.setVelocityY(-900);
      }
    });

    this.kbp.on("keyup-SPACE", () => {
      if (this.sprite.body.velocity.y < 0) {
        this.sprite.body.setVelocityY(this.sprite.body.velocity.y / 2);
      }
    });
  }

  public update(): void {
    if (Math.abs(this.sprite.body.velocity.x) > VELOCITY_EPSILON) {
      this.sprite.anims.play("player_move", true);
      this.sprite.setFlipX(this.sprite.body.velocity.x > 0);
    } else {
      this.sprite.anims.play("player_still", true);
    }

    const cursors = this.kbp.createCursorKeys();

    if (cursors.right.isDown) {
      this.sprite.body.setAccelerationX(1800);
    } else if (cursors.left.isDown) {
      this.sprite.body.setAccelerationX(-1800);
    } else {
      this.sprite.body.setAccelerationX(0);
    }

    // TODO this doesn't seem to work
    if (
      (this.sprite.body.touching.left && this.sprite.body.acceleration.x < 0) ||
      (this.sprite.body.touching.right && this.sprite.body.acceleration.x > 0)
    ) {
      this.sprite.body.setVelocityX(0);
      this.sprite.body.setAccelerationX(0);
      return;
    }
  }
}
