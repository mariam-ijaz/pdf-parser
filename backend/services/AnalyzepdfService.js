import PDFParser from 'pdf2json';
import fs from 'fs/promises';


export async function analyzePDF(filePath, originalFileName) {
  /**
 * 
 * This function uses the `pdf2json` library to parse the PDF file, extract its content,
 * and perform an analysis. It detects page numbers, question numbers, and other metadata
 * from the PDF, providing a detailed summary.
 * 
 * @method analyzePDF
 * @param {string} filePath - The path to the PDF file that is to be analyzed.
 * @param {string} originalFileName - The original name of the uploaded PDF file.
 * 
 * @returns {Promise<Object>} Returns a promise that resolves with the analysis results, including:
 *   - fileName: The name of the PDF file.
 *   - totalPages: The total number of pages in the PDF.
 *   - printedPageSequence: An array of page numbers detected in the PDF.
 *   - pageSummary: A detailed summary of each page, including printed page numbers and question ranges.
 * 
 * @throws {Error} If an error occurs during parsing or file reading, the promise is rejected with an error message.
 */
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on('pdfParser_dataError', (err) =>
      reject(new Error(err.parserError))
    );

    parser.on('pdfParser_dataReady', (pdfContent) => {
      const analysis = extractPdfData(pdfContent, originalFileName);

      // Remove the file after processing
      fs.unlink(filePath).catch(console.error);

      resolve(analysis);
    });

    parser.loadPDF(filePath);
  });
}

function extractPdfData(pdfContent, fileName) {
  const numPages = pdfContent.Pages.length;
  const pageNumbersDetected = [];
  const pageDetails = [];
  const pageHeight = 800;
  const pageMargin = 75;
  const pageNumPosition = identifyPageNumberLocation(
    pdfContent.Pages,
    pageHeight,
    pageMargin
  );

  for (let i = 0; i < numPages; i++) {
    const page = pdfContent.Pages[i];

    const printedPageNum = getPageNumberAtLocation(
      page,
      pageNumPosition,
      pageMargin
    );

    pageNumbersDetected.push(printedPageNum);

    const questionNumbers = findQuestionNumbers(page);

    let range = null;
    if (questionNumbers.length > 0) {
      const first = questionNumbers[0];
      const last = questionNumbers[questionNumbers.length - 1];
      range = first === last ? `${first}` : `${first}-${last}`;
    }

    pageDetails.push({
      printedPage: printedPageNum,
      range,
      questionStarts: questionNumbers,
    });
  }

  return {
    fileName,
    totalPages: numPages,
    printedPageSequence: pageNumbersDetected,
    pageSummary: pageDetails,
  };
}


function decodeTextSafe(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function isValidPageNumber(text) {
  if (!text) return false;
  const s = text.trim();

  if (/[a-zA-Z]/.test(s) && !/^page\s*\d+$/i.test(s)) return false;
  if (s.length > 15) return false;
  if (/^\d+$/.test(s)) return true;
  if (/^page\s*\d+$/i.test(s)) return true;
  if (/^\d+\s*\/\s*\d+$/.test(s)) return true;
  if (/^\(\d+\)$/.test(s)) return true;
  if (/^-\s*\d+\s*-$/.test(s)) return true;

  return false;
}

function getAllTextFromPage(page) {
  if (!page || !Array.isArray(page.Texts)) return [];
  return page.Texts.map((t) => ({
    x: t.x || t.X || 0,
    y: t.y || t.Y || 0,
    text: decodeTextSafe((t.R && t.R[0] && t.R[0].T) || ''),
  }));
}

// 🔢 Updated defaults (800 & 75)
function identifyPageNumberLocation(
  pages,
  pageHeight = 800,
  margin = 75
) {
  const candidates = [];

  for (const page of pages) {
    const texts = getAllTextFromPage(page);

    for (const t of texts) {
      if (isValidPageNumber(t.text)) {
        candidates.push({ x: t.x, y: t.y, text: t.text });
        break;
      }
    }
  }

  if (!candidates.length) return null;

  const avg = candidates.reduce(
    (acc, cur) => ({
      x: acc.x + cur.x,
      y: acc.y + cur.y,
    }),
    { x: 0, y: 0 }
  );

  avg.x /= candidates.length;
  avg.y /= candidates.length;

  const vertical = avg.y > pageHeight / 2 ? 'bottom' : 'top';

  const xs = candidates.map((c) => c.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const range = maxX - minX || 1;

  const relative = (avg.x - minX) / range;

  let horizontal = 'center';
  if (relative < 0.33) horizontal = 'left';
  else if (relative > 0.66) horizontal = 'right';

  return { vertical, horizontal, x: avg.x, y: avg.y };
}


function getPageNumberAtLocation(page, pageNumPos, margin = 75) {
  if (!pageNumPos) return null;

  const texts = getAllTextFromPage(page);
  const candidates = texts.filter((t) =>
    isValidPageNumber(t.text)
  );

  if (candidates.length) {
    let closest = null;
    let closestDist = Infinity;

    for (const c of candidates) {
      const dx = (c.x || 0) - (pageNumPos.x || 0);
      const dy = (c.y || 0) - (pageNumPos.y || 0);
      const dist = Math.hypot(dx, dy);

      if (dist < closestDist) {
        closestDist = dist;
        closest = c;
      }
    }

    if (closest) {
      const s = closest.text.trim();

      const m =
        s.match(/^(?:page\s*)?(\d+)/i) ||
        s.match(/^(\d+)\s*\//) ||
        s.match(/^\((\d+)\)$/) ||
        s.match(/^-\s*(\d+)\s*-$/);

      if (m) {
        const num = parseInt(m[1], 10);
        if (num > 0 && num < 10000) return num;
      }

      if (/^\d+$/.test(s)) {
        const num = parseInt(s, 10);
        if (num > 0 && num < 10000) return num;
      }
    }
  }

  const tolerance = 30;

  const nearby = texts.filter((t) => {
    if (!t || typeof t.y !== 'number' || typeof t.x !== 'number')
      return false;

    const vertCond =
      (pageNumPos.vertical === 'bottom' && t.y > margin) ||
      (pageNumPos.vertical === 'top' && t.y < margin + 100) ||
      pageNumPos.vertical === 'center';

    if (!vertCond) return false;

    if (
      pageNumPos.horizontal === 'left' &&
      t.x > pageNumPos.x + tolerance
    )
      return false;

    if (
      pageNumPos.horizontal === 'right' &&
      t.x < pageNumPos.x - tolerance
    )
      return false;

    return true;
  });

  for (const c of nearby) {
    const s = c.text || '';
    if (!isValidPageNumber(s)) continue;

    const m =
      s.match(/^(?:page\s*)?(\d+)/i) ||
      s.match(/^(\d+)\s*\//) ||
      s.match(/^\((\d+)\)$/) ||
      s.match(/^-\s*(\d+)\s*-$/);

    if (m) {
      const num = parseInt(m[1], 10);
      if (num > 0 && num < 10000) return num;
    }
  }

  return null;
}

function findQuestionNumbers(page) {
  const texts = getAllTextFromPage(page).map((t) =>
    t.text.trim()
  );

  const questionNums = [];

  for (const t of texts) {
    let match = null;

    match = t.match(/^Q\.?\s*(\d{1,3})\b/i);
    if (match) {
      questionNums.push(parseInt(match[1], 10));
      continue;
    }

    match = t.match(/^Question\s+(\d{1,3})\b/i);
    if (match) {
      questionNums.push(parseInt(match[1], 10));
      continue;
    }

    match = t.match(/^Q\s*\((\d{1,3})\)/i);
    if (match) {
      questionNums.push(parseInt(match[1], 10));
      continue;
    }

    match = t.match(/^\((\d{1,3})\)/);
    if (match) {
      questionNums.push(parseInt(match[1], 10));
      continue;
    }
  }

  return Array.from(new Set(questionNums));
}