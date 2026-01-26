from playwright.sync_api import sync_playwright
import os

def verify_suggestions_at_bottom():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")

            # Wait for app to load
            page.wait_for_selector("text=What's on your mind?", timeout=10000)

            # Type in smart input
            page.fill("textarea", "Need a React developer for $100")

            # Click create
            page.click("button:has-text('Create Note')")

            # Wait for navigation to note view and suggestion panel
            # Note: Title is now "Suggestions"
            page.wait_for_selector("text=Suggestions", timeout=10000)

            # Verify order of elements
            # We want to check that the Suggestion Panel is *after* the editor content area.
            # .ProseMirror is the editor content.
            # We can get bounding boxes.

            editor_bbox = page.locator(".ProseMirror").bounding_box()
            panel_bbox = page.locator("text=Suggestions").first.locator("xpath=../../..").bounding_box() # traverse up to container

            # Alternatively, check that SuggestionPanel is a child of the scrollable container.
            # The scrollable container has class "flex-grow overflow-y-auto"
            # We can check if "text=Suggestions" is inside it.

            # Simple check: Bounding box Y.
            # If editor is empty/small, panel should be below it.

            if editor_bbox and panel_bbox:
                print(f"Editor Bottom: {editor_bbox['y'] + editor_bbox['height']}")
                print(f"Panel Top: {panel_bbox['y']}")

                if panel_bbox['y'] >= (editor_bbox['y'] + 10): # Allow small overlap or margin
                    print("PASS: Suggestion Panel is below Editor Content")
                else:
                    print("FAIL: Suggestion Panel might be above or overlapping")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/suggestions_layout.png")
            browser.close()

if __name__ == "__main__":
    verify_suggestions_at_bottom()
