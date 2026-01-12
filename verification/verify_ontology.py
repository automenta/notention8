import time
from playwright.sync_api import sync_playwright

def verify_ontology_tab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Wait for server to start
            time.sleep(5)

            # 1. Navigate to app
            page.goto("http://localhost:5173")
            page.wait_for_selector("button[title='Settings']")

            # 2. Go to Settings -> Developer Mode
            page.get_by_title("Settings").click()

            # Toggle developer mode
            page.get_by_label("Toggle Developer Mode").click()

            # 3. Go to Ontology Tab (Use distinct text or icon)
            # The tab button says "🧬 Ontology"
            page.get_by_role("button", name="🧬 Ontology").click()

            # 4. Verify Ontology Tab loaded and shows "Emergent nodes" text
            page.wait_for_selector("text=Ontology Graph")

            # 5. Check if "Emergent nodes" helper text is visible (proving new UI)
            if page.locator("text=Emergent nodes").is_visible():
                print("SUCCESS: New Ontology UI text found.")
            else:
                print("FAILURE: New Ontology UI text NOT found.")

            # 6. Take screenshot
            page.screenshot(path="verification/ontology_tab.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ontology_tab()
