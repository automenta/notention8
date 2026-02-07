from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")
        page.wait_for_selector("button[title='New Note']")

        # 1. Click New Note to ensure we have a note selected
        page.get_by_title("New Note").first.click()

        # Check for EditorHeader
        expect(page.get_by_placeholder("Untitled Note")).to_be_visible()

        # 2. Type Slash
        # We need to type into the editor content area.
        # The editor content is usually [contenteditable="true"]
        editor = page.locator("[contenteditable='true']")
        editor.click()
        # Ensure focus and maybe clear
        editor.fill("")
        editor.type("/")

        # 3. Check for Suggestion List
        # Maybe "Job Request" isn't immediately visible if it's not the first item or if exact match isn't working?
        # Slash commands should show a list.
        # Let's check for any known text in suggestion list.
        # "Job Request" is a label in default templates.

        # Wait a bit for popup
        time.sleep(1)

        # Take a screenshot to debug
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/slash_debug.png")

        # Try to find any suggestion item
        # Items are buttons in SuggestionList
        suggestion_items = page.locator("button.block.w-full.text-left")

        count = suggestion_items.count()
        print(f"Found {count} suggestion items")

        if count > 0:
            first_item = suggestion_items.first
            text = first_item.text_content()
            print(f"First item: {text}")
            expect(first_item).to_be_visible()

            page.screenshot(path="verification/slash_commands.png")
            print("Verification successful!")
        else:
            print("No suggestions found")
            raise Exception("No suggestions found")

    except Exception as e:
        print(f"Verification failed: {e}")
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/error_slash.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
