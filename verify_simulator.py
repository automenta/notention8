from playwright.sync_api import sync_playwright, expect
import time

def verify_simulator():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        print("Opening Settings...")
        # Try to find the settings button more robustly
        try:
             # Try class selector for lucide-settings icon if button fails
             page.locator(".lucide-settings").first.click()
        except:
             print("Fallback to getting by title Settings")
             page.get_by_title("Settings").click()

        print("Enabling Developer Mode...")
        # The Toggle is a button with aria-label="Toggle Developer Mode"
        # We check its class to see if it's checked (bg-blue-600)
        toggle_btn = page.get_by_label("Toggle Developer Mode")

        # Check if already enabled (has bg-blue-600)
        # We need to wait for it to be visible
        expect(toggle_btn).to_be_visible()

        class_attr = toggle_btn.get_attribute("class")
        if "bg-blue-600" not in class_attr:
            print("Clicking toggle...")
            toggle_btn.click()
        else:
            print("Already enabled.")

        # 3. Switch to Simulator Tab
        print("Switching to Simulator Tab...")
        page.get_by_role("button", name="🧪 Simulator").click()

        # 4. Start Simulation
        print("Starting Simulation...")
        start_btn = page.get_by_role("button", name="Start Simulation")
        start_btn.click()

        # 5. Wait for activity
        print("Waiting for agents to think...")
        expect(page.get_by_text("Thinking...")).to_be_visible(timeout=10000)

        print("Agents are active. Waiting a bit for screenshot...")
        time.sleep(5)

        # 6. Screenshot
        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/simulator_active.png")

        print("Verification script finished.")
        browser.close()

if __name__ == "__main__":
    verify_simulator()
