import time
from playwright.sync_api import sync_playwright

def test_simulator_chat(page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")

    # 2. Setup Nostr Keys via Settings
    page.get_by_role("button", name="Settings").click()
    page.get_by_text("Network & Keys").click()
    page.get_by_role("button", name="Generate New Keys").click()
    time.sleep(1)

    # 3. Enable Developer Mode (if not already)
    try:
        page.get_by_label("Toggle Developer Mode").click()
    except:
        pass

    # 4. Navigate to Chat
    page.get_by_role("button", name="Chat").click()

    # 5. Check for Agent (Alice)
    # Wait for loading
    page.wait_for_timeout(2000)

    alice_contact = page.get_by_text("Alice (Client)")
    alice_contact.click()

    page.wait_for_timeout(1000)

    # 6. Send Message
    input_box = page.get_by_placeholder("Type a message...")
    input_box.fill("Hello Alice!")
    page.get_by_role("button", type="submit").click()

    # 7. Wait for reply
    # Reply should contain "I received your message"
    page.wait_for_selector("text=I received your message", timeout=10000)

    # 8. Screenshot
    page.screenshot(path="verification/simulator_chat.png")
    print("Verification successful!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_simulator_chat(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/simulator_chat_failed.png")
            raise e
        finally:
            browser.close()
