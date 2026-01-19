from playwright.sync_api import Page, expect, sync_playwright

def test_simulator_access(page: Page):
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:5173")

    # 2. Act: Go to Settings
    settings_button = page.get_by_title("Settings")
    settings_button.click()

    # 3. Enable Developer Mode if not enabled
    # We check if Simulator button is visible. If not, we toggle dev mode.
    # Note: Simulator button is in the Header, but might be hidden.

    # The header Simulator button has title="Simulator"
    simulator_button = page.get_by_title("Simulator")

    if not simulator_button.is_visible():
        print("Simulator button not visible. Toggling Developer Mode...")
        dev_mode_toggle = page.get_by_label("Toggle Developer Mode")
        dev_mode_toggle.click()
        expect(simulator_button).to_be_visible()
    else:
        print("Simulator button already visible.")

    # 4. Click Simulator
    simulator_button.click()

    # 5. Assert we are in Simulator View
    # SimulatorView has "🧪 Community Simulator" text
    expect(page.get_by_text("Community Simulator")).to_be_visible()

    # 6. Screenshot
    page.screenshot(path="/home/jules/verification/simulator_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_simulator_access(page)
        finally:
            browser.close()
