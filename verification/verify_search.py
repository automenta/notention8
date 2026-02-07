from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # 1. Create a Seed Note
        page.get_by_role("button", name="New Note").first.click()
        page.get_by_placeholder("Untitled Note").fill("Cheap Product")
        page.locator(".ProseMirror").fill("This is cheap.\n\n[price:is:50]")
        page.keyboard.press("Control+s")
        time.sleep(1)

        # 2. Create another Seed Note
        page.get_by_role("button", name="New Note").first.click()
        page.get_by_placeholder("Untitled Note").fill("Expensive Product")
        page.locator(".ProseMirror").fill("This is expensive.\n\n[price:is:200]")
        page.keyboard.press("Control+s")
        time.sleep(1)

        # 3. Test Search: [price > 100]
        print("Searching for [price > 100]...")
        page.fill("#sidebar-search-input", "[price > 100]")
        time.sleep(1)

        # Should find "Expensive Product" but not "Cheap Product"
        visible_notes = page.locator(".note-list-item").all_inner_texts()
        print("Visible Notes:", visible_notes)

        if "Expensive Product" in visible_notes[0] and "Cheap Product" not in str(visible_notes):
            print("SUCCESS: Search [price > 100] filtered correctly.")
        else:
            raise Exception(f"FAILURE: Search [price > 100] incorrect results: {visible_notes}")

        # 4. Test Search: [price < 100]
        print("Searching for [price < 100]...")
        page.fill("#sidebar-search-input", "[price < 100]")
        time.sleep(1)

        visible_notes = page.locator(".note-list-item").all_inner_texts()
        print("Visible Notes:", visible_notes)

        if "Cheap Product" in visible_notes[0] and "Expensive Product" not in str(visible_notes):
            print("SUCCESS: Search [price < 100] filtered correctly.")
        else:
            raise Exception(f"FAILURE: Search [price < 100] incorrect results: {visible_notes}")

        browser.close()

if __name__ == "__main__":
    run()
