from playwright.sync_api import sync_playwright
import time

def test_note_link_screenshot(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("button[title='New Note']")

    # Create Note 1 (Target)
    page.keyboard.press("Control+n")
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Linked Target")
    page.click(".ProseMirror")
    page.keyboard.type("Content")
    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for()

    # Create Note 2 (Source)
    page.keyboard.press("Control+n")
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Source Note")
    page.click(".ProseMirror")
    page.keyboard.type("Here is a link: @Linked Target")
    time.sleep(1)
    page.keyboard.press("Enter")

    page.wait_for_selector(".suggestion-note", timeout=2000)

    # Take screenshot
    page.screenshot(path="verification/note_link.png")
    print("Screenshot saved to verification/note_link.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_note_link_screenshot(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failed.png")
            exit(1)
        finally:
            browser.close()
