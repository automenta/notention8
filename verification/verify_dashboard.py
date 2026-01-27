from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_dashboard(page: Page):
    # Navigate to dashboard
    page.goto("http://localhost:5173")

    # Wait for loading
    page.wait_for_timeout(2000)

    # Check for Agent Activity widget
    # Using text locator as it's user-facing
    expect(page.get_by_text("Agent Activity")).to_be_visible()

    # Check for connection status (might say "Connecting..." or "Disconnected" since backend isn't running fully)
    # The widget shows "Connecting to Agent..." if not connected
    expect(page.get_by_text("Connecting to Agent...")).to_be_visible()

    # Take screenshot
    page.screenshot(path="/app/verification/dashboard.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard(page)
            print("Dashboard verification successful")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/app/verification/dashboard_error.png")
        finally:
            browser.close()
