from playwright.sync_api import sync_playwright
import os

def verify_suggestions():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")

            # Wait for app to load
            page.wait_for_selector("text=What's on your mind?", timeout=10000)

            # Type in smart input
            page.fill("textarea", "Need a React developer for $100")

            # Click create
            page.click("button:has-text('Create Note')")

            # Wait for navigation to note view
            page.wait_for_selector(".ProseMirror", timeout=5000)

            # Wait for SuggestionPanel
            # It has text "AI Suggestions"
            page.wait_for_selector("text=AI Suggestions", timeout=5000)
            print("Suggestion Panel appeared!")

            # Click "Accept All" to see if it updates editor
            # page.click("button:has-text('Accept All')")
            # Wait for content update?
            # page.wait_for_selector("text=[price:is:100]", timeout=2000)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/suggestions.png")
            browser.close()

if __name__ == "__main__":
    verify_suggestions()
