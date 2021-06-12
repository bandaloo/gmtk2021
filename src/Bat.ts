import { Enemy } from "./Enemy";
import { Scene } from "phaser";

/**
 * A simple flying enemy.
 * Test comment
 */
export class Bat extends Enemy {
  /**
   * @param scene the scene to which this Bat belongs.
   */
  constructor(scene: Scene) {
    super(scene, "Bat");
  }

  public update(): void {
    super.update();
  }
}
