from playwright.sync_api import sync_playwright
import time

def test_note_link(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("button[title='New Note']")

    # Create Note 1 (Target)
    print("Creating Target Note...")
    page.keyboard.press("Control+n")
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Target Note")
    page.click(".ProseMirror")
    page.keyboard.type("This is the target content.")
    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for()

    # Create Note 2 (Source)
    print("Creating Source Note...")
    page.keyboard.press("Control+n")
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Source Note")

    page.click(".ProseMirror")

    # Type @Target
    page.keyboard.type("@Target")

    # Wait for suggestion
    # The mention extension renders a popup.
    # We should see "Target Note" in the list.
    # The list items usually have class 'suggestion-item' or 'suggestion-note' depending on config.
    # We configured class 'suggestion-note' for @ mentions.
    # Wait, the popup ITEM class is what matters.
    # In `SuggestionList.tsx`, items are rendered as buttons.
    # But `SuggestionList` is not used directly?
    # Ah, `configureSuggestions.ts` uses `SuggestionList`.
    # Let's check `SuggestionList.tsx` structure if possible.
    # We don't have access to check the DOM of the popup easily unless we know the class.
    # However, we can press Enter to select the first option if it matches.

    time.sleep(1)
    page.keyboard.press("Enter")

    # Check if a link was created.
    # It should be a span with class 'suggestion-note'.
    # We configured HTMLAttributes class: 'suggestion-note'.

    try:
        page.wait_for_selector(".suggestion-note", timeout=2000)
        print("Note link created.")
    except:
        print("Note link NOT created. Trying manual injection for test stability...")
        # If UI interaction fails in headless, fallback to manual injection to test the CLICK handler.
        # Use Code View
        page.click("button[title='Switch to HTML Code']")

        # We need the ID of the Target Note.
        # We can't get it easily.
        # But we can iterate notes?
        # Or just assume we can find it by title in the app?
        # Actually, let's just search for it using Command Palette to get ID? No.

        # We can't easily get the ID of Target Note from here without backend access.
        # But we can try to guess or use the UI.

        # If the @Target worked, it would have the ID.
        # If it didn't, we are stuck.

        # Let's try to assume it worked but maybe didn't render class immediately?
        # Or maybe the suggestion didn't appear.

        raise Exception("Failed to create note link via UI")

    # Save
    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for()

    # Click the link
    print("Clicking the link...")
    # We need to click the element.
    # In Playwright, click will trigger the event.
    page.click(".suggestion-note")

    # Verify we are on Target Note
    # The title input should have "Target Note"
    time.sleep(1)

    title_value = page.input_value("#note-title-input")
    print(f"Current Note Title: {title_value}")

    if title_value == "Target Note":
        print("Verification passed! Navigated to Target Note.")
    else:
        raise Exception(f"Navigation failed. Expected 'Target Note', got '{title_value}'")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_note_link(page)
            print("Note link verification passed!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/note_link_failed.png")
            exit(1)
        finally:
            browser.close()
