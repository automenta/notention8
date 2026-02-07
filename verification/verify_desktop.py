from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating to app (Desktop)...")
        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")

        # Check innerWidth
        width = page.evaluate("window.innerWidth")
        print(f"Window width is: {width}")

        # 1. Sidebar and Editor should both be visible
        print("Checking layout...")
        sidebar = page.locator("div.w-full.md\\:w-\\[320px\\]")
        editor = page.locator("main")

        expect(sidebar).to_be_visible()
        expect(editor).to_be_visible()

        # 2. Check for auto-selection
        # If notes exist, one should be selected.
        # How to check selection?
        # The selected note in sidebar usually has a different background color.
        # But we can check if `selectedNoteId` is set by checking if the editor is showing a note.
        # The editor showing a note implies selection.
        # If no note is selected, MainView shows "Select a note...".
        # If a note is selected, it shows the editor.

        # Let's check if the Tiptap editor is visible.
        tiptap = page.locator(".ProseMirror")
        # Or look for EditorHeader
        header = page.locator("input[placeholder='Note Title']")

        # We need to ensure we have at least one note for auto-select to work.
        note_items = page.locator("div[role='button']").all()
        if len(note_items) == 0:
             print("No notes found. Creating one to test auto-select behavior manually (though auto-select happens on load).")
             page.get_by_role("button", name="New Note").click()
             # After creating, it should be selected.
        else:
             print("Notes found. Verifying auto-selection...")
             # It should have auto-selected the first one.
             expect(header).to_be_visible()

        # 3. Verify NO Back button
        print("Verifying no back button...")
        back_btn = page.get_by_title("Back to List")
        expect(back_btn).to_be_hidden()

        page.screenshot(path="/home/jules/verification/desktop_view.png")
        print("Captured desktop view.")

        browser.close()

if __name__ == "__main__":
    run()
