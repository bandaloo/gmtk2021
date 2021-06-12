import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.GameObject;

/**
 * The base class all enemies extend.
 *
 * Possible states:
 *   - "dead": the enemy is dead.
 */
export class Enemy extends GameObject {
  /**
   * @param scene the scene to which this enemy belongs
   * @param type a textual representation of this enemy, e.g. "bat"
   */

  public constructor(scene: Scene, type: string) {
    super(scene, type);
    this.scene.physics.add.sprite(300, 300, "circle");
  }

  private maxHealth = 3;
  private currentHealth = 3;

  public update(): void {
    console.log("updat");
    this.body.velocity.x = 10;
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
