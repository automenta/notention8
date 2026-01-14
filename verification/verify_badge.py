from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")
        page.wait_for_selector("button[title='New Note']")

        # 1. Enable Developer Mode
        page.get_by_title("Settings").click()
        page.get_by_label("Toggle Developer Mode").click()

        # 2. Go to Simulator
        # The Simulator tab appears in Settings now, or in Header?
        # Header.tsx adds 'Simulator' to navItems if developerMode is true.
        # Let's check Header.
        # Wait for rerender
        time.sleep(0.5)

        # Check if Simulator icon appears in Header.
        # Note: NavButton title="Simulator"
        sim_btn = page.get_by_title("Simulator")
        expect(sim_btn).to_be_visible()
        sim_btn.click()

        # 3. Start Simulator
        start_btn = page.get_by_text("START")
        start_btn.click()

        # 4. Wait for matches
        # We need to wait until the Network badge appears.
        # The Network badge is on the button with title="Network".
        # It is a span inside the button.
        network_btn = page.get_by_title("Network")

        print("Waiting for matches...")
        # Give it up to 20 seconds for simulation to run cycles
        for i in range(20):
            # Check if badge exists
            # We look for a span with text content that is a number
            # Or just check if the button contains text?
            # The badge has absolute position.

            # Use page.evaluate to check if badge is present?
            # Or just locator.
            # badge locator: network_btn.locator("span.absolute")
            badge = network_btn.locator("span.absolute")
            if badge.count() > 0 and badge.is_visible():
                print("Badge detected!")
                break
            time.sleep(1)

        # Take screenshot of header with badge
        if not os.path.exists("verification"):
            os.makedirs("verification")

        page.screenshot(path="verification/notification_badge.png")
        print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/error_badge.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
