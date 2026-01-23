from playwright.sync_api import sync_playwright
import os

def verify_property_trigger():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")

            # Wait for app to load
            page.wait_for_selector("text=What's on your mind?", timeout=10000)

            # Create a new note to enter editor
            page.click("button:has-text('Write')")

            # Wait for editor
            page.wait_for_selector(".ProseMirror", timeout=5000)

            # Type "[" to trigger property suggestion
            page.type(".ProseMirror", "[")

            # Wait for suggestion list (we should see some properties if ontology has any)
            # The default ontology has 'status' or similar? Or maybe emergent ones.
            # Let's assume there are some default properties or we add one via magic first.

            # Actually, let's look for the *absence* of the text "status" first, then type it.
            # But we don't know the ontology state.

            # Let's type a known property prefix if possible.
            # Assuming 'status' is common.

            # If the menu appears, we can try to click one.
            # The test is that clicking one opens the Modal.

            # Wait for any .suggestion-item
            try:
                page.wait_for_selector(".suggestion-item", timeout=3000)
                print("Property menu appeared!")

                # Click the first one
                page.click(".suggestion-item >> nth=0")

                # Check if modal opened ("Insert Property" or similar title)
                # The modal title is dynamic, but it has input fields.
                page.wait_for_selector("input[placeholder='Property Name']", timeout=3000)
                print("PASS: Property Modal Opened via '[' trigger")

            except Exception as e:
                print("Menu didn't appear or modal didn't open. (Might need ontology population first)")
                # Type some magic to populate ontology?
                # For now, just screenshot.

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/property_trigger.png")
            browser.close()

if __name__ == "__main__":
    verify_property_trigger()
