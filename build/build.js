const fs = require('fs/promises');
const jsmin = require('jsmin').jsmin;

async function minifyAndBuild() {
  try {
    const data = await fs.readFile('./dist/output.js', { encoding: 'utf8' });
    const minified = jsmin(data, 3);
    Promise.all([
        fs.writeFile('./dist/output.min.js', minified).then(() => console.debug('Created minified output file')),
        fs.writeFile('./dist/bookmarklet.txt', 'javascript: ' + minified).then(() => console.debug('Created bookmarklet file'))
    ]);
  } catch (err) {
    console.log(err);
  }
}
minifyAndBuild();
