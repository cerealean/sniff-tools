const fs = require('fs/promises');
const UglifyJS = require("uglify-js");

async function minifyAndBuild() {
  try {
    const data = await fs.readFile('./dist/main.js', { encoding: 'utf8' });
    const result = UglifyJS.minify(data, {
      mangle: {
        toplevel: true,
        properties: {
          builtins: true
        }
      },
      compress: {
        passes: 3,
        negate_iife: false,
        toplevel: true
      }
    });
    if(result.warnings) {
      console.warn(result.warnings);
    }
    if(result.error) {
      console.error(result.error);
      return;
    }
    const minified = result.code;
    await Promise.all([
      fs.writeFile('./dist/output.min.js', minified).then(() => console.debug('Created minified output file')),
      fs.writeFile('./dist/bookmarklet.txt', `javascript:${minified}// Generated ${new Date().toString()}`).then(() => console.debug('Created bookmarklet file'))
    ]);
  } catch (err) {
    console.log(err);
  }
}
(async () => {
  await minifyAndBuild();
})();
