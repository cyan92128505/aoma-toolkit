import fs from 'fs-extra';
import path from 'path';

class Clearer {
  bookName = '';
  constructor(bookName) {
    this.bookName = bookName;
  }
  async LoadResult() {
    let text = await fs.readFile(path.join(process.cwd(), 'book', this.bookName, 'result.txt'));
    text = text.replace(/第[一二三四五六七八九十]{1,3}折/g, (value) => `=====\n${value}`);
    await fs.writeFile(path.join(process.cwd(), 'book', 'front.txt'), text);
    console.log('Clear OK');
  }
}

export default Clearer;
