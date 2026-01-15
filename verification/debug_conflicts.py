from playwright.sync_api import sync_playwright

def debug_conflicts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173")

        page.wait_for_timeout(2000)

        page.screenshot(path="verification/debug_home.png")
        print("Debug home screenshot taken.")

        # Try to find Settings button
        settings_btn = page.get_by_title("Settings")
        if settings_btn.count() > 0:
            print("Settings button found.")
            settings_btn.click()
        else:
            print("Settings button NOT found.")
            # Print body content
            # print(page.content())

        browser.close()

if __name__ == "__main__":
    debug_conflicts()
