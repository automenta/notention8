
from playwright.sync_api import sync_playwright

def verify_simulator(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(3000)

    # Click Settings button by title "Settings"
    page.locator("button[title='Settings']").click()
    print("Clicked Settings button")

    page.wait_for_timeout(1000)

    if page.get_by_role("heading", name="Settings").is_visible():
        print("On Settings Page")

        # Toggle Developer Mode
        toggle = page.locator("button[aria-label='Toggle Developer Mode']")
        if toggle.is_visible():
            toggle.click()
            print("Clicked Toggle")

            page.wait_for_timeout(1000)

            # Click Simulator tab
            page.get_by_role("button", name="Simulator").click()
            page.wait_for_timeout(2000)
            page.screenshot(path="verification/simulator_layout.png")
            print("Simulator verified")
        else:
            print("Toggle not found")
            page.screenshot(path="verification/toggle_missing.png")
    else:
        print("Failed to navigate to Settings")
        page.screenshot(path="verification/failed_nav.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_simulator(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_script.png")
        finally:
            browser.close()
