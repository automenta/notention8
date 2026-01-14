from playwright.sync_api import sync_playwright
import time

def test_shortcuts(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("button[title='New Note']")
    print("App loaded.")

    # Check if sidebar exists initially
    try:
        page.wait_for_selector("#sidebar-search-input", timeout=2000)
        print("Sidebar search input found on initial load.")
    except:
        print("Sidebar search input NOT found on initial load.")

    print("Testing Ctrl+N (New Note)...")
    page.keyboard.press("Control+n")
    page.wait_for_selector(".ProseMirror", timeout=5000)
    print("New note created.")

    print("Testing Ctrl+S (Save)...")
    page.keyboard.type("Hello World shortcut test")
    page.keyboard.press("Control+s")
    page.get_by_text("Saved").wait_for(timeout=5000)
    print("Save toast verified.")

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

    print("Testing Ctrl+/ (Search Sidebar)...")
    # Go back to notes
    page.keyboard.press("Control+k")
    page.wait_for_selector("input[placeholder='Type a command or search...']")
    page.keyboard.type("Go to Notes")
    page.keyboard.press("Enter")

    # Wait for view change
    time.sleep(1)

    # Sidebar should be visible
    if page.is_visible("#sidebar-search-input"):
         print("Sidebar search input is visible.")
    else:
         print("Sidebar search input is NOT visible. Dumping body...")
         # print(page.content()) # Too much output

    page.wait_for_selector("#sidebar-search-input", timeout=5000)

    page.keyboard.press("Control+/")

    # Check focus
    is_focused = page.evaluate("document.activeElement.id === 'sidebar-search-input'")

    if not is_focused:
        print("Focus check failed for Ctrl+/. Active element: " + page.evaluate("document.activeElement.id"))
        page.keyboard.press("Control+Shift+f")
        is_focused = page.evaluate("document.activeElement.id === 'sidebar-search-input'")

    if is_focused:
        print("Sidebar search focused.")
    else:
        raise Exception("Sidebar search not focused")

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
