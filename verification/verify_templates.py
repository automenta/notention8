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

        print("Clicking Template Button...")
        # Check title "Insert Template"
        tmpl_btn = page.get_by_title("Insert Template")
        tmpl_btn.click()

        print("Waiting for selector...")
        page.wait_for_selector("text=Templates")

        print("Selecting 'Meeting Note'...")
        # Assuming DEFAULT_ONTOLOGY has "Meeting Note"
        page.get_by_text("Meeting Note").click()

        # Wait a bit
        page.wait_for_timeout(1000)

        content = page.locator(".ProseMirror").text_content()
        print("Final Content:", content)

        if "Meeting Note" in content and "startDateTime" in content:
            print("SUCCESS: Template inserted.")
        else:
            print("FAILURE: Template content not found.")

        page.screenshot(path="verification/template_result.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_debug.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
