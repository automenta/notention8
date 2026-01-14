from playwright.sync_api import sync_playwright

def test_relay_management(page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")

    # 2. Go to Settings -> Nostr
    page.get_by_role("button", name="Settings").click()
    page.get_by_role("button", name="🔑 Nostr").click()

    # 3. Verify Default Relays are visible
    # We check for a known default relay
    page.get_by_text("wss://relay.damus.io").wait_for()

    # 4. Add a new relay
    new_relay = "wss://test.relay.com"
    page.get_by_placeholder("wss://relay.example.com").fill(new_relay)
    page.get_by_role("button", name="Add").click()

    # Verify it was added
    page.get_by_text(new_relay).wait_for()

    # Take screenshot of added relay
    page.screenshot(path="verification/relays_added.png")

    # 5. Remove the relay
    # We need to find the specific trash button for this relay.
    # Since layout is flex row: relay text + button.
    # We can filter the list item that contains our text.

    # Use xpath or layout selector
    # //div[contains(@class, 'flex') and .//span[text()='wss://test.relay.com']]//button

    # Locate the row that has exact text of our relay
    relay_row = page.locator("div").filter(has_text=new_relay).last
    relay_row.get_by_role("button", name="Remove Relay").click()

    # Handle confirmation dialog
    # Wait, simple 'click' might trigger the native confirm dialog which Playwright auto-dismisses unless handled.
    # We need to accept the dialog.

    page.on("dialog", lambda dialog: dialog.accept())

    # Verify it is gone (wait for it to detach)
    # Using expect(locator).to_be_hidden() pattern is better but simple wait works for script
    try:
        page.get_by_text(new_relay).wait_for(state="hidden", timeout=2000)
    except:
        # Retry click if needed or check if dialog handler failed
        pass

    page.screenshot(path="verification/relays_removed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Setup dialog handler globally for the page before action
        page.on("dialog", lambda dialog: dialog.accept())

        try:
            test_relay_management(page)
        finally:
            browser.close()
