
from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:5173")

            # Wait for any navigation button to appear (e.g., "Notes" via tooltip or aria-label if present)
            # The NavButtons have title attribute.
            page.wait_for_selector('button[title="Notes"]')

            # Click "New Note" to mount the EditorManager
            if page.get_by_title("New Note").is_visible():
                page.get_by_title("New Note").click()

            # Wait for the editor to appear (TiptapEditor usually has a contenteditable div)
            page.wait_for_selector(".ProseMirror")

            # Check if the AI features are present in the header
            # The Auto-tag button has title "Auto-suggest tags with AI"
            auto_tag_btn = page.get_by_title("Auto-suggest tags with AI")

            # Take a screenshot
            page.screenshot(path="verification/editor_ui.png")

            if auto_tag_btn.is_visible():
                print("Auto-tag button found.")
            else:
                print("Auto-tag button NOT found.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
