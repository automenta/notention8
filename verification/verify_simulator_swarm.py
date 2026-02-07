from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate
        print("Navigating to app...")
        page.goto("http://localhost:5173/")
        time.sleep(2)

        # 2. Enable Developer Mode
        print("Enabling Developer Mode...")
        # Settings button
        settings_btn = page.locator('button[title="Settings"]')
        if settings_btn.count() > 0:
            settings_btn.click()
        else:
             page.locator('header button').last.click()

        time.sleep(1)

        # Toggle Developer Mode
        # Try finding the toggle by aria-label or the text "Dev Mode"
        toggle = page.get_by_label("Toggle Developer Mode")
        if toggle.count() > 0:
            toggle.click()
            print("Developer Mode Toggled via Label")
        else:
             page.get_by_text("Dev Mode").click()
             print("Developer Mode Toggled via Text")

        time.sleep(1)

        # 3. Access Simulator
        print("Accessing Simulator...")

        # Click "Simulator" in header or Settings Tab
        # In Settings View, there is also a "Simulator" tab now visible
        sim_tab = page.get_by_role("button", name="🧪 Simulator")
        if sim_tab.count() > 0:
            sim_tab.click()
            print("Clicked Simulator Tab in Settings")
        else:
            # Try Header Nav
            sim_btn = page.get_by_title("Simulator")
            if sim_btn.count() > 0:
                sim_btn.click()
                print("Clicked Simulator button in Header")
            else:
                 print("Simulator button not found anywhere")
                 page.screenshot(path="verification/failed_sim_nav.png")
                 return

        time.sleep(2)

        # 4. Check for New Buttons
        print("Checking for Swarm and Optimize buttons...")

        # "+ Swarm" or "+ SWARM"
        swarm_btn = page.get_by_text("+ SWARM")
        if swarm_btn.count() > 0:
            print("✅ Found Swarm Button")
            swarm_btn.click()
            time.sleep(1)
            # Check Modal
            if page.locator("text=Deploy Swarm").count() > 0:
                print("✅ Swarm Modal Opened")
                page.screenshot(path="verification/swarm_modal.png")
                # Close modal via Close button '✕'
                # Find the close button inside the modal
                page.get_by_text("✕").click()
                time.sleep(1)

                # Verify modal closed
                if page.locator("text=Deploy Swarm").count() == 0:
                     print("✅ Swarm Modal Closed")
                else:
                     print("❌ Swarm Modal failed to close")
            else:
                print("❌ Swarm Modal did not open")
        else:
            print("❌ Swarm Button not found")
            page.screenshot(path="verification/failed_swarm_btn.png")

        # "Optimize"
        optimize_btn = page.get_by_role("button", name="Optimize")
        if optimize_btn.count() > 0:
            print("✅ Found Optimize Button")
            # Click it to ensure no crash
            optimize_btn.first.click()
            time.sleep(1)
            print("Clicked Optimize")
        else:
            print("❌ Optimize Button not found")

        browser.close()

if __name__ == "__main__":
    run()
