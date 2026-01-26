from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_editor_header(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for app to load
    page.wait_for_selector("header", timeout=10000)

    # Click on "Notes" navigation to ensure we are in Notes view (or just check if we can create a note)
    # Actually, clicking "New Note" button in header should work from anywhere.
    print("Clicking New Note button...")

    # Try finding by label "New Note" (aria-label)
    new_note_btn = page.get_by_label("New Note")
    if not new_note_btn.is_visible():
        # Fallback to Quick Actions "Write" if header button is tricky
        print("Header New Note button not found/visible, trying Quick Actions 'Write'...")
        page.get_by_text("Write").click()
    else:
        new_note_btn.click()

    print("Waiting for Editor...")
    # Wait for title input which has id "note-title-input"
    page.wait_for_selector("#note-title-input", timeout=5000)
    print("Editor loaded.")

    # Check for consolidated buttons in EditorHeader
    print("Verifying Editor Header buttons...")

    # 1. Navigation (might be disabled but present if md:flex)
    # They have titles "Previous Note (Alt+Up)" and "Next Note (Alt+Down)"
    # But they are hidden on mobile. Viewport size 1280x800 should be fine (md is 768px).

    prev_btn = page.locator("button[title='Previous Note (Alt+Up)']")
    expect(prev_btn).to_be_visible()
    print("Previous Note button found.")

    # 2. Toggle Toolbar (ChevronUp/Down) - tooltip "Hide Formatting Toolbar" (default visible)
    toggle_toolbar_btn = page.locator("button[aria-label='Hide Formatting Toolbar']")
    # Or get_by_label
    expect(toggle_toolbar_btn).to_be_visible()
    print("Toggle Toolbar button found.")

    # 3. Toggle Inspector - tooltip "Toggle Property Inspector"
    inspector_btn = page.get_by_label("Toggle Property Inspector")
    expect(inspector_btn).to_be_visible()
    print("Toggle Inspector button found.")

    # 4. Tags - tooltip "Tags"
    tags_btn = page.get_by_label("Tags")
    expect(tags_btn).to_be_visible()
    print("Tags button found.")

    # 5. Help - tooltip "Help & Shortcuts"
    help_btn = page.get_by_label("Help & Shortcuts")
    expect(help_btn).to_be_visible()
    print("Help button found.")

    # 6. Publish - title/text "Publish"
    # It might be icon-only if label is "Publish", so check by title
    publish_btn = page.locator("button[title='Publish']")
    expect(publish_btn).to_be_visible()
    print("Publish button found.")

    # Check Tiptap Toolbar
    print("Verifying Tiptap Toolbar...")

    # 7. Insert Property - now using KeyIcon, tooltip "Insert Property"
    insert_prop_btn = page.get_by_label("Insert Property")
    expect(insert_prop_btn).to_be_visible()
    print("Insert Property button found.")

    # 8. Magic - tooltip "Magic Align (Auto-generate semantic properties)"
    magic_btn = page.get_by_label("Magic Align (Auto-generate semantic properties)")
    # Note: Magic button might only appear if 'onMagic' is passed. EditorManager passes it.
    if magic_btn.is_visible():
        print("Magic button found.")
    else:
        print("Magic button NOT found (maybe AI not enabled or configured?).")

    print("All Editor Header checks passed!")

    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/editor_header.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_editor_header(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/editor_failure.png")
            # Print page content for debugging
            # print(page.content())
            raise
        finally:
            browser.close()
