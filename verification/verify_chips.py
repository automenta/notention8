from playwright.sync_api import Page, expect, sync_playwright

def test_missing_property_elicitation(page: Page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))
    page.goto("http://localhost:5173")

    # Wait for the app to load - check for sidebar or main layout
    try:
        page.wait_for_selector("nav", timeout=15000)
    except:
        print("Nav not found, checking for dashboard...")

    # Handle "Create First Note" vs "New Note"
    # We might be on the dashboard or in an empty state
    try:
        # Try to find the New Note button (primary action)
        new_note_btn = page.locator("button[title='New Note (Ctrl+N)']")
        if new_note_btn.is_visible(timeout=5000):
            new_note_btn.click()
            print("Clicked New Note button")
        else:
            # Maybe 'Create First Note' CTA?
            create_first = page.get_by_role("button", name="Create First Note")
            if create_first.is_visible(timeout=5000):
                create_first.click()
                print("Clicked Create First Note button")
            else:
                 # Fallback: try keyboard shortcut
                 print("Using keyboard shortcut")
                 page.keyboard.press("Control+n")
    except Exception as e:
        print(f"Navigation error: {e}")
        page.keyboard.press("Control+n")

    editor = page.locator(".ProseMirror")
    editor.wait_for(state="visible", timeout=30000)

    editor.clear()
    editor.fill("#freelance-offer ")
    editor.press("Enter")

    # Trigger Magic to ensure tags are parsed and missing properties are calculated
    magic_btn = page.get_by_title("Magic Align (Auto-generate semantic properties)")
    if magic_btn.is_visible():
        magic_btn.click()
        print("Clicked Magic button")
    else:
        # If magic button is hidden (e.g. inside a menu or toolbar is hidden), try to toggle it or use shortcut
        # Attempt to ensure toolbar is visible
        toggle_toolbar = page.locator("button[title='Show Formatting Toolbar']")
        if toggle_toolbar.is_visible():
            toggle_toolbar.click()
            magic_btn.click()

    # Wait for Missing Properties to appear
    # The container usually has 'Missing:' text
    missing_label = page.get_by_text("Missing:")
    missing_label.wait_for(timeout=10000)

    rate_btn = page.get_by_role("button", name="+ rate")
    expect(rate_btn).to_be_visible(timeout=10000)
    rate_btn.click()

    expect(page.get_by_text("Insert Property")).to_be_visible()

    value_input = page.locator("input[type='number']")
    value_input.fill("150")

    insert_btn = page.locator("button[type='submit']").filter(has_text="Insert")
    insert_btn.click()

    # Wait a bit
    page.wait_for_timeout(1000)

    # Verify the chip is inserted using the class rendered by Tiptap/ReactNodeView
    # The output HTML shows class "node-property" on the wrapper
    # Use .first to avoid strict mode violation if wrapper and inner duplicate the class
    chip = page.locator(".node-property").first
    expect(chip).to_be_visible()
    expect(chip).to_contain_text("rate")
    expect(chip).to_contain_text("150")

    # Verify that the "Missing: + rate" hint disappears
    # This confirms the system parsed the new property chip correctly
    print("Verifying 'Missing' label disappearance...")
    # The button shouldn't exist anymore or shouldn't be visible
    expect(rate_btn).not_to_be_visible(timeout=5000)

    page.screenshot(path="verification/verification_chips_success.png")
    print("Test passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_missing_property_elicitation(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/failure_chips_final.png")
            raise e
        finally:
            browser.close()
