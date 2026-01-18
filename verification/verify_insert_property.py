from playwright.sync_api import sync_playwright, expect

def verify_insert_property():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Subscribe to console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            # Navigate to app
            page.goto("http://localhost:5173")

            # Wait a bit
            page.wait_for_timeout(2000)

            # Check if root is visible
            if not page.is_visible("#root"):
                print("Root not visible")
                page.screenshot(path="verification/failed_load.png")

            # Wait for New Note button
            new_note_btn = page.get_by_title("New Note").first

            if not new_note_btn.is_visible():
                print("New Note button not found. Saving screenshot.")
                page.screenshot(path="verification/failed_new_note.png")
                # return

            # Create new note
            new_note_btn.click()

            # Wait for editor toolbar
            insert_prop_btn = page.get_by_title("Insert Property")
            expect(insert_prop_btn).to_be_visible()

            # Click insert property
            insert_prop_btn.click()

            # Expect modal
            modal = page.get_by_text("Insert Property", exact=True)
            expect(modal).to_be_visible()

            # Screenshot modal
            page.screenshot(path="verification/insert_property_modal.png")
            print("Screenshot of modal saved to verification/insert_property_modal.png")

            # Fill form
            page.fill("input[placeholder='e.g. status, price, deadline']", "testkey")

            # Select operator. Use a more specific selector
            # The select is inside the modal.
            # We can select it by its content options
            page.locator("select").filter(has_text="is (=)").select_option("is")

            page.fill("input[placeholder='e.g. Active, 100, 2024-01-01']", "testvalue")

            # Click Insert
            page.click("button:has-text('Insert')")

            # Check editor content
            # Tiptap content is usually in .ProseMirror
            editor = page.locator(".ProseMirror")
            expect(editor).to_contain_text("[testkey:is:testvalue]")

            # Screenshot result
            page.screenshot(path="verification/insert_property_result.png")
            print("Screenshot of result saved to verification/insert_property_result.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            # raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_insert_property()
