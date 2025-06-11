const { chromium } = require('playwright');
const fs = require('fs');

fs.writeFileSync('result.txt', `📄 سجل تنفيذ السكربت - ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })}\n\n`);

(async () => {
  const phones = fs.readFileSync('phones.txt', 'utf-8').split('\n').filter(Boolean);

  for (let phone of phones) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const startTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
    let statusMsg = '';

    try {
      console.log(`🔄 Processing phone: ${phone}`);
      await page.goto('https://rn.layan-t.net/', { waitUntil: 'load' });

      await page.fill('input[placeholder="رقم الهاتف"]', phone);
      await page.click('button:has-text("تحديث")');

      const result = await Promise.race([
        page.waitForSelector('.card', { timeout: 120000 }),
        new Promise(resolve => setTimeout(resolve, 120000))
      ]);

      statusMsg = `✅ [${startTime}] تم تحديث الرقم ${phone}`;
      console.log(statusMsg);
    } catch (e) {
      statusMsg = `❌ [${startTime}] فشل تحديث الرقم ${phone}: ${e.message}`;
      console.error(statusMsg);
    } finally {
      fs.appendFileSync('result.txt', `${statusMsg}\n`);
      await browser.close();
    }
  }

  fs.appendFileSync('result.txt', `\n🎯 الانتهاء من كل الأرقام في ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })}\n`);
  console.log("🎉 تم الانتهاء من كل الأرقام");
})();