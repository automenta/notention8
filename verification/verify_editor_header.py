from playwright.sync_api import sync_playwright

def verify_editor_header():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        page.set_viewport_size({"width": 1280, "height": 720})

        # Click on "Create First Note" if visible or "+" to ensure we are in editor view
        # Wait a bit
        page.wait_for_timeout(1000)

        # Check if we need to create a note
        try:
             # Try to find "Create First Note" button
             create_btn = page.get_by_role("button", name="Create First Note")
             if create_btn.is_visible():
                 create_btn.click()
        except:
             # Maybe we already have a note or the button is different
             pass

        # Alternatively, click the "+" button in the header if we are not in a note
        # But usually "Create First Note" is the main CTA on empty state.

        # Wait for the Title input to be visible
        page.wait_for_selector("#note-title-input")

        # Take a screenshot of the header area.
        # The header is the first child of the main column, but let's target by class or hierarchy.
        # EditorHeader is inside EditorManager which is inside NotesView.
        # EditorHeader root div has class 'flex-shrink-0 bg-gray-900 border-b border-gray-700/50' (based on my change)

        header = page.locator(".bg-gray-900.border-b.border-gray-700\/50").first

        header.screenshot(path="verification/editor_header_screenshot.png")

        browser.close()

if __name__ == "__main__":
    verify_editor_header()
