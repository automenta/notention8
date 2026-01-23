from playwright.sync_api import Page, expect, sync_playwright
import os

def test_dashboard_cleanup(page: Page):
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    try:
        page.wait_for_selector("header", timeout=10000)
    except:
        print("Header not found. App might have crashed.")
        page.screenshot(path="crash.png")
        raise

    # Go to Dashboard
    print("Navigating to Dashboard...")
    header = page.locator("header")
    dashboard_btn = header.get_by_title("Dashboard")

    # Optional: wait a bit to ensure interactivity
    page.wait_for_timeout(1000)

    if dashboard_btn.is_visible():
        dashboard_btn.click()
    else:
        print("Dashboard button not visible.")
        # Try to find by icon if needed, or maybe we are already there.

    page.wait_for_timeout(1000)

    print("Checking for Widgets...")

    # Take a screenshot to verify state visually if needed later
    page.screenshot(path="dashboard_check.png")

    # Check for Network Matches
    expect(page.get_by_text("Network Matches")).to_be_visible()
    print("Network Matches widget found.")

    # Check for Network Pulse
    expect(page.get_by_text("Network Pulse")).to_be_visible()
    print("Network Pulse widget found.")

    # Check for Start from Template
    expect(page.get_by_text("Start from Template")).to_be_visible()
    print("Start from Template widget found.")

    # Check for Quick Actions
    expect(page.get_by_text("Quick Actions")).to_be_visible()
    print("Quick Actions widget found.")

    print("All widgets verified.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_dashboard_cleanup(page)
            print("Cleanup verification passed!")
        except Exception as e:
            print(f"Test failed: {e}")
            # Ensure we have a screenshot on failure
            try:
                page.screenshot(path="verification_failure.png")
            except:
                pass
            exit(1)
        finally:
            browser.close()
