from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")
        page.wait_for_selector("button[title='New Note']")

        # 1. Click New Note to ensure we have a note selected
        page.get_by_title("New Note").first.click()

        # Check for EditorHeader
        expect(page.get_by_placeholder("Untitled Note")).to_be_visible()

        # 2. Toggle Inspector
        # title="Show Properties" or "Hide Properties"
        # Since it is default hidden, title should be "Show Properties"
        page.get_by_title("Show Properties").click()

        # 3. Add Property
        # Click + button "Add Property"
        page.get_by_title("Add Property").click()

        # 4. Check for Pick button next to "New Property"
        # The logic is: (editKey === 'location' || editKey === '')
        # When adding new property, editKey is ''. So Pick button should be visible.
        pick_btn = page.get_by_text("Pick")
        expect(pick_btn).to_be_visible()

        # 5. Click Pick
        pick_btn.click()

        # 6. Check Map Modal
        modal = page.get_by_text("Select a Location")
        expect(modal).to_be_visible()

        # Wait a bit for map to render
        time.sleep(1)

        if not os.path.exists("verification"):
            os.makedirs("verification")

        page.screenshot(path="verification/map_picker.png")
        print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/error_map.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
