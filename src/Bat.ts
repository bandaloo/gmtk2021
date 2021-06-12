import { Scene } from "phaser";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export const addBat = (
  scene: Scene,
  x: number,
  y: number
): SpriteWithDynamicBody => {
  const bat = scene.physics.add.sprite(x, y, "Bat");
  bat.body.setSize(40, 40);
  return bat;
};
