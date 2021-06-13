import { TILE_SIZE } from "./consts";
import RandomLevel from "./game";
import SpriteWithStaticBody = Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

/**
 * Exit portal after a level is beat
 */
export class Exit {
  constructor(public sprite: SpriteWithStaticBody) {
    sprite.setData("outerObject", this);
    sprite.body.setSize(TILE_SIZE, TILE_SIZE);
    sprite.setSize(TILE_SIZE, TILE_SIZE);
    // this.disable();
    this.sprite.anims.create({
      key: "portal_boil",
      frames: this.sprite.anims.generateFrameNumbers("portal", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.sprite.anims.play("portal_boil", true);

    this.sprite.scene.physics.add.overlap(
      (this.sprite.scene as RandomLevel).playerGroup,
      this.sprite,
      () => ((this.sprite.scene as RandomLevel).shouldReset = true)
    );
  }

  update(): void {
    if ((this.sprite.scene as RandomLevel).enemies.length == 0) {
      console.log("level finished!");
    }
  }

  enable(): void {
    this.sprite.setVisible(true);
  }

  disable(): void {
    this.sprite.setVisible(false);
  }
}
