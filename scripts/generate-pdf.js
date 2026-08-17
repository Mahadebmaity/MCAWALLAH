import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const docs = [
        {
            html: path.join(__dirname, '..', 'PORTFOLIO_SYSTEM_DOCUMENTATION.html'),
            pdf: path.join(__dirname, '..', 'PORTFOLIO_SYSTEM_DOCUMENTATION.pdf')
        },
        {
            html: path.join(__dirname, '..', 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.html'),
            pdf: path.join(__dirname, '..', 'PORTFOLIO_ENTERPRISE_DOCUMENTATION_28_SECTIONS.pdf')
        }
    ];

    console.log("🚀 Launching Edge browser to compile documentation PDFs...");
    const browser = await puppeteer.launch({
        executablePath: edgePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const doc of docs) {
        console.log(`📄 Generating PDF for: ${path.basename(doc.html)}...`);
        const page = await browser.newPage();
        await page.goto(`file://${doc.html}`, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: doc.pdf,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '16mm',
                bottom: '16mm',
                left: '16mm',
                right: '16mm'
            }
        });
        await page.close();
        console.log(`🎉 PDF Successfully Generated at: ${doc.pdf}`);
    }

    await browser.close();
}

generatePDF().catch(err => {
    console.error("❌ PDF Generation Error:", err);
    process.exit(1);
});
