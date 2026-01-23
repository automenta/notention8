from playwright.sync_api import Page, expect, sync_playwright
import os

def test_ui_refactor(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for app to load
    page.wait_for_selector("header", timeout=10000)

    # 1. Verify Dashboard Stats
    # Header has "Dashboard" (first nav item)
    # We might need to click it if not default, but usually it is default or we are there.
    # Just in case:
    # Use get_by_role("link", name="Dashboard") or similar.
    # The NavButton uses aria-label="Dashboard"

    # Try clicking Dashboard just to be sure
    try:
        page.get_by_label("Dashboard").click()
    except:
        print("Could not click Dashboard nav, maybe already there or blocked.")

    print("Verifying Dashboard Stats...")
    # Check for "TOTAL NOTES" label (uppercase in code)
    expect(page.get_by_text("TOTAL NOTES")).to_be_visible()

    # Check for "PINNED" label
    expect(page.get_by_text("PINNED")).to_be_visible()

    print("Dashboard Stats verified.")

    # 2. Verify Editor Loading
    print("Opening Editor...")

    # Click "Write" button (Quick Action)
    # It has text "Write" or aria-label?
    # QuickActionsWidget: <IconButton ... tooltip="Write" ...><PencilIcon /></IconButton>
    # Wait, IconButton uses tooltip as title or aria-label?
    # QuickActionsWidget text is below icon: "Write"

    page.get_by_role("button", name="Write", exact=True).click()

    # Wait for Editor
    # Look for "Untitled Note" (input value) or placeholder "Untitled Note"
    # Note: createNote sets title to "Untitled Note", so it should be the value.
    try:
        expect(page.get_by_display_value("Untitled Note")).to_be_visible()
    except:
        expect(page.get_by_placeholder("Untitled Note")).to_be_visible()

    # Check for Tiptap editor
    expect(page.locator(".ProseMirror")).to_be_visible()

    print("Editor loaded successfully.")

    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/ui_refactor_check.png")
    print("UI Refactor verification passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_ui_refactor(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/ui_refactor_failure.png")
            raise
        finally:
            browser.close()
