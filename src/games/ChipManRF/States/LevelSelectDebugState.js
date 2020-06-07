export class LevelSelectDebugState extends Phaser.Scene {
  constructor() {
    super({key: "LevelSelectDebugState"});
  }

  /* ===== BLUE-PRINT FUNCTIONS ===== */

  preload() {
    this.load.setPath("assets/games/ChipManRF/");
    this.load.json("levelList", "levelData/levelList.json");
  }

  create() {
    let levelList = this.cache.json.get("levelList");

    let list = new List(this);

    for (let i = 0; i < levelList.length; i++) {
      list.newListItem(levelList[i]);
    }

    this.input.keyboard.addKey("DOWN").on("down", () => {
      list.nextItem();
    })

    this.input.keyboard.addKey("UP").on("down", () => {
      list.lastItem();
    })

    let enterKey = this.input.keyboard.addKey("ENTER").once("down", () => {
      // Switch to the correct scene
      let levelKey = list.getSelectedItem().getLevelKey();

      this.scene.stop();

      this.scene.start("GameState", {
        levelKey: levelKey,
        previousState: "LevelSelectDebugState"
      });
    })
  }
}

/* Custom Classes */
class List extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);
    // Index in below array
    this.currentItem;
    this.items = [];
  }

  newListItem(levelKey) {
    let item = new ListItem(this.scene, levelKey);
    this.add(item);

    if (this.items.length > 0) {
      let previousItem = this.items[this.items.length - 1]
      item.setItemPosition(0, previousItem.y + previousItem.getItemDimensions().height);
    }

    this.items.push(item);
    if (this.currentItem == undefined) {
      this.currentItem = this.items.length - 1;
      this.items[this.currentItem].setItemDimensions(undefined, undefined, 0xffff00);
    }
  }

  nextItem() {
    if (this.currentItem != undefined && this.currentItem < this.items.length - 1) {
      this.items[this.currentItem].setItemDimensions(undefined, undefined, 0xffffff);
      this.currentItem++;
      this.items[this.currentItem].setItemDimensions(undefined, undefined, 0xffff00);
    }
  }

  lastItem() {
    if (this.currentItem != undefined  && this.currentItem > 0) {
      this.items[this.currentItem].setItemDimensions(undefined, undefined, 0xffffff);
      this.currentItem--;
      this.items[this.currentItem].setItemDimensions(undefined, undefined, 0xffff00);
    }
  }

  getSelectedItem() {
    return this.items[this.currentItem];
  }
}

class ListItem extends Phaser.GameObjects.Graphics {
  constructor(scene, levelKey, width = 400, height = 20, color = 0xffffff, fontSize = 12) {
    super(scene);
    if (!levelKey) {
      throw "You must specify a level key when defining a list item."
    }
    this._levelKey = levelKey;
    this._width = width;
    this._height = height;
    this._color = color;
    this._fontSize = fontSize;

    // Create the basic list item
    this.fillStyle(this._color);
    this.fillRect(0, 0, this._width, this._height);

    // Add itself to the scene
    scene.add.existing(this);
    // Create some text to go on top of the list item
    this._text = scene.add.bitmapText(0, 0, "mainFont", this._levelKey, this._fontSize);
    this._text.y = this._height / 2 - this._text.height / 2;
  }

  setItemPosition(x, y) {
    this.x = x;
    this.y = y;
    this._text.x = x;
    this._text.y = y + this._height / 2 - this._text.height / 2;
  }

  setItemLevelKey(levelKey) {
    this._levelKey = levelKey;
    this._text.text = levelKey;
  }

  setItemDimensions(width, height, color) {
    if (width) {
        this._width = width;
    }
    if (height) {
        this._height = height;
    }
    if (color) {
      this._color = color;
    }
    this.clear();
    this.fillStyle(this._color);
    this.fillRect(0, 0, this._width, this._height);
  }

  getItemDimensions() {
    return {
      width: this._width,
      height: this._height
    }
  }

  getLevelKey() {
    return this._levelKey;
  }

  destroy(fromScene) {
    this._text.destroy();
    Phaser.GameObjects.Graphics.prototype.destroy.call(this, fromScene);
  }
}
