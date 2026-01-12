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
        try:
             page.locator(".lucide-settings").first.click()
        except:
             print("Fallback to getting by title Settings")
             page.get_by_title("Settings").click()

        print("Enabling Developer Mode...")
        toggle_btn = page.get_by_label("Toggle Developer Mode")
        expect(toggle_btn).to_be_visible()

        class_attr = toggle_btn.get_attribute("class")
        if "bg-blue-600" not in class_attr:
            print("Clicking toggle...")
            toggle_btn.click()
        else:
            print("Already enabled.")

        print("Switching to Simulator Tab...")
        page.get_by_role("button", name="🧪 Simulator").click()

        print("Starting Simulation...")
        start_btn = page.get_by_role("button", name="START")
        start_btn.click()

        print("Waiting for simulation loop...")
        # Wait for "Thinking..." in the UI
        expect(page.get_by_text("Thinking...")).to_be_visible(timeout=10000)

        # Wait for "Typing..."
        print("Agents thinking...")
        # Wait for published note in community window or log
        # We can check the log

        print("Waiting for publishing and matching...")
        # This might take 10-15 seconds in the simulator loop
        # We wait for the log "published a note"
        try:
            expect(page.locator("text=published a note")).to_be_visible(timeout=30000)
            print("Note published!")
        except:
            print("Timed out waiting for publish log.")

        time.sleep(5) # Let animations settle

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/simulator_compact.png")

        print("Verification script finished.")
        browser.close()

if __name__ == "__main__":
    verify_simulator()
