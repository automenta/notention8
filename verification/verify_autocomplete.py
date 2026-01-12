
from playwright.sync_api import sync_playwright

def verify_autocomplete():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:5173")

            # 2. Click "New Note" to ensure we are in the editor
            page.click("button[title='New Note']")

            # 3. Focus editor
            editor = page.locator("div[contenteditable='true']")
            editor.wait_for()
            editor.click()

            # Clear content
            editor.press("Meta+a")
            editor.press("Backspace")

            # 3. Type '[' to trigger suggestions
            editor.type("[")

            # 4. Verify suggestions appear
            try:
                page.wait_for_selector("text=email", timeout=5000)
                print("Found 'email' suggestion")
            except:
                print("Suggestion list did not appear or 'email' not found.")

            page.screenshot(path="verification/autocomplete_props.png")

            # 5. Type '#'
            editor.press("Escape")
            editor.press("Enter")
            editor.type("#")

            try:
                page.wait_for_selector("text=Person", timeout=5000)
                print("Found 'Person' tag suggestion")
            except:
                print("Tag suggestion list did not appear.")

            page.screenshot(path="verification/autocomplete_tags.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_autocomplete()
