import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
import { Player } from "./Player";

/**
 * The base enemy class contains logic common to all enemy types
 */
export abstract class Enemy {
  protected currentHealth: number;
  protected maxHealth: number;
  abstract playerStuff: {
    /**
     * When the player absorbs a this enemy this action will replace the player's
     * primary attack action.
     */
    action: (player: Player) => void;
    /**
     * The number of times the player can use the action before this enemy is
     * used up and falls off.
     */
    charges: number;
  };

  protected constructor(public sprite: SpriteWithDynamicBody) {
    sprite.setData("outerObject", this);
  }

  public onCollide(other: GameObjectWithBody): void {
    const wrapper = other.getData("outerObject");
    if (wrapper !== undefined && wrapper instanceof Player) {
      wrapper.takeDamage();
      const v = this.sprite.body.velocity;
      other.body.velocity.set(v.x, v.y);
      this.sprite.body.velocity.set(-v.x, -v.y);
    }
  }

  abstract update(): void;

  /**
   * This enemy takes the given amount of damage. Taking more than the current
   * amount of health will reduce current health to zero. Taking negative damage
   * has no effect. Any fractional amount of damage taken is floored.
   * @param amount the amount of damage to take.
   */
  public takeDamage(amount: number): void {
    amount = Math.floor(amount);
    if (amount <= 1) return;
    this.currentHealth = Math.max(this.currentHealth - amount, 0);
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }
}
