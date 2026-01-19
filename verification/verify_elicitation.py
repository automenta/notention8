from playwright.sync_api import Page, expect, sync_playwright

def test_missing_property_elicitation(page: Page):
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:5173")

    # Click New Note button
    new_note_btn = page.get_by_role("button", name="New Note (Ctrl+N)")
    if new_note_btn.is_visible():
        new_note_btn.click()
    else:
        # Maybe empty state "Create First Note"
        create_first = page.get_by_role("button", name="Create First Note")
        if create_first.is_visible():
            create_first.click()

    # 2. Act: Type a tag that triggers an ontology node with required attributes.
    # We use #freelance-offer which requires 'role' and 'rate'. 'rate' is a number.
    editor = page.locator(".ProseMirror")
    editor.wait_for()

    # Clear content if any
    editor.clear()

    editor.fill("#freelance-offer ")
    editor.press("Enter")

    # Trigger Auto-tag (Magic)
    magic_btn = page.get_by_title("Magic Align (Auto-generate semantic properties)")
    magic_btn.click()

    # 3. Assert: "Missing: rate" should appear in the header.
    # The header has buttons for missing properties.
    # Look for button with text "+ rate" or similar.
    # The code is `+ {prop}`.
    rate_btn = page.get_by_role("button", name="+ rate")
    expect(rate_btn).to_be_visible(timeout=10000)

    # 4. Act: Click the missing property button.
    rate_btn.click()

    # 5. Assert: Modal opens.
    modal = page.locator("div[role='dialog']") # Assuming Modal has role dialog or similar structure.
    # Checking for "Insert Property" title.
    expect(page.get_by_text("Insert Property")).to_be_visible()

    # 6. Assert: Input is of type number.
    # The modal has an input for value.
    # We expect it to be type="number" because 'rate' is type: 'number'.
    # There are multiple inputs (Key, Value). The Key one is first. The Value one is second.
    # Key should be prefilled with 'rate'.
    key_input = page.locator("input[placeholder='e.g. status, price, deadline']")
    expect(key_input).to_have_value("rate")

    # Value input.
    # In my code: if type is number, render <input type="number" ...>
    # It has placeholder "e.g. 100".
    value_input = page.locator("input[type='number']")
    expect(value_input).to_be_visible()
    expect(value_input).to_have_attribute("placeholder", "e.g. 100")

    # 7. Screenshot
    page.screenshot(path="/home/jules/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_missing_property_elicitation(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
            raise e
        finally:
            browser.close()
