import { Enemy } from "./Enemy";
import { Scene } from "phaser";

/**
 * A simple flying enemy.
 */
export class Bat extends Enemy {
  /**
   * @param scene the scene to which this Bat belongs.
   */
  constructor(scene: Scene) {
    super(scene, "Bat");
  }
}
