from playwright.sync_api import sync_playwright
import time

def verify_uis():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Dashboard
        print("Navigating to Dashboard...")
        page.goto("http://localhost:5173/")
        # Wait for dashboard to load
        page.wait_for_selector("text=Total Notes", timeout=10000)
        time.sleep(1) # Extra wait for animations
        page.screenshot(path="verification/dashboard.png")
        print("Dashboard screenshot taken.")

        # 2. Notes
        print("Navigating to Notes...")
        page.click('button[title="Notes"]')
        time.sleep(1)
        page.screenshot(path="verification/notes.png")
        print("Notes screenshot taken.")

        # 3. Map
        print("Navigating to Map...")
        page.click('button[title="Map"]')
        time.sleep(2) # Map loading
        page.screenshot(path="verification/map.png")
        print("Map screenshot taken.")

        # 4. Network
        print("Navigating to Network...")
        page.click('button[title="Network"]')
        time.sleep(1)
        page.screenshot(path="verification/network.png")
        print("Network screenshot taken.")

        # 5. Ontology
        print("Navigating to Ontology...")
        page.click('button[title="Ontology"]')
        time.sleep(1)
        page.screenshot(path="verification/ontology.png")
        print("Ontology screenshot taken.")

        # 6. Enable Developer Mode to see Simulator
        print("Enabling Developer Mode...")
        page.click('button[title="Settings"]')
        time.sleep(0.5)

        # Check if already enabled (color check or state check)
        # But for new session it defaults to false (usually) or local storage persistence.
        # We can force it.

        # Click the toggle
        page.click('button[aria-label="Toggle Developer Mode"]')
        time.sleep(0.5)

        # 7. Simulator
        print("Navigating to Simulator...")
        # Now Simulator icon should appear in header
        # Usually it is the last item
        page.click('button[title="Simulator"]')
        time.sleep(2)
        page.screenshot(path="verification/simulator.png")
        print("Simulator screenshot taken.")

        browser.close()

if __name__ == "__main__":
    try:
        verify_uis()
        print("Verification completed successfully.")
    except Exception as e:
        print(f"Verification failed: {e}")
