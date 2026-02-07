from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")

        # Wait for app to load
        page.wait_for_selector("button[title='New Note']")

        # Navigate to Settings
        page.get_by_title("Settings").click()

        # Enable Developer Mode via Toggle
        toggle = page.get_by_label("Toggle Developer Mode")
        toggle.click()

        # Wait a bit
        time.sleep(0.5)

        # Navigate to Ontology
        page.get_by_title("Ontology").click()

        # Check for "Conflicts" tab
        conflicts_tab = page.get_by_role("button", name="Conflicts")
        expect(conflicts_tab).to_be_visible()

        # Click Conflicts tab
        conflicts_tab.click()

        # Check for content
        expect(page.get_by_text("Conflict Resolution")).to_be_visible()

        if not os.path.exists("verification"):
            os.makedirs("verification")

        # Screenshot
        page.screenshot(path="verification/conflicts_view.png")
        print("Verification successful!")
    except Exception as e:
        print(f"Verification failed: {e}")
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/error_conflicts.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
