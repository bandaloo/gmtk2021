// import { VELOCITY_EPSILON } from "./consts";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
// import Vector2 = Phaser.Math.Vector2;

export class Grapple {
  constructor(public sprite: SpriteWithDynamicBody, public angle: integer) {
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.setSize(120, 120);
    this.sprite.setAngle(angle);
    this.sprite.body.setSize(50, 50);
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(0, 0);
    // this.sprite.body.setMaxVelocity(300, 10000);
    this.sprite.body.setAllowGravity(false);

    // Wait until the grapple hits a platform
    this.physics.add.overlap(
      this.grapplePoint,
      this.platforms,
      (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
        grapple.setVelocity(0);
        this.player.setData("grapplePull", true);
        this.player.body.setMaxVelocity(1000, 1000);

        // Wait until player catches up to grapple, destroy it then
        this.physics.add.overlap(
          this.grapplePoint,
          this.player,
          (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
            this.player.setData("grappleOut", false);
            this.player.setData("grapplePull", false);
            // this.player.grapplePoint = undefined;
            grapple.destroy();
            this.player.body.setMaxVelocity(300, 10000);
          },
          null,
          this
        );
      },
      null,
      this
    );
  }

  public update(): void {
    console.log("a");
  }

  private flap() {
    console.log("a");
  }
}
