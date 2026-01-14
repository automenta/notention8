from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")

        # 1. Verify Templates
        print("Verifying Templates UI...")
        # Check label
        templates_label = page.get_by_text("Templates:", exact=True)
        expect(templates_label).to_be_visible()

        # Check buttons
        job_btn = page.get_by_text("💼")
        expect(job_btn).to_be_visible()
        print("Templates UI verified.")

        # 2. Verify Property Inspector Toggle
        print("Verifying Property Inspector Toggle...")

        # Click a template to ensure we are in editor mode
        job_btn.click()

        toggle_btn = page.get_by_title("Show Properties")
        expect(toggle_btn).to_be_visible()

        # Verify inspector is NOT visible.
        # It should contain text "Properties" and "No properties detected" or similar.
        # But if it's hidden (not rendered), searching for text inside it will fail or find nothing.
        # Let's verify that the text "No properties detected" is NOT visible.
        # Note: If properties are pre-filled by template, we might see them.
        # The template has [role:is:Software Engineer]. So we might see properties.
        # So "No properties detected" might not be there.
        # But the header "Properties" (with TagIcon) should be there if inspector is open.

        # Search for the "Properties" header specifically in the inspector.
        # There is likely a "Properties" text node.
        # Use a specific locator for the inspector container if possible.
        # Or just verify text "Properties" that is NOT the button title.

        # We can look for the inspector root div class: "bg-gray-900 border-l border-gray-700/50 w-72"
        # Playwright CSS selector for exact classes is tricky if order differs, but partial class matching works.
        inspector = page.locator("div.w-72.border-l")

        expect(inspector).to_be_hidden()

        print("Inspector hidden by default verified.")

        # Click toggle
        print("Toggling inspector...")
        toggle_btn.click()

        # Verify inspector IS visible
        expect(inspector).to_be_visible()

        # Verify button title changed
        expect(page.get_by_title("Hide Properties")).to_be_visible()

        print("Inspector toggle verified.")

        page.screenshot(path="/home/jules/verification/ui_tweaks_passed.png")
        print("Screenshot captured.")

        browser.close()

if __name__ == "__main__":
    run()
