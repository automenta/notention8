import time
from playwright.sync_api import sync_playwright

def test_simulator(page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")

    # 2. Enable Developer Mode in Settings
    page.get_by_role("button", name="Settings").click()
    page.get_by_label("Toggle Developer Mode").click()

    # 3. Navigate to Simulator
    # Depending on tab button implementation
    page.get_by_role("button", name="Simulator").click()

    # 4. Start Simulator
    page.get_by_role("button", name="START").click()

    # 5. Wait for some activity
    # Check for "Thinking..." or similar status text
    # The status indicator is inside AgentSessionView
    # Wait a few seconds for agents to start acting
    time.sleep(5)

    # 6. Take screenshot
    page.screenshot(path="verification/simulator.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_simulator(page)
        finally:
            browser.close()
