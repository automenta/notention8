from playwright.sync_api import sync_playwright
import os
import time

def verify_property_trigger_with_seed():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")

            # 1. Create Note
            page.click("button:has-text('Write')")
            page.wait_for_selector(".ProseMirror", timeout=5000)

            # 2. Seed Ontology
            page.fill(".ProseMirror", "I am a developer.")
            # Trigger Magic via Slash
            page.type(".ProseMirror", "/")
            page.wait_for_selector("text=Magic Align", timeout=2000)
            page.click("text=Magic Align")

            # Wait for Magic to finish (toast appears)
            page.wait_for_selector("text=Magic:", timeout=5000)

            # Wait for Suggestion Panel
            page.wait_for_selector("text=Suggestions", timeout=5000)
            page.click("button:has-text('Accept All')")

            # Now 'role' should be in ontology (inferred).
            # Clear editor
            page.fill(".ProseMirror", "")

            # 3. Test '[' Trigger
            page.type(".ProseMirror", "[")

            # Should see 'role' suggestion
            page.wait_for_selector(".suggestion-item:has-text('role')", timeout=5000)
            print("Property menu appeared with 'role'!")

            page.click(".suggestion-item:has-text('role')")

            # 4. Verify Modal
            page.wait_for_selector("input[value='role']", timeout=3000)
            print("PASS: Property Modal Opened with 'role' pre-filled")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/property_trigger_seeded.png")
            browser.close()

if __name__ == "__main__":
    verify_property_trigger_with_seed()
