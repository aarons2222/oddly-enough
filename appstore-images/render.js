const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function render() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // iPhone 6.7" display size for App Store (1290 x 2796)
  await page.setViewportSize({ width: 1290, height: 2796 });
  
  const files = ['screenshot-1.html', 'screenshot-2.html', 'screenshot-3.html', 'screenshot-4.html', 'screenshot-5.html'];
  
  for (const file of files) {
    const htmlPath = path.join(__dirname, file);
    const pngPath = htmlPath.replace('.html', '.png');
    
    await page.goto('file://' + htmlPath);
    await page.waitForTimeout(500);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log('Rendered:', pngPath);
  }
  
  await browser.close();
  console.log('Done!');
}

render().catch(console.error);
