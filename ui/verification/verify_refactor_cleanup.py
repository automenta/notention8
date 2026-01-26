from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_cleanup_refactor(page: Page):
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
    page.screenshot(path="/home/jules/verification/home_cleanup.png")

    # 1. Check MatchesWidget
    print("Checking for MatchesWidget...")
    expect(page.get_by_text("Network Matches")).to_be_visible()

    if page.get_by_text("No active opportunities.").is_visible():
        print("MatchesWidget: Empty state visible.")
        expect(page.get_by_text("No active opportunities.")).to_be_visible()
    else:
        print("MatchesWidget: Matches found (not empty).")

    # 2. Check RecentNotesWidget
    print("Checking for RecentNotesWidget...")
    expect(page.get_by_text("Recent Notes")).to_be_visible()

    if page.get_by_text("No notes yet. Start writing!").is_visible():
         print("RecentNotesWidget: Empty state visible.")
    else:
         print("RecentNotesWidget: Notes visible.")

    # 3. Check TimelineWidget
    print("Checking for TimelineWidget...")
    expect(page.get_by_text("Timeline")).to_be_visible()

    if page.get_by_text("No upcoming events.").is_visible():
         print("TimelineWidget: Empty state visible.")
    else:
         print("TimelineWidget: Events visible.")

    # 4. Check Select component via SortSelector (in Sidebar)
    print("Checking for SortSelector (Select component)...")
    # It usually has a default value like "Sort: Modified (Newest)"
    # We might need to ensure sidebar is visible.

    # On desktop sidebar should be visible.
    # Check if we can find the select element.

    # Try to find text "Sort: Modified (Newest)" which is the label of an option.
    # Actually the Select value shows the selected option text.

    # We can look for the Select element itself.
    # `SortSelector` renders a `Select` with `className="w-full"`.
    # It has options.

    # Let's try to find the select by its options text.
    expect(page.locator("select").first).to_be_visible()

    # Verify it has the correct classes (approximately)
    # We can't easily check computed styles but we can check if it looks right (screenshot).
    page.screenshot(path="/home/jules/verification/select_component.png")
    print("Select component found and screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_cleanup_refactor(page)
            print("Cleanup refactor verification passed!")
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/cleanup_failure.png")
            raise
        finally:
            browser.close()
