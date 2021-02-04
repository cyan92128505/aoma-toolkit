import url from 'url';
import { webkit } from 'playwright';
import opencc from 'opencc';

import { BookController } from './bookController.js';
import logger from '../utils/logger.js';

export class ListGetter {
  constructor() {}

  async init() {
    if (this.browser == null) {
      this.browser = await webkit.launch();
    }
  }

  async detectEnd(needEnd) {
    if (needEnd) {
      this.end = !!needEnd;
    }
    if (this.end) {
      await this.browser.close();
    }
  }

  /**
   *
   * @param {String} targetURL
   */
  async load(targetURL) {
    const converter = new opencc.OpenCC('s2tw.json');

    await this.init();

    const rootURL = new url.URL(targetURL);

    const page = await this.browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(targetURL);

    const title = await page.$('.introduce h1');

    const bookName = await converter.convertPromise(!!title ? await title.innerText() : `book_${new Date().valueOf()}`);
    const config = { root: `${rootURL.protocol}//${rootURL.host}`, bookName, pages: [] };
    const capterList = await page.$$('.ml_list ul li a');

    await Promise.all(
      capterList.map(async (c) => {
        const capterName = await converter.convertPromise(await c.innerText());
        const capterURL = await c.getAttribute('href');
        logger.info(`${capterName} ${capterURL}`);
        config.pages.push({
          url: capterURL,
          name: capterName,
        });
      })
    );

    const bookController = new BookController(config);
    await bookController.load();

    await page.close();
    await this.detectEnd(true);
  }
}
