from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_dashboard_widgets(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for dashboard to load
    page.wait_for_selector("header", timeout=10000)

    # Ensure we are on Dashboard
    print("Checking Dashboard widgets...")

    # 1. Recent Notes Widget
    # It should have title "Recent Notes"
    # The Card component renders title in h3.
    # The previous implementation used h2. Card uses h3.
    # We should look for text "Recent Notes"

    recent_notes_title = page.get_by_role("heading", name="Recent Notes")
    expect(recent_notes_title).to_be_visible()
    print("Recent Notes title found.")

    # Check for "View all" button
    view_all_btn = page.get_by_role("button", name="View all", exact=True)
    expect(view_all_btn).to_be_visible()
    print("View all button found.")

    # 2. Smart Input Widget
    # Title "What's on your mind?"
    smart_input_title = page.get_by_role("heading", name="What's on your mind?")
    expect(smart_input_title).to_be_visible()
    print("Smart Input title found.")

    # Check for text area placeholder
    textarea = page.get_by_placeholder("Describe a project")
    expect(textarea).to_be_visible()
    print("Smart Input textarea found.")

    # Take screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/dashboard_widgets.png")

    # 3. Check Settings Tabs alignment (visual check via screenshot mostly, but can check visibility)
    print("Navigating to Settings...")
    # Click Settings nav button
    page.get_by_label("Settings").click()

    # Check AI Tab (default)
    expect(page.get_by_role("heading", name="AI Enhancements")).to_be_visible()

    # Check alignment of Save button (existence check)
    # If API key input is present (remote provider)
    # Depending on default state, might be hidden or disabled.
    # We can select 'Google Gemini' if needed.

    # Just snapshot settings
    page.screenshot(path="/home/jules/verification/settings_ai.png")
    print("Settings AI tab verified.")

    print("All Dashboard Widget checks passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_dashboard_widgets(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/dashboard_failure.png")
            raise
        finally:
            browser.close()
