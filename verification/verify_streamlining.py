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

        # 1. Verify Status Bar is Hidden (Empty Note)
        print("Verifying Status Bar Hidden (Empty Note)...")
        # Status bar has text "words" and "characters"
        status_bar = page.get_by_text("words")
        if status_bar.count() == 0 or not status_bar.first.is_visible():
             print("✅ Status Bar is hidden (0 chars).")
        else:
             print("❌ Status Bar is visible (should be hidden).")

        # 2. Type content and Verify Status Bar Appears
        print("Typing content...")
        page.keyboard.type("Hello World")
        time.sleep(0.5)

        if status_bar.count() > 0 and status_bar.first.is_visible():
             print("✅ Status Bar is visible after typing.")
        else:
             print("❌ Status Bar is NOT visible after typing.")

        # Screenshot Status Bar
        page.screenshot(path="verification/status_bar_visible.png")

        # 3. Verify Property Inspector Close Button
        print("Verifying Property Inspector Close Button...")
        # Toggle Inspector Open
        inspector_toggle = page.locator('button[title="Show Properties"]')
        if inspector_toggle.count() > 0:
            inspector_toggle.click()
            time.sleep(0.5)

            # Check for Close Button in Inspector
            close_btn = page.locator('button[title="Close Inspector"]')
            if close_btn.count() > 0:
                print("✅ Close Inspector Button found.")
                close_btn.click()
                time.sleep(0.5)

                # Verify Inspector is closed
                if page.get_by_text("Properties").count() == 0: # "Properties" header in Inspector
                     print("✅ Inspector Closed successfully.")
                else:
                     print("❌ Inspector did NOT close.")
            else:
                print("❌ Close Inspector Button NOT found.")
        else:
             print("⚠️ Inspector Toggle not found.")

        browser.close()

if __name__ == "__main__":
    run()
