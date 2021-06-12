import { TILE_SIZE, VELOCITY_EPSILON } from "./consts";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import KeyboardPlugin = Phaser.Input.Keyboard.KeyboardPlugin;

export class Player {
  public constructor(
    public sprite: SpriteWithDynamicBody,
    public kbp: KeyboardPlugin
  ) {
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setSize(TILE_SIZE, TILE_SIZE);
    this.sprite.setSize(TILE_SIZE, TILE_SIZE);
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

    /*
    this.kbp.on("keydown-LEFT", () => {
      this.sprite.body.setAccelerationX(-1800);
      //this.sprite.anims.play("left", true);
    });

    this.kbp.on("keydown-RIGHT", () => {
      this.sprite.body.setAccelerationX(1800);
    });
    */

    this.kbp.on("keydown-SPACE", () => {
      if (this.sprite.body.touching.down) {
        this.sprite.body.setVelocityY(-800);
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
      this.sprite.anims.play("player_still", true);
    } else {
      this.sprite.anims.play("player_move", true);
      this.sprite.setFlipX(this.sprite.body.velocity.x > 0);
    }

    const cursors = this.kbp.createCursorKeys();

    if (
      !(cursors.left.isDown && !cursors.right.isDown) &&
      !(!cursors.left.isDown && cursors.right.isDown)
    ) {
      this.sprite.body.setAccelerationX(0);
    }

    if (
      (this.sprite.body.touching.left && this.sprite.body.acceleration.x < 0) ||
      (this.sprite.body.touching.right && this.sprite.body.acceleration.x > 0)
    ) {
      console.log("touching");
      this.sprite.body.setVelocityX(0);
      this.sprite.body.setAccelerationX(0);
      return;
    }

    //console.log("got past");

    if (cursors.right.isDown) {
      this.sprite.body.setAccelerationX(1800);
    }

    if (cursors.left.isDown) {
      this.sprite.body.setAccelerationX(-1800);
    }

    /*
    if (!(cursors.right.isDown || cursors.left.isDown)) {
      this.sprite.body.setAccelerationX(0);
      this.sprite.anims.play("player_still", true);
    }
    if (cursors.left.isDown) {
      this.sprite.body.setAccelerationX(-1800);
      this.sprite.setFlipX(false);
      this.sprite.anims.play("player_move", true);
    }
    if (cursors.right.isDown) {
      this.sprite.body.setAccelerationX(1800);
      this.sprite.setFlipX(true);
      this.sprite.anims.play("player_move", true);
    }
    if (cursors.up.isDown || cursors.space.isDown) {
      if (this.sprite.body.touching.down) {
        this.sprite.body.setVelocityY(-500);
      }
    }
    */
  }
}
