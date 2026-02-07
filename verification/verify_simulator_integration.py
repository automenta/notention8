from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate
        print("Navigating to app...")
        page.goto("http://localhost:5173/")
        time.sleep(2)

        # 2. Enable Developer Mode
        print("Enabling Developer Mode...")
        settings_btn = page.locator('button[title="Settings"]')
        if settings_btn.count() > 0:
            settings_btn.click()
        else:
             page.locator('header button').last.click()

        time.sleep(1)

        toggle = page.get_by_label("Toggle Developer Mode")
        if toggle.count() > 0:
            toggle.click()
        else:
             page.get_by_text("Dev Mode").click()

        time.sleep(1)

        # 3. Access Simulator
        print("Accessing Simulator...")
        sim_tab = page.get_by_role("button", name="🧪 Simulator")
        if sim_tab.count() > 0:
            sim_tab.click()
        else:
            page.get_by_title("Simulator").click()

        time.sleep(2)

        # 4. Check "Import My Notes" button
        print("Checking for Import Notes button...")
        import_btn = page.get_by_text("📥 Import My Notes")
        if import_btn.count() > 0:
            print("✅ Found Import Button")
            # Click it
            import_btn.click()
            time.sleep(1)
            # We can't easily verify the effect without creating a note first, but finding the button confirms UI update.
        else:
            print("❌ Import Button not found")
            page.screenshot(path="verification/failed_import_btn.png")

        browser.close()

if __name__ == "__main__":
    run()
