from playwright.sync_api import sync_playwright, expect
import time

def verify_property_inspector():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        print("Creating New Note...")
        # Header has "New Note" button with text likely not visible or icon only?
        # Code says: title="New Note" and PlusIcon.

        page.wait_for_timeout(2000)

        # Try finding by title "New Note"
        # The button has title="New Note"
        try:
             page.get_by_title("New Note").click()
        except Exception as e:
             print(f"Click failed: {e}")
             # Try via role button
             # page.locator("button.bg-blue-600").click()
             # Or take screenshot
             page.screenshot(path="/home/jules/verification/debug_header.png")
             pass

        print("Checking Property Inspector...")
        # Should be visible on the right
        try:
             expect(page.locator("text=Properties")).to_be_visible(timeout=5000)
        except:
             print("Properties text not found.")
             page.screenshot(path="/home/jules/verification/debug_inspector_fail.png")
             # It might fail if we didn't switch to 'notes' view or if note selection logic failed.
             # Clicking "New Note" should set activeView='notes' and select new note.
             raise

        print("Adding a property via Inspector...")
        page.get_by_title("Add Property").click()

        # Fill form
        page.get_by_placeholder("Key (e.g. price)").fill("role")
        page.locator("select").select_option("is")
        page.get_by_placeholder("Value").fill("Engineer")

        # Click confirm (CheckIcon)
        # Locate the green button
        page.locator(".text-green-500").click()

        print("Verifying Property added to Inspector List...")
        expect(page.locator("text=role")).to_be_visible()
        expect(page.locator("text=Engineer")).to_be_visible()

        print("Verifying Text updated in Editor...")
        # The editor content should now contain [role:is:Engineer]
        # Tiptap content is inside contenteditable div
        editor_content = page.locator(".ProseMirror").text_content()
        print(f"Editor Content: {editor_content}")

        if "[role:is:Engineer]" in editor_content:
            print("SUCCESS: Text updated.")
        else:
            print("FAILURE: Text not updated.")
            exit(1)

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/property_inspector.png")

        print("Verification script finished.")
        browser.close()

if __name__ == "__main__":
    verify_property_inspector()
