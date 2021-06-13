import "phaser";
import Pointer = Phaser.Input.Pointer;
import { GAME_WIDTH, GAME_HEIGHT } from "./consts";

const BACK_FONT_SIZE = 50;

export default class HowToScene extends Phaser.Scene {
  constructor() {
    super("howToPlay");
  }

  initialize(): void {
    Phaser.Scene.call(this, { key: "howToPlay" });
  }

  preload(): void {
    this.load.image("howToScreen", "assets/how_to_play_base.png");
  }

  create(): void {
    const image = this.add.image(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      "howToScreen"
    );

    console.log("image is: ");
    console.log(image);

    const back_text = this.add.text(0, 0, "< BACK", {
      fontSize: BACK_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    back_text.setOrigin(0, 0);
    back_text.x = 0;
    back_text.y = 0;

    back_text.on("pointerover", function (pointer) {
      if (pointer instanceof Pointer) {
        back_text.setColor("#88b5b1");
      }
    });

    back_text.on("pointerout", function (pointer) {
      if (pointer instanceof Pointer) {
        back_text.setColor("#FFFFFF");
      }
    });

    back_text.setInteractive().on("pointerdown", (pointer) => {
      if (pointer instanceof Pointer) {
        console.log("pointer:");
        console.log(pointer);
        this.scene.start("startScreen");
      }
    });
  }
}
