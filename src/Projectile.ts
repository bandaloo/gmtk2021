import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
import Demo from "./game";
import { Player } from "./Player";
import Vec2 = Phaser.Math.Vector2;
import { Enemy } from "./Enemy";
import { PROJECTILE_MAX_LEN } from "./consts";

/**
 * The projectile class handles things that shoot and shouldn't be coupled to the object that creates it
 *
 * Classes that extend projectile must destroy the sprite manaully
 */
export class Projectile {
  protected currentHealth: number;
  protected maxHealth: number;
  private dead: boolean;
  public timer: 0;

  /**
   * create a projectile flying in the given dirction
   * @param sprite the sprite to render
   * @param velocity the bullet's velocity
   * @param demo a reference to the scene containing this projectile
   * @param friendly a friendly bullet will damage enemies but not the player
   */
  public constructor(
    public sprite: SpriteWithDynamicBody,
    private velocity: Vec2,
    demo: Demo,
    public friendly = false
  ) {
    sprite.setData("outerObject", this);
    sprite.setSize(50, 50);
    sprite.body.setSize(50, 50);
    sprite.body.setAllowGravity(false);
    sprite.body.setDrag(0, 0);
    sprite.body.setVelocity(this.velocity.x, this.velocity.y);
    demo.addProjectile(this);
    this.timer = 0;
  }

  /**
   * Logic to execute every game step.
   */
  public update(): void {
    console.log("update proj");
    if (this.timer > PROJECTILE_MAX_LEN) {
      this.dead = true;
      console.log("DESTROYED");
    }
    this.timer += 1;
  }

  public onCollide(other: GameObjectWithBody): void {
    const wrapper = other.getData("outerObject");
    if (!this.friendly && wrapper !== undefined && wrapper instanceof Player) {
      wrapper.takeDamage();
      const v = this.sprite.body.velocity;
      other.body.velocity.set(v.x, v.y);
      this.dead = true;
      this.sprite.destroy(false);
    } else if (
      this.friendly &&
      wrapper !== undefined &&
      wrapper instanceof Enemy
    ) {
      console.log("Collided with enemy");
      wrapper.takeDamage();
      const v = this.sprite.body.velocity;
      other.body.velocity.set(v.x, v.y);
      this.dead = true;
      this.sprite.destroy(false);
    }
  }

  public isDead(): boolean {
    return this.dead;
  }

  public kill(): void {
    this.dead = true;
    this.sprite.destroy(false);
  }
}
