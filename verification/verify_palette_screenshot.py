from playwright.sync_api import sync_playwright
import time

def test_shortcuts(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load
    page.wait_for_selector("button[title='New Note']")
    print("App loaded.")

    print("Testing Ctrl+K (Command Palette)...")
    page.keyboard.press("Control+k")
    page.wait_for_selector("input[placeholder='Type a command or search...']", timeout=5000)
    print("Command Palette opened.")

    # Take screenshot of Command Palette
    page.screenshot(path="verification/command_palette.png")
    print("Screenshot saved to verification/command_palette.png")

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
