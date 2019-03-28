'use strict';

import * as game_switcher from "./game_switcher.js";

import * as breaker from "../games/breaker.js";
import * as shape_shooter from "../games/shape_shooter/shape_shooter.js";

function run() {
  let container = new game_switcher.GameContainer();

  container.set_size(640, 480);

  container.add_to_page(document);

  container.start_game(shape_shooter.config);
}

run();
