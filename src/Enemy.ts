import Sprite = Phaser.Physics.Arcade.Sprite;
import DynamicBody = Phaser.Physics.Arcade.Body;
import { Scene } from "phaser";

/**
 * The base class all enemies extend.
 *
 * Possible states:
 *   - "dead": the enemy is dead.
 */
export abstract class Enemy extends Sprite {
  private maxHealth = 3;
  private currentHealth = 3;
  public body: DynamicBody;

  /**
   * @param scene the scene to which this enemy belongs
   * @param type a textual representation of this enemy, e.g. "bat"
   */
  protected constructor(scene: Scene, x: number, y: number, type: string) {
    super(scene, x, y, type);
  }

  public update(): void {
    // check for out of bounds values
    if (this.currentHealth > this.maxHealth)
      this.currentHealth = this.maxHealth;
    // check for death
    if (this.currentHealth < 0) {
      this.state = "dead";
    }
  }

  public isDead(): boolean {
    return this.state === "dead";
  }
}
