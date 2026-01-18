import time
from playwright.sync_api import sync_playwright

def verify_full(page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

    # 1. Navigate
    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000)

    # 2. Setup Keys
    print("Setting up keys...")
    page.get_by_role("button", name="Settings").click()
    page.wait_for_timeout(1000)
    page.get_by_text("Network & Keys").click()
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="Generate New Keys").click()
    page.wait_for_timeout(2000)

    # 3. Check Chat View
    print("Checking Chat View...")
    page.get_by_role("button", name="Chat").click()
    page.wait_for_timeout(3000) # Wait for initial nostr sub

    # Check Alice
    alice = page.get_by_text("Alice (Client)")
    if alice.count() > 0:
        print("Found Alice!")
        alice.first.click()
        page.wait_for_timeout(2000)

        # Take screenshot of Chat with Alice selected
        page.screenshot(path="verification/chat_alice_selected.png")

        # Type message
        page.get_by_placeholder("Type a message...").fill("Hello Agent")
        # Click send (it's the only button in the form usually, or has an icon)
        # Use locator for the send button
        page.locator('button[type="submit"]').click()

        page.wait_for_timeout(2000)
        page.screenshot(path="verification/chat_alice_message_sent.png")
    else:
        print("Alice not found in list")
        page.screenshot(path="verification/chat_list_empty.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_full(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
