from playwright.sync_api import sync_playwright
import os

def verify_suggestions_layout_visual():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")
            page.wait_for_selector("text=What's on your mind?", timeout=10000)
            page.fill("textarea", "Need a React developer for $100")
            page.click("button:has-text('Create Note')")
            page.wait_for_selector("text=Suggestions", timeout=10000)

            # Just take the screenshot for visual confirmation
            print("Taking screenshot...")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/suggestions_visual.png")
            browser.close()

if __name__ == "__main__":
    verify_suggestions_layout_visual()
