import { TILE_SIZE } from "./consts";
import { HeartDisplay } from "./HeartDisplay";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Cursors = Phaser.Types.Input.Keyboard.CursorKeys;

export class Player {
  private maxHealth = 3;
  private currentHealth = this.maxHealth;
  private heartDisplay: HeartDisplay;

  public constructor(public sprite: SpriteWithDynamicBody) {
    this.heartDisplay = new HeartDisplay(this.sprite.scene);
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);

    this.sprite.name = "player";
    this.sprite.setData("outerObject", this);
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
  }

  public update(cursors: Cursors): void {
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
  }

  public takeDamage(): void {
    this.currentHealth--;
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);
    if (this.currentHealth <= 0) {
      // TODO lose the game
    }
  }
}
