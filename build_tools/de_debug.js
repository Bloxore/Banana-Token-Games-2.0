var fs = require('fs');
var path = require('path');

let dest = process.argv[2];

if (!dest) {
  throw new Error('File path must be specified: de_debug.js path');
}

fs.readdir(dest, (err, files) => {
  if (err) {
    throw err;
  }

  for (file of files) {
    let match = file.match(/^\[\[DEBUG\]\]/)
    if (match) {
      let filename = file.substring(match.index + 9); // start of match + length of string [[DEBUG]]

      let fileContents = fs.readFileSync(path.join(dest, file), {
        encoding: 'utf-8'
      });

      let start = 0;
      let end = 0;
      fileContents = fileContents.split("\n");
      for (line in fileContents) {
        let text = fileContents[line];
        // Find the %% DEBUG %% and %% END DEBUG %% lines
        let startMatch = text.match(/%% DEBUG %%/);
        let endMatch = text.match(/%% END DEBUG %%/);

        if (startMatch) {
          start = parseInt(line);
        }

        if (endMatch) {
          end = parseInt(line);
          // Cut out the lines from start to end
          for (let i = start; i < (end + 1); i++) {
            fileContents[i] = '';
          }
        }
      }
      // Filter out lines with nothing on them
      fileContents = fileContents.filter(line => line.length > 0);

      // Rejoin the string
      fileContents = fileContents.join("\n");

      // Write the file to a non-debug name
      fs.writeFile(path.join(dest, filename), fileContents, () => {
        console.log("Debugged", file, "as", filename);
      });
    }
  }
})
