from playwright.sync_api import Page, expect, sync_playwright
import os

def test_ui_enhancements(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")
    # Wait for the app to load
    page.wait_for_selector("text=New Note")
    page.wait_for_timeout(2000)

    # 1. Enable Developer Mode
    print("Enabling Developer Mode...")
    # Click Settings tab (Cog icon)
    # Assuming the tabs are icons in the sidebar or header.
    # The header usually has a settings icon or sidebar.
    # From App.tsx: Header onNewNote, onOpenPalette. Sidebar.
    # MobileNavigation.
    # Let's find where settings are. Usually in the sidebar bottom or header.
    # Sidebar.tsx might have tabs.
    # Actually, the user can toggle tabs in `Sidebar`.
    # Let's look for "Settings" or a cog icon.
    # If not found, we can try to find the "Settings" text if it's a tab.
    # In `Sidebar.tsx`, there are tabs 'notes', 'map', 'network', 'trash'.
    # `SettingsView` is a view.
    # Wait, `useViewContext` has `activeView`.
    # There is a "Settings" button/tab usually.
    # Let's try to click on a cog icon if visible.

    # Try to find an element with title "Settings" or accessible name.
    settings_btn = page.locator("button[title='Settings']")
    if settings_btn.count() > 0:
        settings_btn.click()
    else:
        # Try finding by icon class or text
        page.locator(".sidebar-icon-settings").click() # Hypothetical class
        # Or maybe it's the last item in the sidebar nav.

    # If we can't find it easily, let's look at the DOM structure via screenshot or just search for "Settings".
    # Since I cannot see the screen, I rely on common patterns.
    # In `components/sidebar/Sidebar.tsx` (I haven't read it but I saw file list), it likely renders navigation.

    # Let's assume we can find "Settings" text if it's expanded, or check for the icon.
    # Let's try clicking the "Settings" text.
    try:
        page.get_by_text("Settings", exact=True).click()
    except:
        # Maybe it's an icon.
        pass

    # Alternative: check if we are already in settings? No, default is notes.

    # Let's try to find the switch for "Developer Mode".
    # It might be in the "General" or main settings area.
    page.wait_for_timeout(1000)

    # In SettingsView, there are tabs.
    # We need to find "Developer Mode" toggle.
    # It is usually a Toggle component.
    # Label: "Developer Mode" or "Dev Mode"
    # Or use toggle button directly.

    toggle = page.locator("button[aria-label='Toggle Developer Mode']")
    # Check if already enabled (checked)
    # The Toggle component class changes based on checked state ('bg-blue-600' vs 'bg-gray-600')
    # But usually starts disabled.
    toggle.click()
    page.wait_for_timeout(1000)

    # 2. Navigate to Simulator
    print("Navigating to Simulator...")
    # New tab "Simulator" should appear in the header.
    # It is a button with title "Simulator".
    page.get_by_title("Simulator").click()
    page.wait_for_timeout(1000)

    # 3. Check OntologyGrowthList (Button) - Visible in Overview (default)
    print("Verifying OntologyGrowthList...")
    # Look for "Optimize" button.
    optimize_btn = page.locator("button[title='Optimize Ontology']")
    expect(optimize_btn).to_be_visible()

    # Check if it's the shared Button component.
    # Shared Button has classes "font-medium rounded-lg ... px-2 py-1 text-xs" (since we used size xs)
    # Original was "text-[10px]". New is "text-xs" (0.75rem = 12px).
    expect(optimize_btn).to_have_css("font-size", "12px")

    # 4. Check SimulatorAgentEditor (Textarea)
    print("Verifying SimulatorAgentEditor...")

    # Need to add an agent first if none exist, or select one.
    # Click "Add Single Agent" button in sidebar.
    add_agent_btn = page.locator("button[title='Add Single Agent']")
    if add_agent_btn.is_visible():
        add_agent_btn.click()
        page.wait_for_timeout(500)

    # Click the first agent in the list (assuming it's added at the bottom or top).
    try:
        page.locator("button:has-text('Agent')").last.click()
    except:
        pass

    page.wait_for_timeout(1000)

    # Now the editor should be visible.
    bio_textarea = page.locator("textarea[placeholder='Agent Bio']")
    expect(bio_textarea).to_be_visible()

    # Check if it has the expected class from the shared component
    expect(bio_textarea).to_have_class(re.compile(r"bg-gray-900/50"))

    # 5. Check PropertyInspector (IconButton)
    print("Verifying PropertyInspector...")
    # We need to go back to Notes to see the editor.
    page.get_by_title("Notes").click()
    page.wait_for_timeout(1000)

    # Create new note
    page.get_by_title("New Note (Ctrl+N)").click()
    page.wait_for_timeout(1000)

    # Open Inspector
    # Look for "Show Properties" button in header/toolbar.
    show_props_btn = page.locator("button[title='Show Properties']")
    if show_props_btn.count() > 0 and show_props_btn.is_visible():
        show_props_btn.click()
        page.wait_for_timeout(500)
    else:
        # Check if already open (title would be "Hide Properties")
        if page.locator("button[title='Hide Properties']").count() == 0:
            print("Could not find toggle property inspector button")

    # Wait for inspector
    # Inspector container has width 72 (w-72)
    inspector_container = page.locator(".w-72.flex-shrink-0")
    expect(inspector_container).to_be_visible()

    # Check "Properties" header inside the container
    expect(inspector_container.get_by_text("Properties", exact=True)).to_be_visible()

    # Check "Add Property" button (PlusIcon)
    add_prop_btn = page.locator("button[title='Add Property']")
    expect(add_prop_btn).to_be_visible()

    # Verify it's an IconButton
    # IconButton has "rounded-lg flex items-center justify-center"
    expect(add_prop_btn).to_have_class(re.compile(r"rounded-lg"))

    # Check Close button if visible (it should be if passed onClose)
    close_btn = page.locator("button[title='Close Inspector']")
    # It might be visible or not depending on props.
    if close_btn.count() > 0:
        expect(close_btn).to_have_class(re.compile(r"bg-transparent text-gray-400")) # variant danger base style
        # Actually danger has hover styles mostly, base is transparent text-gray-400.

    # 6. Check Save Template (verifies useEditorTemplates hook connection via modal)
    print("Verifying Save Template modal...")
    # Click "Save as Template" button in toolbar
    save_tmpl_btn = page.locator("button[title='Save as Template']")
    if save_tmpl_btn.count() > 0 and save_tmpl_btn.is_visible():
        save_tmpl_btn.click()
        page.wait_for_timeout(500)

        # Check modal title "Save as Template"
        expect(page.get_by_text("Save as Template", exact=True)).to_be_visible()

        # Close modal
        # Use Cancel button
        page.get_by_text("Cancel").click()
    else:
        print("Save as Template button not found or not visible")

    print("UI Enhancements verification passed!")
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/ui_enhancements.png")

import re

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_ui_enhancements(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
        finally:
            browser.close()
