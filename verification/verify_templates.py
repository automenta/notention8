from playwright.sync_api import sync_playwright, expect
import time

def verify_templates_and_inspector():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        print("Checking Sidebar Templates...")
        # Should find "Start with Template"
        expect(page.locator("text=Start with Template")).to_be_visible()

        print("Clicking a Template...")
        # Click "Job Request"
        page.get_by_text("Job Request").click()

        print("Checking Editor Content...")
        # Editor content should have #job #request
        page.wait_for_timeout(1000)
        content = page.locator(".ProseMirror").text_content()
        print(f"Content: {content}")

        if "role:is:Software Engineer" not in content:
             print("Template content not found!")
             exit(1)

        print("Checking Property Inspector...")
        # Since template has properties, Inspector should show them
        expect(page.locator("text=Properties")).to_be_visible()
        expect(page.locator("text=Software Engineer")).to_be_visible()

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/template_inspector.png")

        print("Verification script finished.")
        browser.close()

if __name__ == "__main__":
    verify_templates_and_inspector()
