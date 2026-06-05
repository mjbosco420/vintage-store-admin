import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173');
  
  await page.waitForSelector('button:has-text("Add to Cart")');
  await page.locator('button:has-text("Add to Cart")').first().click();
  
  // Wait for the Web Checkout button to be visible
  await page.waitForSelector('text=CHECKOUT ON WEBSITE');
  await page.locator('text=CHECKOUT ON WEBSITE').click();
  
  // Try to create an account if AuthModal opens
  try {
    await page.waitForSelector('text=Login', { timeout: 5000 });
    // Click Sign Up tab
    await page.locator('button:has-text("Sign Up")').click();
    await page.fill('#auth-name', 'Playwright User');
    await page.fill('#auth-email', 'pw4@example.com');
    await page.fill('#auth-password', 'password123');
    await page.locator('button:has-text("CREATE ACCOUNT")').click();
  } catch(e) {}
  
  // Wait for WebCheckoutModal to be open
  await page.waitForSelector('button:has-text("PLACE ORDER")');
  await page.locator('button:has-text("PLACE ORDER")').click();
  
  // Wait to see if it changes to "Order Received" or shows an error
  try {
    await page.waitForSelector('h2:has-text("Order Received")', { timeout: 10000 });
    console.log('SUCCESS: Order was placed successfully!');
  } catch (e) {
    console.log('FAILED: Order placement did not succeed. Looking for error...');
    const errorText = await page.locator('.bg-\\[\\#ff2153\\]\\/10').textContent().catch(() => null);
    console.log('ERROR TEXT IN MODAL:', errorText);
  }

  await browser.close();
})();
