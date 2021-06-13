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
    this.load.image("howTo1", "assets/how_to_play_1.png");
    this.load.image("howTo2", "assets/how_to_play_2.png");
  }

  create(): void {
    const instructions = this.add.image(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      "howTo1"
    );

    instructions.setScale(0.9, 0.9);

    const menu_text = this.add.text(0, 0, "< MENU", {
      fontSize: BACK_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    menu_text.setOrigin(0, 0);
    menu_text.x = 0;
    menu_text.y = 0;

    menu_text.on("pointerover", function (pointer) {
      if (pointer instanceof Pointer) {
        menu_text.setColor("#88b5b1");
      }
    });

    menu_text.on("pointerout", function (pointer) {
      if (pointer instanceof Pointer) {
        menu_text.setColor("#FFFFFF");
      }
    });

    menu_text.setInteractive().on("pointerdown", (pointer) => {
      if (pointer instanceof Pointer) {
        console.log("pointer:");
        console.log(pointer);
        this.scene.start("startScreen");
      }
    });

    const previous_arrow = this.add.text(0, 0, "< PREV", {
      fontSize: BACK_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    previous_arrow.setOrigin(0, 0);
    previous_arrow.x = 0;
    previous_arrow.y = GAME_HEIGHT - 50;

    previous_arrow.on("pointerover", function (pointer) {
      if (pointer instanceof Pointer) {
        previous_arrow.setColor("#88b5b1");
      }
    });

    previous_arrow.on("pointerout", function (pointer) {
      if (pointer instanceof Pointer) {
        previous_arrow.setColor("#FFFFFF");
      }
    });

    previous_arrow.setInteractive().on("pointerdown", (pointer) => {
      if (pointer instanceof Pointer) {
        instructions.setTexture("howTo1");
      }
    });

    const next_arrow = this.add.text(0, 0, "NEXT >", {
      fontSize: BACK_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    next_arrow.setOrigin(1, 0);
    next_arrow.x = GAME_WIDTH;
    next_arrow.y = GAME_HEIGHT - 50;

    next_arrow.on("pointerover", function (pointer) {
      if (pointer instanceof Pointer) {
        next_arrow.setColor("#88b5b1");
      }
    });

    next_arrow.on("pointerout", function (pointer) {
      if (pointer instanceof Pointer) {
        next_arrow.setColor("#FFFFFF");
      }
    });

    next_arrow.setInteractive().on("pointerdown", (pointer) => {
      if (pointer instanceof Pointer) {
        instructions.setTexture("howTo2");
      }
    });
  }
}
