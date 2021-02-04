import geturls from 'get-urls';

import logger from './utils/logger.js';
import { ListGetter } from './tool/listGetter.js';

(async function Main() {
  let rootUrl = '';
  for (const argv of process.argv) {
    if (!/--.+/.test(argv)) {
      continue;
    }

    rootUrl = /--url.+/.test(argv) ? argv.split('=')[1] : rootUrl;
  }

  if (rootUrl.length == 0 || geturls(rootUrl).size != 1) {
    logger.error(`WRONG URL!!`);
    return;
  }

  new ListGetter().load(rootUrl);
})();
