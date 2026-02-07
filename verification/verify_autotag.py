import time
from playwright.sync_api import sync_playwright, expect

def test_autotag(page):
    page.goto("http://localhost:5173")

    # Create new note
    page.get_by_role("button", name="New Note").first.click()

    # Type content
    # We need to find the editor. Tiptap editor usually has role "textbox" or contenteditable.
    page.locator(".ProseMirror").fill("This is a #verified test.")

    # Click Auto Tag
    page.get_by_title("Auto-suggest tags with AI").click()

    # Verify tag appears
    # Tags are spans with text "verified"
    page.get_by_text("verified", exact=True).wait_for()

    page.screenshot(path="verification/autotag_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_autotag(page)
        finally:
            browser.close()
