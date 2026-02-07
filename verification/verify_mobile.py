from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile Viewport
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        )
        page = context.new_page()
        page.goto("http://localhost:5173")

        # Wait for something that is definitely visible on mobile
        # The header should be visible
        page.wait_for_selector('header', timeout=30000)

        # Now wait for sidebar content. Note: Sidebar might be initially hidden or overlaid on mobile depending on logic.
        # But 'Your notebook is empty' is inside Sidebar which is rendered.
        # Let's ensure sidebar is visible or wait for it.
        # In App.tsx:
        # ${activeView === 'notes' && !selectedNoteId ? 'w-full block' : 'hidden md:block'}
        # On load, activeView is notes, selectedNoteId is null. So Sidebar should be visible full width.

        try:
            page.wait_for_selector('text=Your notebook is empty', timeout=10000)
        except Exception as e:
            print("Could not find 'Your notebook is empty'. Taking debug screenshot.")
            page.screenshot(path="verification/debug_sidebar_fail.png")
            # Dump page content to debug
            print(page.content())
            raise e

        # Take screenshot of Sidebar on mobile
        page.screenshot(path="verification/mobile_sidebar.png")
        print("Sidebar screenshot captured.")

        # Create a new note to test editor view on mobile
        # Use a more generic selector if title match fails
        # The button has title="New Note (Ctrl+N)"
        page.click('button[title*="New Note"]')

        # Wait for editor
        page.wait_for_selector('#note-title-input')

        # Take screenshot of Editor on mobile
        page.screenshot(path="verification/mobile_editor.png")
        print("Editor screenshot captured.")

        # Test Back Button
        # The back button should be visible on mobile
        back_btn = page.locator('button[title="Back to List"]')
        if back_btn.is_visible():
            back_btn.click()
            page.wait_for_selector('text=Your notebook is empty', timeout=10000)

            # Take screenshot after back
            page.screenshot(path="verification/mobile_back_verified.png")
            print("Back navigation verified.")
        else:
            print("Back button not found (might be desktop view?)")

        browser.close()

if __name__ == "__main__":
    run()
