import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
import { Player, PlayerAction } from "./Player";
import Vec2 = Phaser.Math.Vector2;

/**
 * The base enemy class contains logic common to all enemy types
 */
export abstract class Enemy {
  protected currentHealth: number;
  protected maxHealth: number;
  protected attackPower = 1;
  abstract playerStuff: {
    /**
     * This function is executed once when the enemy is absorbed by the player.
     * It can be used to set up cosmetic changes and other one-time setup
     * changes.
     */
    initialize: (player: Player) => void;
    /**
     * When the player absorbs a this enemy this action will replace the player's
     * primary attack action.
     */
    action: PlayerAction;
    /**
     * The number of times the player can use the action before this enemy is
     * used up and falls off.
     */
    charges: number;
    /**
     * The number of ticks after using the action before it can be used again.
     */
    cooldown: number;
  };

  protected constructor(public sprite: SpriteWithDynamicBody) {
    sprite.setData("outerObject", this);
  }

  public onOverlap(other: GameObjectWithBody): void {
    const wrapper = other.getData("outerObject");
    if (wrapper !== undefined && wrapper instanceof Player) {
      const playerPos = new Vec2(wrapper.sprite.x, wrapper.sprite.y);
      const myPos = new Vec2(this.sprite.x, this.sprite.y);
      // TODO handle zero vector
      const vec = playerPos.subtract(myPos).normalize().scale(400);
      wrapper.takeDamage(this.attackPower);

      //const v = this.sprite.body.velocity;
      other.body.velocity.set(vec.x, vec.y);
      this.sprite.body.velocity.set(-vec.x, -vec.y);
      //this.sprite.body.velocity.set(-v.x, -v.y);
    }
  }

  abstract update(): void;
  /** Called when this enemy gets absorbed by a player. */
  abstract onEaten(player: Player): void;
  /** Called when a player's grappling hook attaches to this enemy. */
  public onGrappled(): void {
    this.attackPower = 0;
    /* no op */
  }

  /**
   * This enemy takes the given amount of damage. Taking more than the current
   * amount of health will reduce current health to zero. Taking negative damage
   * has no effect. Any fractional amount of damage taken is floored.
   * @param amount the amount of damage to take.
   */
  public takeDamage(damage = 1): void {
    console.log(`Enemy taking ${damage} damage`);
    damage = Math.floor(damage);
    this.currentHealth = Math.max(this.currentHealth - damage, 0);
    console.log(`New enemy health: ${this.currentHealth}`);
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }
}
