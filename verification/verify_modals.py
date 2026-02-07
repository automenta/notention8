import time
from playwright.sync_api import sync_playwright

def verify_modals(page):
    page.goto("http://localhost:5173")

    # 1. Open Help Modal
    page.wait_for_selector("text=Create First Note", timeout=5000)
    page.get_by_role("button", name="Create First Note").click()
    page.fill("#note-title-input", "Modal Test")

    # Click Help in Editor Header
    page.get_by_title("Help & Syntax").click()
    page.wait_for_selector("text=Notention Help")
    time.sleep(0.5)
    page.screenshot(path="verification/ui_help_modal.png")
    # The modal seems stuck or overlay persists?
    # Let's try to reload page to clear state if modal refuses to close in test env
    page.reload()
    # Don't wait for "Create First Note", just wait for any note loading signal or check buttons
    time.sleep(2)

    # 2. Open Time Picker
    # Need to create note again since we reloaded. Use general New Note button if First Note not available?
    # If app state persisted via localForage, we might not see "Create First Note".
    # Try finding "New Note" (plus icon) in header.

    if page.get_by_role("button", name="Create First Note").is_visible():
        page.get_by_role("button", name="Create First Note").click()
    else:
        page.get_by_role("button", name="New Note").first.click()

    page.fill("#note-title-input", "Modal Test 2")
    page.get_by_title("Show Properties").click()
    page.get_by_title("Add Property").click()
    page.get_by_placeholder("Key (e.g. price)").fill("deadline")
    # The title passed to TimePickerModal is dynamic now?
    # In EditorManager.tsx: title={`Pick Time for ${pickingTimeKey}`}
    # So it should be "Pick Time for deadline"
    page.get_by_title("Pick date/time").click()
    page.wait_for_selector("text=Pick Time for deadline")
    time.sleep(0.5)
    page.screenshot(path="verification/ui_time_picker.png")
    page.get_by_role("button", name="Cancel").click()

    # 3. Trigger Delete Modal
    # We need to delete the note.
    # Sidebar "Delete" button requires the note to be hovered or selected?
    # Actually, we can click the Trash icon in the sidebar for the selected note.
    # The note list item has trash icon.
    # Let's target the trash icon for "Modal Test" note.
    # Since it's selected, it should be visible.

    # Hover over the note item to be safe, though selected state shows buttons now.
    page.locator(".note-list-item").first.hover()
    page.get_by_title("Move to Trash").first.click()

    # Toast appears, but modal only appears for "Permanent Delete" from Trash view.
    # Let's go to Trash view.
    page.keyboard.press("Alt+t") # Shortcut for trash? No standard one.
    # Use Command Palette to go to Trash
    page.keyboard.press("Control+k")
    time.sleep(1) # wait for command palette
    page.get_by_placeholder("Type a command...").fill("Trash")
    page.keyboard.press("Enter")

    time.sleep(0.5)
    # Now in Trash view. Click Delete Forever on the note.
    page.locator(".note-list-item").first.hover()
    page.get_by_title("Delete Permanently").first.click()

    page.wait_for_selector("text=Permanently Delete Note")
    time.sleep(0.5)
    page.screenshot(path="verification/ui_confirm_modal.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_modals(page)
        finally:
            browser.close()
