var fs = require('fs');
var path = require('path');

let gameName;

// Get list of game directory
fs.readdir("src/games", (err, files) => {
  if (err) {
    throw err;
  }

  // Assign game name based on argument
  if (process.argv[2]) {
    gameName = process.argv[2];
  } else {
    gameName = files[0];
    console.log("No argument passed for game name.", gameName, "chosen by default.")
  }

  importString = "import * as game from '../games/" + gameName + "/" + gameName + ".js';";

  // Write the finished file to the src
  fs.writeFile(
    'src/js/' + gameName + '.js',
`'use strict';

` + importString + `

function run() {
  let game_instance = new Phaser.Game(game.config);
}

run();`,
    () => {console.log("File created and ready to be compiled.")}
  )
})
