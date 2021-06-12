import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Cursors = Phaser.Types.Input.Keyboard.CursorKeys;

export class Player {
  public constructor(public sprite: SpriteWithDynamicBody) {
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(1200, 0);
    this.sprite.body.setMaxVelocity(300, 10000);
    this.sprite.anims.create({
      key: "left",
      // frames: this.anims.generateFrameNumbers("circle", { start: 1, end: 1 }),
      frames: [{ key: "circle", frame: 0 }],
      frameRate: 10,
      // repeat: -1,
    });

    this.sprite.anims.create({
      key: "turn",
      frames: [{ key: "circle", frame: 1 }],
      frameRate: 20,
    });

    this.sprite.anims.create({
      key: "right",
      // frames: this.anims.generateFrameNumbers("circle", { start: 5, end: 8 }),
      frames: [{ key: "circle", frame: 2 }],
      frameRate: 10,
      // repeat: -1,
    });
  }

  public update(cursors: Cursors): void {
    if (!(cursors.right.isDown || cursors.left.isDown)) {
      this.sprite.body.setAccelerationX(0);
      this.sprite.anims.play("turn");
    }
    if (cursors.left.isDown) {
      this.sprite.body.setAccelerationX(-1800);
      this.sprite.anims.play("left", true);
    }
    if (cursors.right.isDown) {
      this.sprite.body.setAccelerationX(1800);
      this.sprite.anims.play("right", true);
    }
    if (cursors.up.isDown || cursors.space.isDown) {
      if (this.sprite.body.touching.down) {
        this.sprite.body.setVelocityY(-500);
      }
    }
  }
}
