import { readFile, writeFile } from 'fs/promises';
import { minify } from "uglify-js";

async function minifyAndBuild() {
  try {
    const data = await readFile('./dist/main.js', { encoding: 'utf8' });
    const result = minify(data, {
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
      writeFile('./dist/output.min.js', minified).then(() => console.debug('Created minified output file')),
      writeFile('./dist/bookmarklet.txt', `javascript:${minified}// Generated ${new Date().toString()}`).then(() => console.debug('Created bookmarklet file'))
    ]);
  } catch (err) {
    console.log(err);
  }
}
(async () => {
  await minifyAndBuild();
})();
