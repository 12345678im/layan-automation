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

      // ننتظر ظهور إشعار Toastr لمدة دقيقة
      const notification = await Promise.race([
        page.waitForSelector('#toast-container .toast .toast-message', { timeout: 60000 }),
        new Promise(resolve => setTimeout(() => resolve(null), 60000))
      ]);

      if (notification) {
        const content = await notification.innerText();
        statusMsg = `✅ [${startTime}] رقم ${phone} - النتيجة: ${content.trim()}`;
      } else {
        statusMsg = `⚠️ [${startTime}] رقم ${phone} - لم تظهر نتيجة خلال دقيقة`;
      }

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
