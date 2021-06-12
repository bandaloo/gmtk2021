import GameObject = Phaser.GameObjects.GameObject;
import { Scene } from "phaser";

/**
 * The base class all enemies extend.
 *
 * Possible states:
 *   - "dead": the enemy is dead.
 */
export abstract class Enemy extends GameObject {
  /**
   * @param scene the scene to which this enemy belongs
   * @param type a textual representation of this enemy, e.g. "bat"
   */
  protected constructor(scene: Scene, type: string) {
    super(scene, type);
  }

  private maxHealth = 3;
  private currentHealth = 3;

  private defaultOnUpdate(): void {
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
