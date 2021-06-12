import { Scene } from "phaser";
import { Enemy } from "./Enemy";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class Bat extends Enemy {
  constructor() {
    super();
    this.currentHealth = 1;
    this.maxHealth = 1;
  }

  public update(sprite: SpriteWithDynamicBody): void {
    // movement logic goes here
    console.log(sprite.x, sprite.y);
  }
}

export const createBat = (scene: Scene, x: number, y: number): Bat => {
  const swdb = scene.physics.add.sprite(x, y, "Bat");
  swdb.body.setSize(40, 40);
  const bat = new Bat();
  swdb.update = () => {
    bat.update(swdb);
  };
  return bat;
};
