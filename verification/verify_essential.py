from playwright.sync_api import sync_playwright

def test_essential_features(page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")

    # 2. Create a Note to see the Editor
    # Click the main "+" button in the header or sidebar
    # The header has a "+" button. Let's find it.
    # It seems to be a blue button with a plus icon.
    page.get_by_role("button", name="New Note").click()

    # 3. Test Help Modal
    # Now EditorHeader should be visible
    page.get_by_role("button", name="Help & Syntax").click()

    # Assert Modal Open
    page.get_by_text("Notention Help").wait_for()
    page.get_by_text("Semantic Syntax").wait_for()

    # Take Screenshot of Help Modal
    page.screenshot(path="verification/help_modal.png")

    # Close Modal
    # Use exact match or filter to distinguish from "Close Sidebar"
    page.get_by_role("button", name="Close", exact=True).click()

    # 4. Test Nostr Import UI
    # Navigate to Settings
    page.get_by_role("button", name="Settings").click()

    # Click Nostr Tab
    page.get_by_text("🔑 Nostr").click()

    # Verify Import UI exists
    page.get_by_text("Already have an account? Import your private key.").wait_for()
    page.get_by_placeholder("nsec1... or hex key").wait_for()

    # Take Screenshot of Nostr Tab
    page.screenshot(path="verification/nostr_settings.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_essential_features(page)
        finally:
            browser.close()
