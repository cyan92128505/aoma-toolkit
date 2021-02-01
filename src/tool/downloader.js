import fs from 'fs-extra';
import path from 'path';

import { webkit } from 'playwright';
import log4js from 'log4js';

log4js.configure({
  appenders: { console_log: { type: 'console' } },
  categories: { default: { appenders: ['console_log'], level: 'all' } },
});

const logger = log4js.getLogger();

class BookController {
  root = '';
  pages = [''];
  pageTitles = [''];
  end = false;
  content = [''];
  currentIndex = 0;

  constructor() {}

  setupFromJSON(json) {
    this.root = json.root;
    this.pages = json.pages.map((p) => p.url);
    this.pageTitles = json.pages.map((p) => p.name);
  }

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
   * @param  {Number} index
   */
  async loadCapter(index) {
    this.currentIndex = index;
    if (this.pages.length === index) {
      await this.detectEnd(true);
      return;
    }
    await this.init();
    const page = await this.browser.newPage();
    const filePath = path.join(process.cwd(), 'book', 'results', `${this.pageTitles[index]}.txt`);
    await fs.ensureFile(filePath);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.on('error', (error) => logger.error);
    await page.goto(`${this.root}${this.pages[index]}`);
    await this.loadNext(page, fileStream);
    await fileStream.end();
    await fileStream.close();
    await page.close();
    const nextIndex = (index += 1);
    await this.loadCapter(nextIndex);
  }

  /**
   *
   * @param {import('playwright').Page} page
   * @param {import('fs-extra').WriteStream} fileStream
   * @return {string}
   */
  async loadNext(page, fileStream) {
    const title = await page.innerText('.nr_title > h3');
    logger.info(title);
    if (this.detectCapterStartFromTitle(title)) {
      fileStream.write(`${this.pageTitles[this.currentIndex]}\n\n`);
    }

    const actions = await page.$$('.nr_page');
    if (actions.length > 0) {
      const btnActions = actions[0];
      const btnList = await btnActions.$$('a');
      if (btnList.length > 0) {
        const lastAction = btnList[btnList.length - 1];

        const pList = (await page.$('#articlecontent')).$$('p');

        /**
         * @type {string[]}
         */
        const contents = [];

        await Promise.all(
          (await pList).map(async (c) => {
            const text = await c.innerText();
            if (!/www\.vcxsw\.cc/g.test(text)) {
              contents.push(text);
            }
            return text;
          })
        );

        fileStream.write(contents.join('\n'));

        if (this.detectCapterEndFromTitle(title)) {
          fileStream.write(`\n\n`);
          await page.goto(`${this.root}${await lastAction.getAttribute('href')}`);
          return await this.loadNext(page, fileStream);
        } else {
          return '';
        }
      }
    }

    return '';
  }

  /**
   *
   * @param {string} title
   * @return {boolean}
   */
  detectCapterEndFromTitle(title) {
    const _title = title.replace(/[^\d\/]/g, '');
    const tCharList = _title.split('/');
    return tCharList.length == 0 ? false : tCharList[0] != tCharList[1];
  }

  /**
   *
   * @param {string} title
   * @return {boolean}
   */
  detectCapterStartFromTitle(title) {
    const _title = title.replace(/[^\d\/]/g, '');
    const tCharList = _title.split('/');
    return tCharList.length == 0 ? false : tCharList[0] === '1';
  }

  fillZero(index, length) {
    return `${(10 ^ `${length}`.length) + index}`.substring(1);
  }
}

export class Downloader {
  async Exec() {
    try {
      const json = await fs.readJSON(path.join(process.cwd(), 'book', 'list.json'));
      logger.debug('Load book success');
      const bookController = new BookController();
      bookController.setupFromJSON(json);
      bookController.loadCapter(293);
    } catch (error) {
      logger.error(`${error}`);
    }
  }
}
