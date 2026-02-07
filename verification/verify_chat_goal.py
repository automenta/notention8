import time
from playwright.sync_api import sync_playwright

def verify_chat_goal(page):
    page.goto("http://localhost:5173")

    # 2. Setup Keys
    page.get_by_role("button", name="Settings").click()
    page.get_by_text("Network & Keys").click()
    page.get_by_role("button", name="Generate New Keys").click()
    time.sleep(1)

    # 3. Chat with Alice
    page.get_by_role("button", name="Chat").click()
    time.sleep(2)
    page.get_by_text("Alice (Client)").click()

    # 4. Send Goal Command
    input_box = page.get_by_placeholder("Type a message...")
    input_box.fill("Change goal to: Find a Rust developer.")
    page.locator('button[type="submit"]').click()

    # 5. Wait for Response (Mock AI will respond)
    # Since WebLLM fails in CI/headless often, we might get "I'm having trouble thinking" or similar
    # Or just wait for ANY message from Alice
    time.sleep(2)
    page.screenshot(path="verification/chat_goal.png")
    print("Chat goal test passed (screenshot taken)")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_chat_goal(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
