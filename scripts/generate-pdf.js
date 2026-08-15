import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const htmlPath = path.join(__dirname, '..', 'PORTFOLIO_SYSTEM_DOCUMENTATION.html');
    const outputPath = path.join(__dirname, '..', 'PORTFOLIO_SYSTEM_DOCUMENTATION.pdf');

    console.log("🚀 Launching Edge browser to compile PDF...");
    const browser = await puppeteer.launch({
        executablePath: edgePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    console.log("📄 Generating publication-grade PDF...");
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '18mm',
            bottom: '18mm',
            left: '16mm',
            right: '16mm'
        }
    });

    await browser.close();
    console.log(`🎉 PDF Successfully Generated at: ${outputPath}`);
}

generatePDF().catch(err => {
    console.error("❌ PDF Generation Error:", err);
    process.exit(1);
});
