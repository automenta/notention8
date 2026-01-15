from playwright.sync_api import sync_playwright

def verify_shortcuts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173")

        # 1. Ctrl+K -> Command Palette
        # Try both Meta and Control for robustness (MacOS vs Linux/Windows)
        # But 'Control' is standard for Linux/Windows which environment likely is.
        page.keyboard.press("Control+k")

        try:
             page.wait_for_selector("input[placeholder='Type a command or search notes...']", timeout=2000)
             print("Ctrl+K verified: Command Palette opened.")
        except:
             print("Ctrl+K failed. Trying Meta+k")
             page.keyboard.press("Meta+k")
             page.wait_for_selector("input[placeholder='Type a command or search notes...']")
             print("Meta+K verified: Command Palette opened.")

        # Close it (Esc)
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)

        # 2. Ctrl+N -> New Note
        page.keyboard.press("Control+n")

        try:
            page.wait_for_selector("#note-title-input", timeout=2000)
            focused = page.evaluate("document.activeElement.id")
            if focused == "note-title-input":
                print("Ctrl+N verified: New note created and title focused.")
            else:
                print(f"Ctrl+N verification WARNING: Focused element is {focused}")
        except:
            print("Ctrl+N failed selector wait.")

        # 3. Ctrl+/ -> Search Sidebar
        page.keyboard.press("Control+/")
        page.wait_for_timeout(500)

        focused = page.evaluate("document.activeElement.id")
        if focused == "sidebar-search-input":
            print("Ctrl+/ verified: Sidebar search focused.")
        else:
            print(f"Ctrl+/ verification FAILED: Focused element is {focused}")

        page.screenshot(path="verification/shortcuts_verified.png")
        browser.close()

if __name__ == "__main__":
    verify_shortcuts()
