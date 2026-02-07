import time
from playwright.sync_api import sync_playwright

def verify_layout(page):
    page.goto("http://localhost:5173")

    # Enable Dev Mode
    try:
        page.get_by_role("button", name="Settings").click()
        page.get_by_label("Toggle Developer Mode").click()
    except:
        pass

    # Go to Simulator - use exact text from the Command Palette button or Sidebar button
    # The error says there are two. One is likely sidebar icon, one is command palette option?
    # Or maybe "Simulator" text vs "🧪 Simulator" text.

    # Try finding by text "🧪 Simulator" which is likely the one in the command list if visible,
    # but the sidebar usually has icons.

    # Let's try getting by title "Simulator" which matches the sidebar icon button
    page.locator("button[title='Simulator']").click()

    page.wait_for_timeout(1000)
    page.screenshot(path="verification/sim_overview.png")

    # Check Sidebar items
    # "Overview" button
    page.get_by_role("button", name="Overview").click()
    page.wait_for_timeout(500)

    # Click Alice
    # Use text locator
    page.get_by_text("Alice (Client)").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/sim_alice.png")

    # Check inputs (should be visible if not active)
    # Simulator starts inactive by default
    page.wait_for_selector("input[value='Alice (Client)']")

    print("Verification successful")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            verify_layout(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
