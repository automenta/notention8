from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def verify_dashboard(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(3000) # Wait for load

    # Ensure we are on Dashboard (default view)
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/dashboard_initial.png")

    # 1. Verify Quick Actions
    print("Verifying Quick Actions...")
    # Look for "Calendar" button
    calendar_btn = page.get_by_role("button", name="Calendar", exact=True)
    calendar_btn.scroll_into_view_if_needed()
    expect(calendar_btn).to_be_visible()

    # Take screenshot of Quick Actions area specifically if possible, or just another one
    page.screenshot(path="/home/jules/verification/quick_actions.png")

    # 2. Verify Timeline Widget
    print("Verifying Timeline Widget...")
    # Check for Tabs
    # Tabs usually have text "Upcoming" and "History"
    upcoming_tab = page.get_by_role("tab", name="Upcoming")
    history_tab = page.get_by_role("tab", name="History")
    expect(upcoming_tab).to_be_visible()
    expect(history_tab).to_be_visible()

    # Check for "New Event" button
    # It might be in the footer or empty state.
    new_event_btn = page.get_by_role("button", name="New Event")
    expect(new_event_btn).to_be_visible()

    # 3. Test Create Event
    print("Testing Create Event...")
    new_event_btn.click()
    page.wait_for_timeout(2000)

    # Expect to be in Editor (Notes view)
    # Check that we see "New Event" which is the title of the created note
    # Use first=True to pick the first one (likely sidebar or header) or target the editor content
    expect(page.locator(".ProseMirror").get_by_text("New Event")).to_be_visible()

    page.screenshot(path="/home/jules/verification/created_event.png")
    print("Event created successfully.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            verify_dashboard(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
            raise e
        finally:
            browser.close()
