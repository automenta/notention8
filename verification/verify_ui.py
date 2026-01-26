from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 800})

    try:
        # 1. Navigate
        print("Navigating to home...")
        page.goto("http://localhost:5173")

        # 2. Go to Settings
        print("Going to Settings...")
        page.get_by_title("Settings").click()

        # Verify we are on settings page
        expect(page.get_by_role("heading", name="Settings")).to_be_visible()

        # 3. Enable Developer Mode
        print("Enabling Developer Mode...")

        toggle = page.get_by_label("Toggle Developer Mode")
        expect(toggle).to_be_visible()

        class_attr = toggle.get_attribute("class")
        is_checked = "bg-blue-600" in class_attr

        if not is_checked:
            toggle.click()

        # 4. Go to Simulator
        print("Going to Simulator...")
        simulator_btn = page.get_by_title("Simulator")
        expect(simulator_btn).to_be_visible()
        simulator_btn.click()

        # 5. Verify Simulator Sidebar
        print("Verifying Simulator Sidebar...")
        expect(page.get_by_text("🧪 Simulator")).to_be_visible()
        page.screenshot(path="verification/simulator_sidebar.png")

        # 6. Verify System Dashboard & Community Window
        print("Verifying Dashboard & Community Window...")
        expect(page.get_by_text("SYSTEM EVENTS")).to_be_visible()
        # Use exact=True to avoid ambiguity or use heading role
        expect(page.get_by_text("NETWORK", exact=True)).to_be_visible()
        page.screenshot(path="verification/simulator_overview.png")

        # 7. Verify Agent Editor & Session
        print("Selecting Agent and verifying Editor...")
        page.get_by_text("Alice (Client)").click()

        expect(page.get_by_text("Randomize Identity")).to_be_visible(timeout=5000)
        page.screenshot(path="verification/agent_editor.png")

        # 8. Check Property Inspector (in Notes view)
        print("Checking Property Inspector in Notes view...")
        page.get_by_title("Notes").click()

        # Create new note
        # Use first one found or exact match if possible
        # Or better selector: button inside header
        page.get_by_title("New Note", exact=True).first.click()

        # Open Inspector
        # Assuming there is a toggle button in the toolbar or header
        # In EditorToolbar.tsx: onToggleInspector. Title is "Toggle Property Inspector"
        # It's an icon. Let's find by title.
        inspector_btn = page.get_by_title("Toggle Property Inspector")
        if inspector_btn.is_visible():
            inspector_btn.click()
            expect(page.get_by_text("Properties")).to_be_visible()
            page.screenshot(path="verification/property_inspector.png")

            # Click Add Property
            page.get_by_title("Add Property").click()
            expect(page.get_by_text("New Property")).to_be_visible()
            page.screenshot(path="verification/property_form.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
        raise

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
