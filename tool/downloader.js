import fs from 'fs-extra';
import path from 'path';

import { webkit } from 'playwright';
import log4js from 'log4js';

log4js.configure({
  appenders: { file_logger: { type: 'file', filename: 'log/toolkit.log' }, console_log: { type: 'console' } },
  categories: { default: { appenders: ['file_logger', 'console_log'], level: 'all' } },
});

const logger = log4js.getLogger();

class BookController {
  root = '';
  pages = [''];

  constructor() {}

  setupFromJSON(json) {
    this.root = json.root;
    this.pages = json.pages.map((p) => p.url);
  }

  async loadCapter() {
    const browser = await webkit.launch();
    const page = await browser.newPage();
    await page.goto(this.root);
    await browser.close();
  }
}

class Main {
  async Exec() {
    try {
      const json = await fs.readJSON(path.join(process.cwd(), 'book', 'list.json1'));
      logger.debug('Load book success');
      const bookController = new BookController();
      bookController.setupFromJSON(json);
      bookController.loadCapter();
    } catch (error) {
      logger.error(`${error}`);
    }
  }
}

const main = new Main();
main.Exec();
