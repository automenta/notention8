from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_full_flow(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # 1. Dashboard
    print("Checking Dashboard...")
    page.wait_for_selector("header", timeout=10000)
    expect(page.get_by_role("heading", name="Recent Notes")).to_be_visible()
    expect(page.get_by_role("heading", name="What's on your mind?")).to_be_visible()

    # 2. Notes / Editor
    print("Creating new note via Smart Input...")
    input_area = page.get_by_placeholder("Describe a project")
    input_area.fill("Test note with property")
    # Click Create Note button
    page.get_by_role("button", name="Create Note").click()

    print("Waiting for Editor...")
    page.wait_for_selector("#note-title-input", timeout=5000)

    # Add Property via Inspector
    print("Opening Inspector...")
    inspector_btn = page.get_by_label("Toggle Property Inspector")
    # Check if active, if not click
    if inspector_btn.get_attribute("aria-pressed") == "false":
        inspector_btn.click()

    print("Adding property...")
    # Click Add Property icon in Inspector
    page.get_by_label("Add Property").click()

    # Fill Property Form
    # Key
    page.get_by_placeholder("Key (e.g. price)").fill("test_prop")
    # Value
    page.get_by_placeholder("Value (comma separated)").fill("123")
    # Save
    page.get_by_title("Save").click()

    # Verify property added in list
    # Use exact=True to avoid matching the editor content which might contain the property tag
    # And we want the one in the Inspector
    # The inspector item has title="test_prop"
    expect(page.locator("div[title='test_prop']")).to_be_visible()
    print("Property added.")

    # Delete Property (Verify Confirmation Modal)
    print("Deleting property...")
    # Need to hover to see delete button?
    # Find the row container. It's a div that contains the title div.
    # The title div has text "test_prop".
    prop_row = page.locator("div[title='test_prop']").locator("..").locator("..")
    # Force visibility or hover
    prop_row.hover()

    # Click Delete (Trash icon)
    # Finding by label "Delete"
    delete_btn = page.get_by_label("Delete")
    delete_btn.click()

    # Verify Modal
    print("Verifying Delete Modal...")
    modal = page.locator("div[role='dialog']") # Assuming Modal uses role dialog, or just find by text
    expect(page.get_by_text("Delete Property?")).to_be_visible()

    # Confirm
    # Click the "Delete" button that is inside the modal (or has specific styling/text)
    # The modal button has text "Delete" and is likely red/danger variant.
    # We can just click the one that is NOT the icon button (which has aria-label).
    # But filtering by modal is safer if we can find it.

    # Let's try locating by text "Delete" that is inside a button tag, and click the LAST one (usually modal is on top).
    # Or specifically the one with "bg-red-500" class if we want to be brittle, or just retry with better locator.

    page.get_by_role("button", name="Delete", exact=True).last.click()

    # Verify Gone
    expect(page.get_by_text("test_prop")).not_to_be_visible()
    print("Property deleted.")

    # Add Location Property for Map Test
    print("Adding Location Property...")
    page.get_by_label("Add Property").click()
    page.get_by_placeholder("Key (e.g. price)").fill("location")
    page.get_by_placeholder("Value (comma separated)").fill("40.7128, -74.0060") # NYC
    page.get_by_title("Save").click()

    # 3. Map View
    print("Navigating to Map...")
    page.get_by_label("Map").click()

    # Verify Map Container (should be visible because we have a point)
    # The Empty State should NOT be visible
    print("Verifying Map...")
    # Give it a moment to render
    page.wait_for_timeout(1000)

    # Check for empty state text
    if page.get_by_text("No Location Notes").is_visible():
        print("FAIL: Map Empty State is visible but should not be.")
        # Debug screenshot
        page.screenshot(path="/home/jules/verification/map_fail.png")
        raise Exception("Map Empty State visible despite having location note.")

    # Check for Leaflet marker (img with class leaflet-marker-icon)
    # Or just leaflet-container
    expect(page.locator(".leaflet-container")).to_be_visible()
    print("Map rendered.")

    # 4. Settings / Ontology
    print("Navigating to Settings -> Ontology...")
    page.get_by_label("Settings").click()

    # Enable Dev Mode if needed (might persist from previous session or reset)
    # We are in a new browser context usually, so likely reset.
    dev_mode = page.get_by_label("Toggle Developer Mode")
    if dev_mode.get_attribute("aria-checked") == "false":
        dev_mode.click()

    page.get_by_text("🧬 Ontology Graph").click()
    expect(page.get_by_role("heading", name="Ontology Graph")).to_be_visible()
    print("Ontology Graph accessible.")

    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/full_flow.png")
    print("Full Flow Verification Passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_full_flow(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/full_flow_failure.png")
            raise
        finally:
            browser.close()
