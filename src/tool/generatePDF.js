import fs from 'fs-extra';
import path from 'path';
import PDFDocument from 'pdfkit';

class GeneratePDF {
  bookName = '';
  constructor(bookName) {
    this.bookName = bookName;
  }
  async Exec() {
    const storeStream = fs.createWriteStream(path.join(process.cwd(), 'book', this.bookName, 'book.pdf'), {
      encoding: 'utf-8',
    });
    const refStream = fs.createReadStream(path.join(process.cwd(), 'book', this.bookName, 'book.txt'), {
      encoding: 'utf-8',
    });
    const pdfDoc = new PDFDocument();
    pdfDoc.registerFont(
      'HiraginoMinchoPro-W3',
      path.join(process.cwd(), 'assets', 'fonts', 'HiraginoMinchoPro-W3.ttf')
    );
    pdfDoc.info['Title'] = 'Book';
    pdfDoc.info['Author'] = 'Aoma Shinku';
    pdfDoc.pipe(storeStream).on('finish', async () => {
      console.log('convert over!');
      await storeStream.end();
      await storeStream.close();
      await refStream.close();
    });

    refStream.on('error', (err) => console.log);
    refStream.on('data', async (chunk) => {
      await pdfDoc.font('HiraginoMinchoPro-W3').text(chunk, { align: 'justify' });
    });
    refStream.on('end', async () => {
      await pdfDoc.end();
    });
  }
}

export default GeneratePDF;
