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
        page.get_by_title("New Note").click()

        # Check for EditorHeader
        expect(page.get_by_placeholder("Note Title")).to_be_visible()

        # Type something
        page.get_by_placeholder("Note Title").fill("My Template Note")

        # 2. Click Save as Template button
        # title="Save as Template"
        page.get_by_title("Save as Template").click()

        # 3. Check Modal
        # "Save as Template" might be title in Modal too.
        # Use get_by_role heading
        expect(page.get_by_role("heading", name="Save as Template")).to_be_visible()

        # Fill name
        page.get_by_placeholder("e.g., Daily Standup").fill("My Custom Template")

        # Save
        page.get_by_role("button", name="Save Template").click()

        # 4. Verify it appears in Sidebar
        # Sidebar has "Templates:" header
        # Check for button with title="My Custom Template"
        time.sleep(1) # Wait for state update
        tmpl_btn = page.get_by_title("My Custom Template")
        expect(tmpl_btn).to_be_visible()

        if not os.path.exists("verification"):
            os.makedirs("verification")

        page.screenshot(path="verification/custom_templates.png")
        print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/error_templates.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
