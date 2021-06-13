import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class Grapple {
  public armSprite: Phaser.GameObjects.Sprite;
  public baseSprite: Phaser.GameObjects.Sprite;
  constructor(
    public sprite: SpriteWithDynamicBody,
    public angle: integer,
    private player: Player,
    private platforms: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.setSize(120, 120);
    this.sprite.setAngle(angle);
    this.sprite.setSize(50, 50);
    this.sprite.body.setSize(50, 50);
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(0, 0);

    // arm logic
    this.armSprite = this.sprite.scene.add.sprite(
      this.sprite.body.position.x,
      this.sprite.body.position.y,
      "grapple_arm"
    );

    // base logic
    this.baseSprite = this.sprite.scene.add.sprite(
      this.sprite.body.position.x,
      this.sprite.body.position.y,
      "grapple_base"
    );
    // this.baseSprite.setScale(0.5, 0.5);

    this.sprite.setVelocity(
      1000 * Math.cos(this.sprite.rotation),
      1000 * Math.sin(this.sprite.rotation)
    );

    this.sprite.body.setAllowGravity(false);

    // Wait until the grapple hits a platform
    this.sprite.scene.physics.add.overlap(
      this.sprite,
      this.platforms,
      (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
        grapple.setVelocity(0);
        this.player.grapplePull = true;
        this.player.sprite.body.setMaxVelocity(1000, 1000);

        // Wait until player catches up to grapple, destroy it then
        this.sprite.scene.physics.add.overlap(
          this.sprite,
          this.player.sprite,
          () => {
            this.player.grapplePull = false;
            // this.player.grapplePoint = undefined;
            this.destroy();
            this.player.sprite.body.setMaxVelocity(300, 10000);
          },
          null,
          this
        );
      },
      null,
      this
    );
    console.log(this.sprite.displayHeight);
  }

  public update(): void {
    console.log("a");
    const playerCenterX =
      this.player.sprite.body.position.x + this.player.sprite.displayWidth / 4;
    const playerCenterY =
      this.player.sprite.body.position.y + this.player.sprite.displayHeight / 4;

    this.baseSprite.setPosition(playerCenterX, playerCenterY);

    this.armSprite.setPosition(
      (this.sprite.x + playerCenterX) / 2,
      (this.sprite.y + playerCenterY) / 2
    );

    const span = new Phaser.Math.Vector2(
      this.sprite.x - playerCenterX,
      this.sprite.y - playerCenterY
    );
    this.armSprite.setRotation(span.angle());
    this.baseSprite.setRotation(span.angle());

    const stretch = span.length() / this.armSprite.width;
    this.armSprite.setScale(stretch, 1);
  }

  public destroy(): void {
    this.player.grapple = undefined;
    this.sprite.destroy();
    this.armSprite.destroy();
    this.baseSprite.destroy();
  }
}
