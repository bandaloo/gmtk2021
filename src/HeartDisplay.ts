import { Scene } from "phaser";
import { TILE_SIZE } from "./consts";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;

export class HeartDisplay {
  private hearts: StaticGroup;

  constructor(private scene: Scene) {
    this.hearts = this.scene.physics.add.staticGroup();
  }

  public redisplay(currentHealth: number, maxHealth: number): void {
    this.hearts.clear(true, true);
    for (let i = 1; i <= maxHealth; ++i) {
      if (i <= currentHealth) {
        this.hearts.create(i * TILE_SIZE, TILE_SIZE / 2, "heart_full");
      } else {
        this.hearts.create(i * TILE_SIZE, TILE_SIZE / 2, "heart_empty");
      }
    }
  }
}
