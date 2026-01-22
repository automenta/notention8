from playwright.sync_api import sync_playwright, expect
import time

def test_dashboard_stats(page):
    # 1. Navigate to home (Dashboard)
    page.goto("http://localhost:5173")

    # Wait for dashboard to load
    expect(page.get_by_text("Good")).to_be_visible() # Good morning/afternoon/evening

    # Get initial count
    total_notes_label = page.get_by_text("Total Notes", exact=True)
    total_notes_value = total_notes_label.locator("..").locator("p.text-xl")

    initial_count = int(total_notes_value.inner_text())
    print(f"Initial Total Notes: {initial_count}")

    # 2. Create a new note
    # Click "New Note" in sidebar or header
    page.get_by_label("New Note (Ctrl+N)").click()

    # Wait for note view
    expect(page.get_by_placeholder("Untitled Note")).to_be_visible()

    # Go back to Dashboard
    # Use title instead of text because NavButton hides label
    page.get_by_title("Dashboard").click()

    # Verify count increased by 1
    expect(total_notes_value).to_have_text(str(initial_count + 1))
    print(f"Total Notes increased to: {initial_count + 1}")

    # 3. Delete the note
    # Go to Notes view
    page.get_by_title("Notes").click()

    # Ensure list is visible
    expect(page.locator(".note-list-item").first).to_be_visible()

    # Hover first item to show delete button
    first_note = page.locator(".note-list-item").first
    first_note.hover()

    # Click delete (Move to Trash)
    delete_btn = page.get_by_label("Move to Trash").first
    delete_btn.click()

    # Go back to Dashboard
    page.get_by_title("Dashboard").click()

    # Verify count decreased back to initial
    expect(total_notes_value).to_have_text(str(initial_count))
    print(f"Total Notes decreased back to: {initial_count}")

    page.screenshot(path="/home/jules/verification/dashboard_stats.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_dashboard_stats(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/failed_test.png")
            raise
        browser.close()
