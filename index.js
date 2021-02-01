import path from 'path';
import EPub from 'epub';

async function main() {
  const epub = new EPub(path.join(process.cwd(), 'book', 'book.epub'));

  epub.on('end', function () {
    epub.flow.forEach(function (chapter) {
      console.log(chapter.id);
    });
  });

  epub.parse();
}

main();
