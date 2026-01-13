import time
from playwright.sync_api import sync_playwright

def verify_data_tab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Wait for server to start
            time.sleep(5)

            # 1. Navigate to app
            page.goto("http://localhost:5173")
            page.wait_for_selector("button[title='Settings']")

            # 2. Go to Settings -> Data Tab
            page.get_by_title("Settings").click()

            # Click Data tab
            page.get_by_text("Data").click()

            # 3. Verify Backup/Restore UI
            # Check for "Backup & Restore" heading
            if page.locator("text=Backup & Restore").is_visible():
                print("SUCCESS: Backup & Restore section found.")
            else:
                print("FAILURE: Backup & Restore section NOT found.")

            # Check for Export button
            if page.locator("text=Export Data").is_visible():
                print("SUCCESS: Export button found.")
            else:
                print("FAILURE: Export button NOT found.")

            # 6. Take screenshot
            page.screenshot(path="verification/data_tab.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_data_tab()
