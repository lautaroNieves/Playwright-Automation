import { test, expect } from '@playwright/test';

const credentials = {
    "standard": "standard_user",
    "locked": "locked_out_user",
    "error": "error_user"
};


test.describe("Testing Swag Labs site", () => {
    test("Verify login with valid credentials", async ({page}) => {
        await page.goto("https://www.saucedemo.com/");
        await expect(page).toHaveTitle("Swag Labs");
        
        // Provide credentials
        await page.locator("id=user-name").fill(credentials["standard"]);
        await page.locator("id=password").fill("secret_sauce");

        // Click login button
        await page.locator("#login-button").click();

        // Verify that we are redirected to the correct page
        await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");

        await page.close();
    });

    test("Verify add to cart functionality", async ({page}) => {
        await page.goto("https://www.saucedemo.com/");
        await expect(page).toHaveTitle("Swag Labs");
        
        // Provide credentials
        await page.locator("id=user-name").fill(credentials["standard"]);
        await page.locator("id=password").fill("secret_sauce");

        // Click login button
        await page.locator("#login-button").click();

        // Verify that we are redirected to the correct page
        await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");

        // Get all the inventory items with Add to cart buttons
        const allItems = await page.locator('//div[contains(@class, "inventory_item_description") and .//button[contains(text(), "Add to cart")]]');

        const itemCount = await allItems.count();

        // Verify that there is at least one item in the page
        await expect(itemCount).toBeGreaterThan(0);

        // Get the first item
        const firstItem = await allItems.first();

        const itemName = await firstItem.locator(".inventory_item_name").textContent();
        const itemDesc = await firstItem.locator(".inventory_item_desc").textContent();
        const itemPrice = await firstItem.locator(".inventory_item_price").textContent();

        // Get the current number of items in the cart
        let badgeLocator = page.locator("//div[contains(@id,'shopping_cart_container')]//span[contains(@class,'shopping_cart_badge')]");

        let itemsBeforeAdd = 0;
        if (await badgeLocator.count() > 0) {
            const text = await badgeLocator.textContent();
            itemsBeforeAdd = parseInt(text);
        }

        // Get the Add to cart button and click it
        const addToCartButton = await firstItem.locator('//button[contains(text(), "Add to cart")]');
        await addToCartButton.click();

        // Current number of items in the cart after adding one
        let itemsAfterAdd = 0;
        if (await badgeLocator.count() > 0) {
            const text = await badgeLocator.textContent();
            itemsAfterAdd = parseInt(text);
        }

        await expect(itemsAfterAdd).toBeGreaterThan(itemsBeforeAdd);

        // Go to the cart page and check that the item is present there
        await badgeLocator.click();

        // Verify that we were redirected to the cart page
        await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");

        const cartNewItem = await page.locator('div.cart_item', { hasText: itemName });
        // Check item description and price
        const cartItemDesc = await cartNewItem.locator(".inventory_item_desc").textContent();
        const cartItemPrice = await cartNewItem.locator(".inventory_item_price").textContent();

        await expect(cartItemDesc).toEqual(itemDesc);
        await expect(cartItemPrice).toEqual(itemPrice);

        await page.close();
    });

    test("Verify checkout", async ({page}) => {
        await page.goto("https://www.saucedemo.com/");
        await expect(page).toHaveTitle("Swag Labs");
        
        // Provide credentials
        await page.locator("id=user-name").fill(credentials["standard"]);
        await page.locator("id=password").fill("secret_sauce");

        // Click login button
        await page.locator("#login-button").click();

        // Verify that we are redirected to the correct page
        await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");

        // Get all the inventory items with Add to cart buttons
        const allItems = await page.locator('//div[contains(@class, "inventory_item_description") and .//button[contains(text(), "Add to cart")]]');

        const itemCount = await allItems.count();

        // Verify that there is at least one item in the page
        await expect(itemCount).toBeGreaterThan(0);

        // Get the first item
        const firstItem = await allItems.first();

        const itemName = await firstItem.locator(".inventory_item_name").textContent();
        const itemDesc = await firstItem.locator(".inventory_item_desc").textContent();
        const itemPrice = await firstItem.locator(".inventory_item_price").textContent();

        // Get the current number of items in the cart
        let badgeLocator = page.locator("//div[contains(@id,'shopping_cart_container')]//span[contains(@class,'shopping_cart_badge')]");

        // Get the Add to cart button and click it
        const addToCartButton = await firstItem.locator('//button[contains(text(), "Add to cart")]');
        await addToCartButton.click();

        // Go to the cart page and check that the item is present there
        await badgeLocator.click();

        // Verify that we were redirected to the cart page
        await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");

        // Go to the checkout page
        const checkoutButton = await page.locator("//button[@id='checkout']").click();

        await expect(page).toHaveURL("https://www.saucedemo.com/checkout-step-one.html");

        // Complete mandatory fields
        await page.fill("//input[@id='first-name']", "FirstName");
        await page.fill("//input[@id='last-name']", "LastName");
        await page.fill("//input[@id='postal-code']", "123456");

        // Go to the last step page
        await page.click("//input[@id='continue']");

        await expect(page).toHaveURL("https://www.saucedemo.com/checkout-step-two.html");
        
        const cartNewItem = await page.locator('div.cart_item', { hasText: itemName });
        // Check item description and price
        const cartItemDesc = await cartNewItem.locator(".inventory_item_desc").textContent();
        const cartItemPrice = await cartNewItem.locator(".inventory_item_price").textContent();

        await expect(cartItemDesc).toEqual(itemDesc);
        await expect(cartItemPrice).toEqual(itemPrice);

        const totalItemsAmount = await page.locator('div.summary_subtotal_label', { hasText: itemPrice }).textContent();

        await expect(totalItemsAmount).toEqual("Item total: " + itemPrice);

        // Complete purchase
        await page.click("//button[@id='finish']");

        await expect(page).toHaveURL("https://www.saucedemo.com/checkout-complete.html");

        await page.close();
    });
});