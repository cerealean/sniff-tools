const fs = require('fs/promises');
const jsmin = require('jsmin').jsmin;

async function minifyAndBuild() {
  try {
    const data = await fs.readFile('./dist/output.js', { encoding: 'utf8' });
    const minified = jsmin(data);
    Promise.all([
        fs.writeFile('./dist/output.min.js', minified),
        fs.writeFile('./dist/bookmarklet.txt', 'javascript: ' + minified)
    ]);
  } catch (err) {
    console.log(err);
  }
}
minifyAndBuild();
