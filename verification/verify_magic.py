from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Capture console logs
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

    try:
        print("Navigating...")
        page.goto("http://localhost:5173")

        print("Waiting for 'Notes'...")
        page.wait_for_selector("text=Notes", timeout=20000)

        print("Clicking New Note...")
        page.get_by_title("New Note").click()

        print("Waiting for editor...")
        page.wait_for_selector(".ProseMirror", timeout=10000)

        print("Typing...")
        page.locator(".ProseMirror").fill("My email is test@example.com")

        print("Clicking Magic Button...")
        magic_btn = page.get_by_title("Magic Align (Auto-generate semantic properties)")

        # Setup dialog handler
        page.on("dialog", lambda dialog: dialog.accept())

        magic_btn.click()

        print("Waiting for result...")
        page.wait_for_timeout(3000)

        page.screenshot(path="verification/magic_result.png")

        content = page.locator(".ProseMirror").text_content()
        print("Final Content:", content)

        if "[email:is:test@example.com]" in content:
            print("SUCCESS: Magic Align worked!")
        else:
            print("FAILURE: Magic Align tag not found.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_debug.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
