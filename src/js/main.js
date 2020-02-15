'use strict';

//import "core-js";

import * as game_switcher from "./game_switcher.js";

import * as breaker from "../games/breaker.js";
import * as shape_shooter from "../games/shape_shooter/shape_shooter.js";
import * as eightbomb from "../games/EightBomb/eightbomb.js";
import * as spinetest from "../games/SpineTest/spinetest.js";
import * as chipmanrf from "../games/ChipManRF/chipmanrf.js";

function run() {
  let container = new game_switcher.GameContainer(document);

  container.set_size(640, 480);

  container.add_to_page();

  container.start_game(chipmanrf.config);
}

run();
