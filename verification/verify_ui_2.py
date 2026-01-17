import time
from playwright.sync_api import sync_playwright

def verify_enhanced_ui(page):
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("text=Create First Note", timeout=5000)

    # Create a note to see the Editor Header and Property Inspector
    page.get_by_role("button", name="Create First Note").click()
    page.fill("#note-title-input", "UI Verification Note")

    # Open Inspector
    page.get_by_role("button", name="Show Properties").click()

    # Focus Sidebar Search to see the new style
    page.click("#sidebar-search-input")
    page.keyboard.type("test")

    time.sleep(1) # Wait for UI updates

    # Take screenshot
    page.screenshot(path="verification/ui_enhancement_round_2.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_enhanced_ui(page)
        finally:
            browser.close()
