import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('https://valqore.pro/admin/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'valqore2026!');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  
  // click edit on Legendary Bundle
  // Wait for the games list to load
  await page.waitForSelector('button:has-text("Edit")');
  
  // Find Legendary Bundle's edit button
  // We can search for the h3 containing "Legendary Bundle" and go up to the container
  const editButton = page.locator('h3:has-text("Legendary Bundle")').locator('xpath=ancestor::div[contains(@class, "bg-secondary")]').locator('button:has-text("Edit")').first();
  await editButton.click();
  
  await page.waitForTimeout(1000);
  
  // click save
  const saveButton = page.locator('button:has-text("Save")').first();
  await saveButton.click();
  
  await page.waitForTimeout(15000); // wait to see logs
  await browser.close();
})();
