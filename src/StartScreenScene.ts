import "phaser";
import Pointer = Phaser.Input.Pointer;
import { GAME_WIDTH, GAME_HEIGHT } from "./consts";

const TITLE_FONT_SIZE = 250;
const SUBTITLE_FONT_SIZE = 50;

export default class StartScreenScene extends Phaser.Scene {
  constructor() {
    super("startScreen");
  }

  initialize(): void {
    Phaser.Scene.call(this, { key: "StartScreen" });
  }

  create(): void {
    const title_text = this.add.text(0, 0, "SCHLORP", {
      fontSize: TITLE_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    title_text.setOrigin(0.5, 0.5);
    title_text.x = GAME_WIDTH / 2;
    title_text.y = GAME_HEIGHT / 2;

    const play_text = this.add.text(0, 0, "> CLICK HERE TO PLAY <", {
      fontSize: SUBTITLE_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    play_text.setOrigin(0.5, 0.5);
    play_text.x = GAME_WIDTH / 2;
    play_text.y = GAME_HEIGHT / 2 + 150;

    play_text.setInteractive().on("pointerdown", (pointer) => {
      if (pointer instanceof Pointer) {
        console.log("pointer:");
        console.log(pointer);
        this.scene.start("RandomLevel");
      }
    });

    play_text.on("pointerover", function () {
      play_text.setColor("#88b5b1");
    });

    play_text.on("pointerout", function () {
      play_text.setColor("#FFFFFF");
    });

    const help_text = this.add.text(0, 0, "> HOW TO PLAY <", {
      fontSize: SUBTITLE_FONT_SIZE + "px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
    help_text.setOrigin(0.5, 0.5);
    help_text.x = GAME_WIDTH / 2;
    help_text.y = GAME_HEIGHT / 2 + 300;

    help_text.setInteractive().on("pointerdown", (pointer) => {
      if (pointer instanceof Pointer) {
        console.log("pointer:");
        console.log(pointer);
        this.scene.start("howToPlay");
      }
    });

    help_text.on("pointerover", function () {
      help_text.setColor("#88b5b1");
    });

    help_text.on("pointerout", function () {
      help_text.setColor("#FFFFFF");
    });
  }
}
