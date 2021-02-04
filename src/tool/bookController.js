import fs from 'fs-extra';
import path from 'path';

import { webkit } from 'playwright';
import { fillZero } from '../utils/fillZero.js';
import Translate from './translate.js';
import GenerateEPub from './generateEPub.js';
import Logger from '../utils/logger.js';

export class BookController {
  bookName = '';
  root = '';
  pages = [''];
  pageTitles = [''];
  end = false;
  content = [''];
  currentIndex = 0;

  /**
   * @type {import('log4js').Logger}
   */
  logger;

  constructor(config) {
    this.logger = Logger;
    this.bookName = config.bookName;
    this.root = config.root;
    this.pages = config.pages.map((p) => p.url);
    this.pageTitles = config.pages.map((p) => p.name);
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
      if (this.browser) {
        await this.browser.close();
      }

      await new Translate(this.bookName).Exec();
      await new GenerateEPub(this.bookName).Exec();
    }
  }

  load(index) {
    const _index = index || 0;
    this.loadCapter(_index);
  }

  /**
   * @param  {Number} index
   */
  async loadCapter(index) {
    await this.init();
    this.currentIndex = index;
    if (this.pages.length === index) {
      await this.detectEnd(true);
      return;
    }
    const page = await this.browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    const filePath = path.join(
      process.cwd(),
      'book',
      this.bookName,
      'results',
      `${fillZero(index + 1, this.pageTitles.length)}_${this.pageTitles[index]}.txt`
    );
    await fs.ensureFile(filePath);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.on('error', (error) => this.logger.error);
    page.on('error', async (error) => {
      this.logger.error(error);
      await fileStream.end();
      await fileStream.close();
      await page.close();
      await this.loadCapter(index);
    });
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
    this.logger.info(title);
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
}
