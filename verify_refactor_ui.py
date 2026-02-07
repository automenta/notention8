from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_ui_refactor(page: Page):
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    try:
        page.wait_for_selector("header", timeout=10000)
    except:
        print("Header not found. App might have crashed.")
        page.screenshot(path="/home/jules/verification/crash.png")
        raise

    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/home.png")

    header = page.locator("header")
    expect(header.get_by_title("Notes")).to_be_visible()

    # 4. Check Dashboard Matches Widget (First)
    print("Navigating to Dashboard (Home)...")
    # Click Notes button twice to ensure dashboard
    notes_btn = header.get_by_title("Notes")
    notes_btn.click()
    page.wait_for_timeout(500)
    notes_btn.click()
    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/dashboard.png")

    # Verify Matches Widget
    print("Checking Dashboard for Matches Widget...")
    expect(page.get_by_text("Opportunities")).to_be_visible()
    print("Matches Widget found.")

    # 1. Verify Simulator Tab is GONE
    print("Checking Header for Simulator...")
    expect(header.get_by_title("Simulator")).not_to_be_visible()
    print("Simulator tab is correctly missing.")

    # 2. Go to Chat (Check for login prompt if not logged in)
    print("Navigating to Chat...")
    header.get_by_title("Chat").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/chat.png")

    if page.get_by_text("Chat Requires Nostr Account").is_visible():
        print("Chat login prompt visible. Skipping Agent check (requires login).")
    else:
        # 3. Verify 'My Agents' section and 'Add Agent' button
        print("Checking Contact List for Agents...")
        expect(page.get_by_title("Add Agent")).to_be_visible()
        print("Add Agent button is visible.")
        expect(page.get_by_text("My Agents")).to_be_visible()
        print("My Agents section is visible.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_ui_refactor(page)
            print("All UI checks passed!")
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
        finally:
            browser.close()
