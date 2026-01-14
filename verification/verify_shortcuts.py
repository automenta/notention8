from playwright.sync_api import sync_playwright
import time

def test_shortcuts(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("button[title='New Note']")
    print("App loaded.")

    # 1. Test Sidebar Navigation
    print("Testing Sidebar Navigation...")

    # Ensure we have at least 2 notes
    print("Creating Note 1...")
    page.keyboard.press("Control+n")
    # Wait for title input
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Note 1 Title")

    # Focus editor
    page.click(".ProseMirror")
    page.keyboard.type("Content 1")

    # Save to update title in sidebar
    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for()

    print("Creating Note 2...")
    page.keyboard.press("Control+n")
    page.wait_for_selector("#note-title-input", timeout=5000)
    page.fill("#note-title-input", "Note 2 Title")

    page.click(".ProseMirror")
    page.keyboard.type("Content 2")

    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for()

    # Focus Sidebar Search
    print("Focusing Sidebar Search...")
    page.keyboard.press("Control+/")
    page.wait_for_selector("#sidebar-search-input:focus", timeout=5000)

    # Arrow Down to first note (Note 2, as it's sorted by date desc)
    print("Navigating to first note...")
    page.keyboard.press("ArrowDown")
    # Check if a note item is focused
    page.wait_for_function("document.activeElement.classList.contains('note-list-item')")
    # Verify it is Note 2
    focused_text = page.evaluate("document.activeElement.innerText")
    if "Note 2 Title" not in focused_text:
         raise Exception(f"Expected Note 2 Title, but got: {focused_text}")
    else:
         print("First note focused correctly.")

    # Arrow Down to second note (Note 1)
    print("Navigating to second note...")
    page.keyboard.press("ArrowDown")
    page.wait_for_function("document.activeElement.classList.contains('note-list-item')")
    focused_text = page.evaluate("document.activeElement.innerText")
    if "Note 1 Title" not in focused_text:
         raise Exception(f"Expected Note 1 Title, but got: {focused_text}")
    else:
         print("Second note focused correctly.")

    # Arrow Up back to first note
    print("Navigating back up...")
    page.keyboard.press("ArrowUp")
    focused_text = page.evaluate("document.activeElement.innerText")
    if "Note 2 Title" not in focused_text:
         raise Exception(f"Expected Note 2 Title, but got: {focused_text}")

    # Arrow Up back to search
    print("Navigating back to search...")
    page.keyboard.press("ArrowUp")
    page.wait_for_selector("#sidebar-search-input:focus", timeout=5000)
    print("Returned to search input.")

    # 2. Test Command Palette (Existing test)
    print("Testing Ctrl+K (Command Palette)...")
    page.keyboard.press("Control+k")
    page.wait_for_selector("input[placeholder='Type a command or search...']", timeout=5000)
    print("Command Palette opened.")

    print("Testing Navigation via Command Palette...")
    page.keyboard.type("Go to Map")
    page.wait_for_timeout(500)
    page.keyboard.press("Enter")
    page.wait_for_selector(".leaflet-container", timeout=5000)
    print("Navigated to Map.")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_shortcuts(page)
            print("Shortcuts verification passed!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/shortcuts_failed.png")
            exit(1)
        finally:
            browser.close()
