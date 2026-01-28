from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_hybrid_input(page: Page):
    # 1. Go to the app
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # 2. Wait for the dashboard to load
    print("Waiting for Hybrid Input...")
    # The "Hybrid Input" card header
    expect(page.get_by_text("Hybrid Input")).to_be_visible()

    # 3. Type in the textarea
    print("Typing text...")
    textarea = page.locator("textarea")
    textarea.fill("I need a React Developer for $100")

    # 4. Wait for debounce and extraction
    print("Waiting for extraction...")
    page.wait_for_timeout(3000) # Wait for debounce (800ms) + extraction

    # 5. Assert extraction
    # We expect "Proposed Properties" header
    print("Checking results...")
    expect(page.get_by_text("Proposed Properties")).to_be_visible()

    # Check for inputs containing the extracted values
    expect(page.locator("input[value='price']")).to_be_visible()
    expect(page.locator("input[value='role']")).to_be_visible()
    # "100" might be "100 USD" or "100" depending on extraction
    expect(page.locator("input[value='100 USD']")).to_be_visible()
    expect(page.locator("input[value='React Developer']")).to_be_visible()

    # 6. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/hybrid_input.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser error: {exc}"))

        try:
            verify_hybrid_input(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
