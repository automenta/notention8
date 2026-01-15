from playwright.sync_api import sync_playwright

def verify_inspector_edit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173")

        # Create Note
        try:
             page.get_by_role("button", name="Create First Note").click()
        except:
             page.locator("button[title='New Note']").first.click()

        page.wait_for_selector("#note-title-input")

        editor = page.locator(".ProseMirror")
        editor.click()
        editor.fill("Testing inspector.\n\n[color:is:blue]\n")
        page.keyboard.press("Control+s")
        page.wait_for_timeout(1000)

        # Open Inspector
        inspector_btn = page.locator("button[title='Show Properties']")
        if inspector_btn.count() > 0:
             inspector_btn.click()

        inspector = page.locator(".bg-gray-900.border-l.w-72")
        inspector.wait_for()

        if inspector.get_by_text("No properties detected").is_visible():
            print("FAILED: No properties detected.")
            return

        prop_row = inspector.locator(".group").first
        prop_row.hover()
        prop_row.locator("button").first.click()

        # Edit input
        val_input = inspector.get_by_placeholder("Value (comma separated)")
        val_input.wait_for()
        val_input.fill("red")
        val_input.press("Enter")

        # Check editor
        page.wait_for_timeout(1000)
        content = editor.text_content()

        if "[color:is:red]" in content:
            print("Property edit verified successfully.")
        else:
            print(f"Property edit failed. Content: {content}")

        page.screenshot(path="verification/inspector_edit_success.png")

        browser.close()

if __name__ == "__main__":
    verify_inspector_edit()
