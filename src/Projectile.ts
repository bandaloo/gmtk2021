import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
import Demo from "./game";
import { Player } from "./Player";

const BULLET_SPEED = 350;

/**
 * The projectile class handles things that shoot and shouldn't be coupled to the object that creates it
 *
 * Classes that extend projectile must destroy the sprite manaully
 */
export class Projectile {
  protected currentHealth: number;
  protected maxHealth: number;
  private dead: boolean;

  /**
   * create a projectile flying in the given dirction
   * @param sprite the sprite to render
   * @param renderInit the funciton that will add this sprite the required collider groups
   * @param direction the direction for this to travel (1 to go right, -1 to go left)
   */
  public constructor(
    public sprite: SpriteWithDynamicBody,
    private direction: integer,
    demo: Demo
  ) {
    sprite.setData("outerObject", this);
    sprite.setSize(50, 50);
    sprite.body.setSize(50, 50);
    sprite.body.setAllowGravity(false);
    demo.addProjectile(this);
  }

  /**
   * Logic to execute every game step.
   */
  public update(): void {
    if (this.sprite.body !== undefined) {
      this.sprite.body.setVelocity(BULLET_SPEED * this.direction, 0);
    }
  }

  public onCollide(other: GameObjectWithBody): void {
    const wrapper = other.getData("outerObject");
    if (wrapper !== undefined && wrapper instanceof Player) {
      console.log("hit player");
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
