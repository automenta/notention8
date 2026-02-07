from playwright.sync_api import Page, expect, sync_playwright
import os

def test_settings_tabs(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for app load
    page.wait_for_selector("header", timeout=10000)

    # 1. Navigate to Settings
    # Assuming there's a settings button or way to get there.
    # In Header.tsx, typically there is a user icon or settings icon.
    # Let's check Header.tsx... it seems settings view is 'settings'.
    # If there is no direct link in header, we might need to rely on command palette or URL if routing existed (it doesn't seem to fully).
    # But wait, Sidebar often has settings. Or Header.

    # Let's try to find a settings button.
    # If not found, we can use the "Quick Actions" if one exists, or try to click the User Avatar?
    # Actually, let's just use the Command Palette or similar if available, OR
    # check if there is a 'Settings' button.

    # Looking at Header, it usually has navigation.
    # If not, let's assume we can click a "Settings" tab in the Sidebar if it exists.
    # The Sidebar has "Dashboard", "Notes", "Network", "Chat", "Map", "Calendar", "Simulator", "Trash".
    # And "Settings" is usually at the bottom.

    print("Clicking Settings in Sidebar...")
    # Sidebar usually has a settings link/button.
    # Let's try to find it by text or icon.
    try:
        page.get_by_text("Settings").click()
    except:
        # Maybe it's an icon? CogIcon?
        # Let's try aria-label "Settings"
        page.get_by_label("Settings").click()

    # 2. Verify Tabs exist
    print("Verifying Settings Tabs...")
    # Tabs are: "🤖 AI Assistant", "🔑 Network & Keys", "📦 Data Management"
    expect(page.get_by_text("AI Assistant")).to_be_visible()
    expect(page.get_by_text("Network & Keys")).to_be_visible()
    expect(page.get_by_text("Data Management")).to_be_visible()

    # Ontology tab only if developer mode is on.
    # Let's turn it on if we need to verify Ontology tab.
    # Check for "Developer Mode" toggle
    dev_mode_toggle = page.get_by_label("Toggle Developer Mode")
    if not dev_mode_toggle.is_checked():
        dev_mode_toggle.check()

    expect(page.get_by_text("Ontology Graph")).to_be_visible()

    # 3. Check Data Tab
    print("Switching to Data Tab...")
    page.get_by_text("Data Management").click()
    # Verify "Backup & Restore" section (from ImportExportSection)
    expect(page.get_by_text("Backup & Restore")).to_be_visible()

    # 4. Check Nostr Tab
    print("Switching to Nostr Tab...")
    page.get_by_text("Network & Keys").click()
    # Verify "Nostr Identity" and "Network Relays" (from RelayManagementSection)
    expect(page.get_by_text("Nostr Identity")).to_be_visible()
    expect(page.get_by_text("Network Relays")).to_be_visible()

    # 5. Check Ontology Tab
    print("Switching to Ontology Tab...")
    page.get_by_text("Ontology Graph").click()
    # Verify "Ontology Graph" and "Add Root Node" button
    expect(page.get_by_text("Ontology Graph").nth(1)).to_be_visible() # nth(1) because tab label matches title
    expect(page.get_by_role("button", name="Add Root Node")).to_be_visible()

    print("Settings refactor verification passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_settings_tabs(page)
        except Exception as e:
            print(f"Test failed: {e}")
            raise
        finally:
            browser.close()
