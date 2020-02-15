/* Testing Module */

'use strict';

import * as game_switcher from "./game_switcher.js"

function test_game_container_starts_with_no_game() {
  let container = new game_switcher.GameContainer();

  assert(container.game == null)
}

function test_game_container_starts_with_canvas() {
  let container = new game_switcher.GameContainer();
  assert(container._canvas != null)
}

function test_game_container_can_be_resized() {
  let container = new game_switcher.GameContainer();

  container.set_size(640, 480);
  assert(container.get_size().width == 640 && container.get_size().height == 480);
}

function assert(result) {
  if (!result)
    console.error("Assertion Error Raised!");
}

// Run all unittests
function run_tests() {
  test_game_container_starts_with_no_game();
  test_game_container_starts_with_canvas();
  test_game_container_can_be_resized();
}

run_tests();
