from playwright.sync_api import sync_playwright

def verify_ui_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173")

        # 1. Verify Editor Header
        try:
             page.get_by_role("button", name="Create First Note").click()
        except:
             pass

        page.wait_for_selector("#note-title-input")
        title_input = page.locator("#note-title-input")
        editor_header = page.locator("div.bg-gray-900.border-b.border-gray-700\/50").filter(has=title_input)

        if editor_header.count() > 0:
            editor_header.screenshot(path="verification/editor_header_fixed.png")
            print("Editor Header screenshot taken.")

        # 2. Verify Settings View
        page.get_by_title("Settings").click()

        # Wait for "Settings" title
        page.get_by_text("Manage your preferences and data.").wait_for()

        settings_view = page.locator(".bg-gray-800\/50.rounded-lg")
        settings_view.screenshot(path="verification/settings_view.png")
        print("Settings View screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ui_changes()
