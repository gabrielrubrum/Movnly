const puppeteer = require('puppeteer');

(async () => {
    console.log('Browser test running...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport to 1080p
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
        console.log('Navigating to homepage...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 6000));
        await page.screenshot({ path: '1_screenshot_homepage.png', fullPage: true });
        console.log('Saved 1_screenshot_homepage.png');
        
        console.log('Testing booking flow click...');
        // Let's click assuming there are links to /book
        await page.goto('http://localhost:3000/book', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 6000));
        await page.screenshot({ path: '2_screenshot_booking.png', fullPage: true });
        console.log('Saved 2_screenshot_booking.png');
        
    } catch (e) {
        console.error('Error during testing:', e);
    }
    
    await browser.close();
    console.log('Finished visual export!');
})();
