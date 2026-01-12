import time
from playwright.sync_api import sync_playwright

def verify_property_inspector():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Wait for server to start
            time.sleep(5)

            # 1. Navigate to app
            page.goto("http://localhost:5173")

            # Wait for any of the main elements to load, e.g., the Header with navigation buttons
            # We can look for the "Notes" button or "New Note" button.
            # "New Note" has title="New Note"

            page.wait_for_selector("button[title='New Note']")

            # 2. Click "New Note"
            page.get_by_title("New Note").click()

            # 3. Add content with a property
            # Wait for editor to be visible (ProseMirror class)
            page.wait_for_selector(".ProseMirror")

            # Type into editor
            page.locator(".ProseMirror").fill("Test content with [price:is:100]")

            # Wait for debounced save/parse (approx 1s)
            time.sleep(2)

            # 4. Verify Property Inspector shows the property
            # It should show "price" and "100"
            # Inspector is in the DOM.
            page.wait_for_selector("text=price")
            page.wait_for_selector("text=100")

            # 5. Use Inspector to Edit
            # Find the property in inspector and click edit (Pencil icon)
            # The pencil icon is hidden until hover in the group.
            # We locate the div containing "price"

            # We look for a div that contains "price" but is not the editor content
            # The inspector item has class "group relative"
            prop_item = page.locator(".group.relative").filter(has_text="price").first

            if not prop_item.is_visible():
                print("Property item not found in inspector")
                page.screenshot(path="verification/failed_find_prop.png")
                return

            prop_item.hover()

            # Find the pencil button inside it. It uses PencilIcon.
            # We can find button by hierarchy or simple first button in the absolute div
            # The structure is: div.absolute > button > PencilIcon
            prop_item.locator("button").first.click()

            # 6. Change value to 200
            # Wait for input to appear
            page.wait_for_selector("input[placeholder='Value (comma separated)']")

            page.get_by_placeholder("Value (comma separated)").fill("200")

            # Click save (Check icon) - it's the second button (first is X)
            # The buttons are in a flex container at bottom.
            page.locator(".animate-fade-in button").last.click()

            # 7. Verify Editor content updated
            time.sleep(1)
            content = page.locator(".ProseMirror").text_content()
            print(f"Content after edit: {content}")

            if "200" in content and "100" not in content:
                print("SUCCESS: Property updated in text")
            else:
                print("FAILURE: Text not updated correctly")

            # 8. Take screenshot
            page.screenshot(path="verification/property_inspector.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_property_inspector()
