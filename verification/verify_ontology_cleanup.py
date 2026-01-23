from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_ontology_cleanup(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for app to load
    page.wait_for_selector("header", timeout=10000)

    # Enable Developer Mode
    print("Navigating to Settings...")
    page.get_by_label("Settings").click()

    print("Enabling Developer Mode...")
    # Toggle has label "Toggle Developer Mode" or just "Developer Mode" label text
    # The Toggle component uses aria-label on the button.
    # We should look for the switch.
    dev_mode_toggle = page.get_by_label("Toggle Developer Mode")
    if dev_mode_toggle.get_attribute("aria-checked") == "false":
        dev_mode_toggle.click()
        print("Developer Mode enabled.")
    else:
        print("Developer Mode already enabled.")

    # Navigate to Ontology Graph tab
    print("Switching to Ontology Graph tab...")
    # Tabs labels: "🤖 AI Assistant", "🔑 Network & Keys", "📦 Data Management", "🧬 Ontology Graph"
    page.get_by_text("🧬 Ontology Graph").click()

    # Verify Add Root Node button
    print("Checking Add Root Node button...")
    add_root_btn = page.get_by_role("button", name="Add Root Node")
    expect(add_root_btn).to_be_visible()
    print("Add Root Node button found.")

    # Check for nodes
    # Assuming default ontology has some nodes.
    # We can check for a common one or just look for the tree structure.
    # Let's look for "role" or "intent" or "price" if they exist in default ontology.
    # If empty, we can add one.

    # Let's add a test node to verify the modal and new node rendering
    print("Adding a test node...")
    add_root_btn.click()

    # Input Modal should appear
    # Title "Add Node"
    expect(page.get_by_text("Add Node", exact=True)).to_be_visible()

    # Type "test_node"
    # InputModal uses generic Input component.
    # In OntologyTab, handleAddNode sets label="Node ID (Label will match ID initially)"
    # but does NOT set placeholder.
    # InputModal defaults placeholder to "".
    # So we should look for the Input by Label.

    # Debug: print content to see what's there if needed, or just look by label.
    page.get_by_label("Node ID (Label will match ID initially)").fill("test_node")

    # Confirm
    page.get_by_role("button", name="Confirm").click()

    # Verify "test_node" is visible
    # Use exact match or first() since it appears twice (label and id)
    expect(page.get_by_text("test_node", exact=True).first).to_be_visible()
    print("Test node added.")

    # Verify Action Icons
    # We need to hover over the node row to see icons?
    # The refactored code has `hidden group-hover:flex`.
    # Playwright hover
    print("Hovering over test node...")
    node_row = page.locator("li").filter(has_text="test_node").first
    node_row.hover()

    # Check for Rename, Add Child, Delete, Add Attribute buttons
    # They are IconButtons with tooltips.
    # IconButton uses title attribute if tooltip prop is passed but custom Tooltip component wraps it.
    # Wait, if tooltip prop is used, IconButton does NOT set title attribute on button, it relies on Tooltip component.
    # However, Tooltip component renders children.
    # We can search by icon SVG or just existence of buttons in the actions div.

    # Let's check for the "Add Attribute" button by finding the TagIcon.
    # Or just check that there are 4 buttons in the action group.

    # Better: check for visibility of one of them.
    # The refactor uses `tooltip="Add Attribute"`.
    # The Tooltip component doesn't add a visible label immediately, it adds a div on hover.
    # But we can find the button by the icon or hierarchy.

    # Let's assume there are 4 buttons.
    actions_div = node_row.locator("div.hidden.group-hover\\:flex") # Escaped :
    # Since we hovered, it should be visible (flex).
    expect(actions_div).to_be_visible()

    # Check count of buttons
    buttons = actions_div.locator("button")
    expect(buttons).to_have_count(4)
    print("Node action buttons found.")

    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/ontology_tab.png")
    print("Ontology Tab verification passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_ontology_cleanup(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/ontology_failure.png")
            raise
        finally:
            browser.close()
