from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/")
        try:
             page.wait_for_selector('.ProseMirror, button', timeout=10000)
        except:
             print("Timeout loading app")
             browser.close()
             return

        time.sleep(2)

        # Create a new note
        print("Creating new note...")
        new_note_btn = page.locator('button[title="New Note"]')
        if new_note_btn.count() > 0:
            new_note_btn.first.click()
        else:
             page.keyboard.press("Control+n")

        time.sleep(1)

        # 1. Verify Toolbar Visible by Default
        print("Verifying Toolbar Visible...")
        # Look for Bold button
        bold_btn = page.locator('button[title="Bold"]')
        if bold_btn.count() > 0 and bold_btn.first.is_visible():
             print("✅ Toolbar is visible.")
        else:
             print("❌ Toolbar is NOT visible (should be default).")

        # 2. Verify Toggle Button Exists
        print("Verifying Toggle Toolbar Button...")
        # It has title "Hide Toolbar" when visible
        toggle_btn = page.locator('button[title="Hide Toolbar"]')
        if toggle_btn.count() > 0:
             print("✅ Toggle Button found (Hide state).")
        else:
             print("❌ Toggle Button NOT found.")

        # Screenshot Visible State
        page.screenshot(path="verification/toolbar_visible.png")

        # 3. Toggle Toolbar OFF
        print("Toggling Toolbar OFF...")
        toggle_btn.click()
        time.sleep(0.5)

        # Verify Toolbar Hidden
        if bold_btn.count() == 0 or not bold_btn.first.is_visible():
             print("✅ Toolbar is hidden.")
        else:
             print("❌ Toolbar is still visible.")

        # Check button title changed
        show_btn = page.locator('button[title="Show Formatting Toolbar"]')
        if show_btn.count() > 0:
             print("✅ Toggle Button switched to 'Show' state.")
        else:
             print("❌ Toggle Button did NOT switch state.")

        # Screenshot Hidden State
        page.screenshot(path="verification/toolbar_hidden.png")

        browser.close()

if __name__ == "__main__":
    run()
