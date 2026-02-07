from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate
        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Wait for app to load
        try:
            page.wait_for_selector('.ProseMirror, button', timeout=10000)
        except:
            print("Timeout waiting for app to load")
            page.screenshot(path="verification/error_load.png")
            browser.close()
            return

        time.sleep(2)

        # 2. Select a note or create one
        print("Creating a new note...")
        # Header "New Note" button (PlusIcon)
        # It usually has title="New Note"
        new_note_btn = page.locator('button[title="New Note"]')
        if new_note_btn.count() > 0:
            new_note_btn.first.click()
        else:
            # Try finding by icon or role
            print("Could not find New Note button by title, trying loose match")
            page.keyboard.press("Control+n") # shortcut

        time.sleep(1)

        # Type something into the editor
        print("Typing text...")
        editor = page.locator('.ProseMirror')
        if editor.count() == 0:
             print("Editor not found!")
             page.screenshot(path="verification/error_no_editor.png")
             browser.close()
             return

        editor.click()
        page.keyboard.type("This is a test note for verification.")

        time.sleep(1)

        # 3. Verify Bubble Menu
        print("Verifying Bubble Menu...")
        # Select all text to trigger bubble menu
        page.keyboard.press("Control+a")

        time.sleep(1)

        # Check if Bubble Menu appears.
        # Look for the Bold button which is part of the bubble menu
        # We need to distinguish it from the toolbar Bold button.
        # The bubble menu is usually implemented with Tiplpy or a portal,
        # but often it renders a div with specific classes or structure.
        # In Tiptap bubble menu default, it's near the selection.
        # But our code renders <EditorBubbleMenu> -> <BubbleMenu>

        # Let's look for a button with title="Bold". There might be two (Toolbar + Bubble).
        # We expect at least one to be visible. If the toolbar one is always visible,
        # verifying the bubble menu specifically requires checking if a NEW one appears
        # or checking the structure.

        # However, checking if "Bold" is visible is a good start.
        # A better check is finding the bubble menu container.
        # The <BubbleMenu> component usually creates a tippy instance or similar.

        # Let's take a screenshot first to manually verify.
        page.screenshot(path="verification/bubble_menu.png")
        print("Screenshot saved to verification/bubble_menu.png")

        # 4. Verify Command Palette Contextual Commands
        print("Verifying Command Palette...")
        # Open Palette
        page.keyboard.press("Control+k")
        time.sleep(1)

        # Check for "Copy Note ID"
        palette_input = page.locator('input[placeholder*="Type a command"]')
        palette_input.fill("Copy Note ID")
        time.sleep(1)

        copy_cmd = page.get_by_text("Copy Note ID")
        if copy_cmd.count() > 0 and copy_cmd.first.is_visible():
             print("✅ 'Copy Note ID' command found")
        else:
             print("❌ 'Copy Note ID' command NOT found")

        # Check for "Download Note JSON"
        palette_input.fill("Download Note JSON")
        time.sleep(1)

        download_cmd = page.get_by_text("Download Note JSON")
        if download_cmd.count() > 0 and download_cmd.first.is_visible():
             print("✅ 'Download Note JSON' command found")
        else:
             print("❌ 'Download Note JSON' command NOT found")

        # Screenshot Command Palette
        page.screenshot(path="verification/command_palette.png")
        print("Screenshot saved to verification/command_palette.png")

        browser.close()

if __name__ == "__main__":
    run()
