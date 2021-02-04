import fs from 'fs-extra';
import path from 'path';
import opencc from 'opencc';
import Epub from 'epub-gen';
import _ from 'lodash';

class GenerateEPub {
  bookName = '';
  constructor(bookName) {
    this.bookName = bookName;
  }

  async Exec() {
    const sourcePath = path.join(process.cwd(), 'book', this.bookName, 'zhTW');
    const fileList = await fs.readdir(sourcePath);
    const fileContents = await Promise.all(
      fileList.map(async (filePath) => {
        const contentList = `${await fs.readFile(path.join(sourcePath, filePath))}`.split('\n');
        return {
          title: contentList[0],
          data: `<p>${contentList.slice(2).join('<br/>')}</p>`,
        };
      })
    );

    const option = {
      title: this.bookName, // *Required, title of the book.
      author: 'Aoma Shinku', // *Required, name of the author.
      publisher: 'AJ-HOME & Co.', // optional
      content: fileContents,
    };

    new Epub(option, path.join(process.cwd(), 'book', this.bookName, 'book_zhtw.epub'));
  }
}

export default GenerateEPub;
