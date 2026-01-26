from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        page.goto("http://localhost:5173/")

        # Check Dashboard button
        dashboard_btn = page.locator("header").get_by_role("button", name="Dashboard")
        expect(dashboard_btn).to_be_visible()

        # Click Notes
        print("Clicking Notes...")
        notes_btn = page.locator("header").get_by_role("button", name="Notes")
        notes_btn.click()
        page.wait_for_timeout(500)

        # Click Chat (if available) - Chat should be available
        print("Clicking Chat...")
        chat_btn = page.locator("header").get_by_role("button", name="Chat")
        chat_btn.click()
        page.wait_for_timeout(500)

        # Click Settings
        print("Clicking Settings...")
        settings_btn = page.locator("header").get_by_role("button", name="Settings")
        settings_btn.click()
        page.wait_for_timeout(500)

        browser.close()

if __name__ == "__main__":
    run()
