import fs from 'fs-extra';
import path from 'path';

class Clearer {
  async LoadResult() {
    let text = await fs.readFile(path.join(process.cwd(), 'book', 'result.txt'));
    text = text.replace(/第[一二三四五六七八九十]{1,3}折/g, (value) => `=====\n${value}`);
    await fs.writeFile(path.join(process.cwd(), 'book', 'front.txt'), text);
    console.log('Clear OK');
  }
}

try {
  new Clearer().LoadResult();
} catch (error) {
  console.log(error);
}
