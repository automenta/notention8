from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 800})

    try:
        # 1. Navigate
        print("Navigating to home...")
        page.goto("http://localhost:5173")

        # 2. Go to Settings
        print("Going to Settings...")
        page.get_by_title("Settings").click()

        # Verify we are on settings page
        expect(page.get_by_role("heading", name="Settings")).to_be_visible()

        # 3. Enable Developer Mode
        print("Enabling Developer Mode...")

        # Use get_by_label since role="switch" might be missing
        toggle = page.get_by_label("Toggle Developer Mode")
        expect(toggle).to_be_visible()

        class_attr = toggle.get_attribute("class")
        is_checked = "bg-blue-600" in class_attr

        if not is_checked:
            toggle.click()

        # 4. Go to Simulator
        print("Going to Simulator...")
        # Wait for the simulator button to appear
        simulator_btn = page.get_by_title("Simulator")
        expect(simulator_btn).to_be_visible()
        simulator_btn.click()

        # 5. Verify Simulator Sidebar
        print("Verifying Simulator Sidebar...")
        expect(page.get_by_text("🧪 Simulator")).to_be_visible()
        page.screenshot(path="verification/simulator_sidebar.png")

        # 6. Verify Swarm Modal
        print("Opening Swarm Modal...")
        page.get_by_title("Deploy Agent Swarm").click()
        expect(page.get_by_text("Deploy Swarm")).to_be_visible()
        page.screenshot(path="verification/swarm_modal.png")

        # Close modal
        page.get_by_label("Close").click()

        # 7. Verify Agent Editor
        print("Selecting Agent and verifying Editor...")
        # Select Alice
        page.get_by_text("Alice (Client)").click()

        # Wait for editor
        expect(page.get_by_text("Randomize Identity")).to_be_visible(timeout=5000)

        # Taking a screenshot of the whole page to see the editor
        page.screenshot(path="verification/agent_editor.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
        raise

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
