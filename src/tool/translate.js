import fs from 'fs-extra';
import path from 'path';
import opencc from 'opencc';

class Translate {
  bookName = '';
  constructor(bookName) {
    this.bookName = bookName;
  }
  async Exec() {
    const converter = new opencc.OpenCC('s2tw.json');

    const sourcePath = path.join(process.cwd(), 'book', this.bookName, 'results');
    const targetPath = path.join(process.cwd(), 'book', this.bookName, 'zhTW');

    const fileList = await fs.readdir(sourcePath);
    const fileResult = await Promise.all(
      fileList.map(async (fileName) => {
        const filePath = path.join(sourcePath, fileName);
        const fileContent = await fs.readFile(filePath);
        console.log(fileName);
        return await converter.convertPromise(fileContent);
      })
    );

    await Promise.all(
      fileResult.map(async (content, index) => {
        const filePath = await converter.convertPromise(path.join(targetPath, fileList[index]));
        await fs.ensureFile(filePath);
        await fs.writeFile(filePath, content);
      })
    );

    console.log('Convert Over!');
  }
}

export default Translate;
