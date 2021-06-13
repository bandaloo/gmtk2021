import { GameObjects } from "phaser";
import { ENTITY_SIZE, PLAYER_PROPERTY_NAME } from "./consts";
import { Projectile } from "./Projectile";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;

const MIN_PROXIMITY = 500;
const MAX_SPEED = 140;
export class Cannon extends Enemy {
  /**
   *  This tracks what way we need to move to get closer to the player
   * -1 for left, 1 for right
   */
  private direction: -1 | 1 = 1;

  private distanceToPlayer = 0;
  private timeBetweenShots = 200;
  private justRotate = false;
  private shotTimer = this.timeBetweenShots;
  private playerRef: GameObjects.GameObject;

  constructor(
    sprite: SpriteWithDynamicBody,
    private renderInit: (p: Projectile) => void
  ) {
    super(sprite);
    sprite.setSize(ENTITY_SIZE, ENTITY_SIZE);
    sprite.body.setSize(ENTITY_SIZE, ENTITY_SIZE);
    sprite.body.setBounce(0, 0);
    sprite.body.setCollideWorldBounds(true);
    sprite.body.setDrag(10, 10);
    sprite.body.setMaxVelocity(350, Infinity);
    sprite.body.setAllowGravity(true);
    sprite.anims.create({
      key: "cannon_walk",
      frames: sprite.anims.generateFrameNumbers("cannon_walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 15,
      repeat: -1,
    });
    this.currentHealth = 1;
    this.maxHealth = 1;
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.anims.play("cannon_walk", true);
  }

  public playerStuff = {
    action: (player: Player): void => {
      // TODO shoot
      console.log(player);
    },
    charges: 1,
  };

  public update(): void {
    this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
    // movement logic goes here
    this.updateDistanceToPlayer();
    if (this.distanceToPlayer >= MIN_PROXIMITY) {
      // if cannon is touching a wall AND too far from the player, just stop
      console.log("moving backward");
      this.direction = -1;
      this.justRotate = false;
    } else if (this.distanceToPlayer <= -MIN_PROXIMITY) {
      console.log("moving foward");
      this.direction = 1;
      this.justRotate = false;
    } else {
      console.log("stopped");
      this.direction = this.distanceToPlayer >= 0 ? -1 : 1;
      this.justRotate = true;
    }

    this.shotTimer--;
    if (this.shotTimer <= 0) {
      this.shoot();
      this.shotTimer = this.timeBetweenShots;
    }
    this.move();
  }

  public shoot(): void {
    // add or subtract the spawn point using the direction were headed
    const projectileSprite = this.sprite.scene.physics.add.sprite(
      this.sprite.body.x +
        (this.direction * this.sprite.body.width) / 2 +
        this.direction * 50,
      this.sprite.body.y + this.sprite.body.height / 2,
      "bullet"
    );
    new Projectile(projectileSprite, this.renderInit, this.direction);
  }

  public updateDistanceToPlayer(): void {
    if (this.playerRef === undefined) {
      this.playerRef = this.sprite.scene.children.getFirst(
        "name",
        PLAYER_PROPERTY_NAME
      );
    }
    if (this.playerRef !== undefined) {
      this.distanceToPlayer =
        this.sprite.body.position.x - this.playerRef.body.position.x;
    }
  }

  public onCollide(other: GameObjectWithBody): void {
    const player = other.getData("outerObject");
    if (player !== undefined && player instanceof Player) {
      console.log("hit player");
    }
  }

  private move() {
    if (!this.justRotate) {
      this.sprite.body.setVelocity(
        MAX_SPEED * this.direction,
        this.sprite.body.velocity.y
      );
    } else {
      this.sprite.body.setVelocity(0, this.sprite.body.velocity.y);
      // flip the sprite at slow speeds to make sure that the cannon faces the right way
      if (this.direction == 1) {
        this.sprite.setFlipX(true);
      } else {
        this.sprite.setFlipX(false);
      }
    }
  }
}
