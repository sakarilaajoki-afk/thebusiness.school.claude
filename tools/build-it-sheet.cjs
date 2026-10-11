// Build the printable school IT sheet from the public HTML version.
// NODE_PATH must include the Codex bundled playwright package when run locally.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const source = process.argv[2] || 'https://thebusiness.school/resources/downloads/it-information-sheet.html';
const output = path.resolve(process.argv[3] || 'resources/downloads/TBS-School-IT-Information-Sheet.pdf');
const htmlPath = path.resolve('resources/downloads/it-information-sheet.html');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.TBS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  try {
    const page = await browser.newPage();
    await page.route(source, (route) => route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: fs.readFileSync(htmlPath),
    }));
    await page.goto(source, { waitUntil: 'networkidle' });
    await page.pdf({
      path: output,
      format: 'A4',
      printBackground: true,
      margin: { top: '9mm', right: '9mm', bottom: '9mm', left: '9mm' },
    });
    console.log(output);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
