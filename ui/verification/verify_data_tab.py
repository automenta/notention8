from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_data_tab(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for app to load
    page.wait_for_selector("header", timeout=10000)

    # Open Settings
    print("Navigating to Settings...")
    page.get_by_label("Settings").click()

    # Switch to Data Management tab
    print("Switching to Data tab...")
    page.get_by_text("Data Management").click()

    # Verify Buttons
    print("Verifying Data Tab buttons...")
    expect(page.get_by_role("button", name="Export Data (JSON)")).to_be_visible()
    expect(page.get_by_role("button", name="Import Data (JSON)")).to_be_visible()
    print("Export/Import buttons visible.")

    # Click Clear All Data (Danger Zone)
    print("Clicking Clear All Data...")
    clear_btn = page.get_by_role("button", name="Clear All Local Data")
    clear_btn.click()

    # Verify Modal appears
    print("Verifying Confirmation Modal...")
    modal = page.get_by_text("Clear All Data?") # Title of modal
    expect(modal).to_be_visible()

    # Check warning text
    warning = page.get_by_text("Are you sure you want to delete all data?")
    expect(warning).to_be_visible()

    # Click Cancel
    print("Canceling...")
    page.get_by_role("button", name="Cancel").click()

    # Verify Modal gone
    expect(modal).not_to_be_visible()
    print("Modal closed.")

    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/data_tab.png")

    print("Data Tab verification passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_data_tab(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/data_tab_failure.png")
            raise
        finally:
            browser.close()
