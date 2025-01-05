import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class ExportPdfService {
  exportAsPDF(
    multiPage: boolean,
    orientation: 'portrait' | 'landscape',
    elementDivIdToPrintSingle: string,
    arrayDivsPrintMultiPages: string[],
    nameOfFileToSave: string,
    skipSave?: boolean,
    print?: boolean
  ): Promise<string | jspdf> {
    return new Promise((resolve, reject) => {
      var imgWidth = orientation === 'portrait' ? 210 : 297; // milimiters
      var pageHeight = orientation === 'portrait' ? 297 : 210;
      var doc = new jspdf(orientation, 'mm', 'a4', true); // portrait, milimiters
      var timeToWait = 100; // ms to wait before rendering next div on the next page (give time for the previous to finish) - start at 100ms to let DOM finish

      if (multiPage) {
        let dataArrayDivs: HTMLElement[] = arrayDivsPrintMultiPages.map(
          (divId) => {
            return document.getElementById(divId)!;
          }
        );

        if (dataArrayDivs?.length > 0) {
          let promisesAllPages = new Array();

          dataArrayDivs.forEach(
            (divElement: HTMLElement | null, index: number) => {
              if (index > 0) {
                timeToWait = timeToWait + 300; // add ms to wait for the last page to render before starting a new one
              }
              promisesAllPages.push(
                addHtmlToPdf(divElement, timeToWait, index > 0, index)
              );

              if (index === dataArrayDivs.length - 1) {
                Promise.all(promisesAllPages)
                  .then(() => {
                    if (!skipSave) {
                      doc.save(
                        nameOfFileToSave + '_' + new Date().getTime() + '.pdf'
                      );
                    }

                    if (print) {
                      doc.autoPrint();
                    }
                    resolve(doc);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
            }
          );
        } else {
          reject('Nenhum DIV encontrado para múltiplas páginas.');
        }
      } else {
        let data = document.getElementById(elementDivIdToPrintSingle);
        addHtmlToPdf(data, 0, false)
          .then(() => {
            if (!skipSave) {
              doc.save(
                nameOfFileToSave +
                  '_' +
                  new Date().getTime().toString().substring(5) +
                  '.pdf'
              );
            }

            if (print) {
              doc.autoPrint();
            }
            resolve(doc);
          })
          .catch((error) => {
            reject(error);
          });
      }

      function addHtmlToPdf(
        dataDivToPrint: HTMLElement | null,
        timeToWait2: number,
        addPage?: boolean,
        newPageIndex?: number
      ): Promise<any> {
        return new Promise((resolveFnc, rejectFnc) => {
          if (dataDivToPrint) {
            setTimeout(() => {
              html2canvas(dataDivToPrint, {
                scale: 3,
                backgroundColor: '#ffffff',
              })
                .then((canvas) => {
                  if (addPage) {
                    doc.addPage('a4', orientation);
                  }
                  let contentImageData = canvas.toDataURL('image/jpeg', 0.8); // quality setting
                  // creates and adds portions of image to each page if needed
                  // this function scrolls through the image and adds each part to a different page
                  var imgHeight = (canvas.height * imgWidth) / canvas.width;
                  var heightLeft = imgHeight;
                  var position = 0;
                  doc.addImage(
                    contentImageData,
                    'JPEG',
                    0,
                    position,
                    imgWidth,
                    imgHeight,
                    'image_' + (newPageIndex ?? '0'),
                    'FAST'
                  );
                  heightLeft = heightLeft - pageHeight;

                  // // make any necessary pages to fit the content
                  while (heightLeft >= 0) {
                    position = heightLeft - pageHeight;
                    doc.addPage('a4', orientation);
                    // each image needs a different alias or else it will get confused and reuse the last image !
                    doc.addImage(
                      contentImageData,
                      'JPEG',
                      0,
                      position,
                      imgWidth,
                      imgHeight,
                      'image_' + (newPageIndex ?? 0 + position).toString(),
                      'FAST'
                    );
                    heightLeft = heightLeft - pageHeight;
                  }

                  resolveFnc(doc); // return the document
                })
                .catch((error) => {
                  console.error(error);
                  rejectFnc(error);
                });
            }, timeToWait2);
          } else {
            console.error(
              'Não foi encontrado o elemento com o ID ' +
                elementDivIdToPrintSingle
            );
            rejectFnc(
              'Não foi encontrado o elemento com o ID  ' +
                elementDivIdToPrintSingle
            );
          }
        });
      }
    });
  }
}
