from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/")

        # Target the button in the Header
        dashboard_btn = page.locator("header").get_by_role("button", name="Dashboard")
        expect(dashboard_btn).to_be_visible()

        # Click Notes
        notes_btn = page.locator("header").get_by_role("button", name="Notes")
        notes_btn.click()

        # Wait for Notes view to load
        # Notes view should have a sidebar with search input or similar
        page.wait_for_timeout(1000)

        # Take screenshot
        page.screenshot(path="verification/nav_screenshot.png")

        browser.close()

if __name__ == "__main__":
    run()
