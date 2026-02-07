from playwright.sync_api import sync_playwright, expect
import time

def verify_merge_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        print("Opening Settings...")
        try:
             page.locator(".lucide-settings").first.click()
        except:
             page.get_by_title("Settings").click()

        print("Enabling Developer Mode...")
        try:
             toggle_btn = page.get_by_label("Toggle Developer Mode")
             if "bg-blue-600" not in toggle_btn.get_attribute("class"):
                 toggle_btn.click()
        except Exception as e:
             print(f"Failed to enable developer mode: {e}")

        print("Switching to Ontology Tab...")
        page.get_by_role("button", name="🧬 Ontology").click()

        # Handle dialogs centrally
        def handle_dialog(dialog):
            print(f"Dialog opened: {dialog.message}")
            if "Enter new node ID" in dialog.message:
                dialog.accept("TestNode")
            elif "Enter node label" in dialog.message:
                dialog.accept("TestNode")
            elif "Enter attribute key" in dialog.message:
                dialog.accept("price")
            else:
                dialog.accept()

        page.on("dialog", handle_dialog)

        print("Checking for existing nodes...")
        if page.locator("text=Ontology Graph").is_visible():
             # If empty or we want to ensure TestNode exists
             # But if TestNode already exists, we skip creating
             if page.locator("text=TestNode").count() == 0:
                 print("Creating test node...")
                 page.get_by_text("Add Root Node").click()
                 time.sleep(1)

        print("Adding attribute...")
        # Add attribute to "TestNode"
        # Find the node row
        node_row = page.locator("li", has_text="TestNode").first

        # Hover to reveal buttons
        node_row.hover()

        # Click "Add Attribute" (TagIcon)
        # We need to identify the specific button. It has title "Add Attribute"
        node_row.get_by_title("Add Attribute").click()
        time.sleep(1)

        # Expand node to see attributes
        expand_btn = node_row.locator("button").first
        if "▶" in expand_btn.text_content():
            expand_btn.click()

        print("Opening Merge Modal...")
        # Find the attribute row "price"
        # We need to look for the attribute row specifically inside the expanded node
        # The structure is li -> div (header) + div (children/attrs)
        # Attributes are in div class="ml-8 ..."

        attr_row = page.locator("div.group\\/attr", has_text="price").first
        attr_row.hover()

        # Click Merge button (Purple icon)
        attr_row.get_by_title("Merge/Alias (Conflict Resolution)").click()

        print("Verifying Modal...")
        expect(page.locator("text=Merge Attribute 'price'")).to_be_visible()
        expect(page.locator("text=Upcoming Feature: Voting")).to_be_visible()

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/merge_modal.png")

        print("Verification script finished.")
        browser.close()

if __name__ == "__main__":
    verify_merge_ui()
