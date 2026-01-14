from playwright.sync_api import sync_playwright
import time

def test_shortcuts(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("button[title='New Note']")

    # Create Note
    page.keyboard.press("Control+n")
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Focus Test Note")
    page.click(".ProseMirror")
    page.keyboard.type("Content")
    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for()

    # Focus Sidebar Search
    page.keyboard.press("Control+/")

    # Arrow Down to first note
    page.keyboard.press("ArrowDown")

    # Take screenshot of Sidebar with focused item
    # We can screenshot just the sidebar or the whole page
    page.screenshot(path="verification/sidebar_focus.png")
    print("Screenshot saved to verification/sidebar_focus.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_shortcuts(page)
            print("Verification passed!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failed.png")
            exit(1)
        finally:
            browser.close()
