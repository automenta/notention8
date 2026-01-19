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
        # Try Header "New Note" button
        # It usually has title="New Note"
        new_note_btn = page.locator('button[title="New Note"]')
        if new_note_btn.count() > 0:
            new_note_btn.first.click()
        else:
             page.keyboard.press("Control+n")

        time.sleep(1)

        # 1. Verify Default State (Tags hidden)
        print("Verifying Tags hidden by default...")
        # Look for the toggle button
        toggle_btn = page.locator('button[title="Add/Edit Tags"]')

        if toggle_btn.count() == 0:
            print("❌ Toggle Tags button not found!")
        else:
            print("✅ Toggle Tags button found.")

        # Tag input container should NOT be visible
        # The input inside it has placeholder="Add tags..."
        tag_input = page.get_by_placeholder("Add tags...")
        if tag_input.is_visible():
             print("❌ Tag Input is visible by default (should be hidden)")
        else:
             print("✅ Tag Input is hidden by default.")

        # Screenshot Hidden State
        page.screenshot(path="verification/tags_hidden.png")

        # 2. Verify Toggle functionality
        print("Clicking Toggle Tags button...")
        toggle_btn.click()
        time.sleep(0.5)

        if tag_input.is_visible():
             print("✅ Tag Input is visible after toggle.")
        else:
             print("❌ Tag Input is still hidden after toggle.")

        # Verify Auto Focus
        # We can check if the element is focused
        focused = page.evaluate("document.activeElement === document.querySelector('input[placeholder=\"Add tags...\"]')")
        if focused:
             print("✅ Tag Input is focused.")
        else:
             print("⚠️ Tag Input is NOT focused.")

        # Screenshot Visible State
        page.screenshot(path="verification/tags_visible.png")

        # 3. Add a tag and verify persistence
        print("Adding a tag...")
        tag_input.fill("test-tag")
        tag_input.press("Enter")
        time.sleep(0.5)

        # Now hiding tags (toggle again)
        # Wait, the logic is: setIsTagInputVisible(tags.length > 0) was NOT the logic.
        # The logic was: const [isTagInputVisible, setIsTagInputVisible] = useState(tags.length > 0);
        # So if I add a tag, the state doesn't automatically change to keep it open?
        # Well, it stays open because I toggled it open.
        # But if I navigate away and back?

        # Let's just check the UI with a tag.
        page.screenshot(path="verification/tags_populated.png")

        browser.close()

if __name__ == "__main__":
    run()
