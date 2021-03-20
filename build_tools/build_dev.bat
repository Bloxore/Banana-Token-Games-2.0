Set _game=%~1
node build_tools\de_debug.js "lib"
node build_tools\generate_game_launcher.js %_game%
npx webpack --entry ./src/js/%_game%.js --output ./dist/app.js --mode production
