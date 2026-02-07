import time
from playwright.sync_api import sync_playwright

def verify_sidebar_ui(page):
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("text=Create First Note", timeout=5000)

    # Create a note with just title
    page.get_by_role("button", name="Create First Note").click()
    page.fill("#note-title-input", "Meeting Notes")
    page.locator(".ProseMirror").click()
    page.keyboard.type("Discussing the new UI features.")
    time.sleep(1) # Wait for save/update

    # Create a note with location
    page.get_by_role("button", name="New Note").first.click()
    page.fill("#note-title-input", "Travel Plan")
    page.locator(".ProseMirror").click()
    page.keyboard.type("Going to [location:is:Paris]")
    time.sleep(1)

    # Create a note with time
    page.get_by_role("button", name="New Note").first.click()
    page.fill("#note-title-input", "Deadline")
    page.locator(".ProseMirror").click()
    page.keyboard.type("Due [date:is:tomorrow]")
    time.sleep(1)

    # Take screenshot of the sidebar
    page.screenshot(path="verification/ui_enhancement_2.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_sidebar_ui(page)
        finally:
            browser.close()
