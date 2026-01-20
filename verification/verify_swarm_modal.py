from playwright.sync_api import sync_playwright
import time

def verify_swarm_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Navigate to Dashboard
        page.goto("http://localhost:5173/")
        page.wait_for_selector("text=Total Notes", timeout=10000)

        # 2. Enable Developer Mode
        page.click('button[title="Settings"]')
        time.sleep(0.5)
        page.click('button[aria-label="Toggle Developer Mode"]')
        time.sleep(0.5)

        # 3. Go to Simulator
        page.click('button[title="Simulator"]')
        time.sleep(2)

        # 4. Click "+ SWARM" button
        # Based on SimulatorView code: <button ... title="Deploy Swarm">
        page.click('button[title="Deploy Swarm"]')
        time.sleep(1)

        # 5. Verify Modal Appears
        # "Deploy Swarm" header in modal
        modal_header = page.query_selector('h2:text("Deploy Swarm")')
        if modal_header:
            print("Swarm Modal opened successfully.")
        else:
            raise Exception("Swarm Modal not found.")

        page.screenshot(path="verification/swarm_modal.png")
        print("Swarm Modal screenshot taken.")

        browser.close()

if __name__ == "__main__":
    try:
        verify_swarm_modal()
        print("Verification completed successfully.")
    except Exception as e:
        print(f"Verification failed: {e}")
