'use strict';

//import "core-js";

import * as breaker from "../games/breaker.js";
import * as shape_shooter from "../games/shape_shooter/shape_shooter.js";
import * as eightbomb from "../games/EightBomb/eightbomb.js";
import * as spinetest from "../games/SpineTest/spinetest.js";
import * as chipmanrf from "../games/ChipManRF/chipmanrf.js";
import * as splitarmy from "../games/SplitArmy/splitarmy.js";

function run() {
  let game = new Phaser.Game(chipmanrf.config);
}

run();
