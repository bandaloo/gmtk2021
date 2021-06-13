import { GRAPPLE_OFFSET, GRAPPLE_SPEED } from "./consts";
import { Enemy } from "./Enemy";
import { grabSound } from "./game";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class Grapple {
  public armSprite: Phaser.GameObjects.Sprite;
  public baseSprite: Phaser.GameObjects.Sprite;
  private trackedEnemy: Enemy;
  constructor(
    public sprite: SpriteWithDynamicBody,
    public angle: integer,
    private player: Player,
    grappleGroup: Phaser.Physics.Arcade.Group
  ) {
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.setData("outerObject", this);
    this.sprite.setSize(120, 120);
    this.sprite.setAngle(angle);
    this.sprite.setSize(50, 50);
    this.sprite.body.setSize(50, 50);
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(0, 0);
    grappleGroup.add(sprite);

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
      GRAPPLE_SPEED * Math.cos(this.sprite.rotation),
      GRAPPLE_SPEED * Math.sin(this.sprite.rotation)
    );

    this.sprite.body.setAllowGravity(false);

    this.update();
  }

  public collide(entity: unknown): void {
    if (entity instanceof Player) {
      if (this.player.grapplePull) {
        if (this.trackedEnemy) {
          this.trackedEnemy.onEaten(this.player);
          this.trackedEnemy = undefined;
        }
        this.destroy();
      }
    } else if (entity instanceof Enemy) {
      if (this.trackedEnemy == undefined) {
        grabSound.play();
        this.sprite.setTexture("grapple_grabbing");
        this.sprite.setVelocity(0);
        this.player.grapplePull = true;
        entity.onGrappled();
        this.trackedEnemy = entity;
      }
    } else {
      this.sprite.setTexture("grapple_grabbing");
      this.sprite.setVelocity(0);
      this.player.grapplePull = true;
    }
  }

  public update(): void {
    if (this.trackedEnemy) {
      this.sprite.setPosition(
        this.trackedEnemy.sprite.x,
        this.trackedEnemy.sprite.y
      );
    }

    const playerCenterX =
      this.player.sprite.body.position.x + this.player.sprite.displayWidth / 4;
    const playerCenterY =
      this.player.sprite.body.position.y + this.player.sprite.displayHeight / 4;

    let span = new Phaser.Math.Vector2(
      this.sprite.x - playerCenterX,
      this.sprite.y - playerCenterY
    );

    this.sprite.setRotation(span.angle());
    this.armSprite.setRotation(span.angle());
    this.baseSprite.setRotation(span.angle());

    const grappleBaseX =
      playerCenterX + Math.cos(span.angle()) * GRAPPLE_OFFSET;
    const grappleBaseY =
      playerCenterY + Math.sin(span.angle()) * GRAPPLE_OFFSET;

    span = new Phaser.Math.Vector2(
      this.sprite.x - grappleBaseX,
      this.sprite.y - grappleBaseY
    );

    this.baseSprite.setPosition(grappleBaseX, grappleBaseY);

    this.armSprite.setPosition(
      (this.sprite.x + grappleBaseX) / 2,
      (this.sprite.y + grappleBaseY) / 2
    );

    const stretch = (span.length() - 50) / this.armSprite.width;
    this.armSprite.setScale(stretch, 1);
  }

  public destroy(): void {
    this.player.grapple = undefined;
    this.player.grapplePull = false;
    this.sprite.destroy();
    this.armSprite.destroy();
    this.baseSprite.destroy();
  }
}
