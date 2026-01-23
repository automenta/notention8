
import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_semantics(page):
    # 1. Load the app
    page.goto("http://localhost:5173")

    try:
        page.wait_for_selector("text=What's on your mind?", timeout=10000)
    except:
        print("Dashboard not loaded directly. Trying to find sidebar or other elements.")

    # 2. Create a new note with semantic properties
    print("Creating new note via Smart Input...")
    textarea = page.locator("textarea[placeholder*='Describe a project']")
    if textarea.is_visible():
        textarea.fill("I need a React developer for [price < 100] #hiring")

        # Click "Create Note"
        page.click("button:has-text('Create Note')")

        # Wait for note creation
        time.sleep(2)
        print("Note created via Smart Input")
    else:
        print("Smart Input not visible, trying sidebar 'New Note' button if exists")

    # 3. Verify the note in the list
    print("Looking for created note in sidebar...")

    # Let's wait for ANY note item to appear if the list was empty
    page.wait_for_selector(".note-list-item", timeout=5000)

    # Click the first note item (most recent)
    page.click(".note-list-item >> nth=0")
    print("Clicked first note in sidebar")

    # 4. Verify the property display in the editor (HTML semantics)
    # The property [price < 100] should be rendered as a widget
    # Selector: .node-property (based on PropertyChip.tsx)

    print("Waiting for property chip...")
    page.wait_for_selector(".node-property", timeout=5000)

    # Check the text content of the widget
    widget_text = page.locator(".node-property").first.text_content()
    print(f"Widget Text: {widget_text}")

    # Verify content
    # Expected: "price" and "<" or "less than"
    if "price" in widget_text:
        print("Property widget found with 'price'")
    else:
        print("WARNING: Property widget content unexpected")

    # 5. Take screenshot
    page.screenshot(path="verification/semantics_verification.png")
    print("Screenshot saved to verification/semantics_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_semantics(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
