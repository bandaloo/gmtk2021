import { Scene } from "phaser";
import { TILE_SIZE } from "./consts";

export class HeartDisplay {
  private hearts: Phaser.GameObjects.Image[];

  constructor(private scene: Scene, private maxMaxHealth: number) {
    this.hearts = new Array(this.maxMaxHealth);
    for (let i = 0; i < this.maxMaxHealth; ++i) {
      this.hearts[i] = this.scene.add.image(
        (i + 0.5) * TILE_SIZE,
        TILE_SIZE / 2,
        "heart_empty"
      );
    }
  }

  public redisplay(currentHealth: number, maxHealth: number): void {
    console.log(`${currentHealth}/${maxHealth}`);
    this.hearts.forEach((heart, i) => {
      heart.setVisible(i < maxHealth);
      if (i < maxHealth) {
        if (i < currentHealth) {
          heart.setTexture("heart_full");
        } else {
          heart.setTexture("heart_empty");
        }
      }
    });
  }
}
