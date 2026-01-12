
from playwright.sync_api import sync_playwright

def verify_ontology_tab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:5173")
            page.wait_for_selector("button[title='New Note']")

            # 2. Go to Settings
            page.click("button[title='Settings']")

            # 3. Enable Developer Mode
            page.locator("text=Developer Mode").wait_for()

            # Use the aria-label from Toggle component
            # Note: Playwright's get_by_label usually works with forms or aria-label
            # But here it's a button.
            # page.get_by_label("Toggle Developer Mode").click() might work.

            # Let's try explicit selector if get_by_label fails or to be safe
            toggle = page.locator("button[aria-label='Toggle Developer Mode']")
            toggle.click()

            # 4. Verify 'Ontology' tab appears
            # Note: I used text="🧬 Ontology" in code, verify exact string
            page.wait_for_selector("text=🧬 Ontology")
            page.click("text=🧬 Ontology")

            # 5. Verify Ontology Graph is present
            page.wait_for_selector("text=Ontology Graph")

            # 6. Interact with the graph
            # Expand 'Entity'
            # Find the li containing "Entity", then the button inside it.
            # We can use xpath or css.
            # //li[div[span[contains(text(), 'Entity')]]]

            entity_node = page.locator("li").filter(has_text="Entity").first
            expand_btn = entity_node.locator("button").first
            expand_btn.click()

            # Check for 'Person' child
            page.wait_for_selector("text=Person")

            # Take screenshot
            page.screenshot(path="verification/ontology_tab.png")
            print("Screenshot taken: verification/ontology_tab.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ontology_tab()
