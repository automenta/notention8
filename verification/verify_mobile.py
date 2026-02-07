from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")

        # Check innerWidth
        width = page.evaluate("window.innerWidth")
        print(f"Window width is: {width}")

        print("Checking initial state...")
        sidebar = page.locator("div.w-full.md\\:w-\\[320px\\]")
        expect(sidebar).to_be_visible()

        # Select note
        print("Selecting a note...")
        note_items = page.locator("div[role='button']").all()
        if len(note_items) > 0:
             page.locator("div[role='button']").first.click()
        else:
             print("No notes found, creating new note...")
             page.get_by_role("button", name="New Note").click()

        # Verify Detail View
        print("Verifying detail view...")
        expect(sidebar).to_be_hidden()
        editor = page.locator("main")
        expect(editor).to_be_visible()

        # Find Back Button
        print("Looking for back button...")
        back_btn = page.get_by_title("Back to List")
        expect(back_btn).to_be_visible()

        # Click Back
        print("Clicking back button...")
        back_btn.click()

        # Wait a bit
        page.wait_for_timeout(1000)

        # Debug screenshot
        page.screenshot(path="/home/jules/verification/mobile_debug_after_back.png")

        # Verify return to list
        print("Verifying return to list...")
        expect(sidebar).to_be_visible()

        browser.close()

if __name__ == "__main__":
    run()
