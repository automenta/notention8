from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate
        print("Navigating to app...")
        page.goto("http://localhost:5173/")
        time.sleep(2)

        # 2. Enable Developer Mode
        print("Enabling Developer Mode...")
        settings_btn = page.locator('button[title="Settings"]')
        if settings_btn.count() > 0:
            settings_btn.click()
        else:
             page.locator('header button').last.click()

        time.sleep(1)

        toggle = page.get_by_label("Toggle Developer Mode")
        if toggle.count() > 0:
            toggle.click()
        else:
             page.get_by_text("Dev Mode").click()

        time.sleep(1)

        # 3. Check Settings Tabs (Simulator should be GONE)
        print("Checking Settings tabs...")
        sim_tab_settings = page.locator('nav').get_by_text("Simulator")
        if sim_tab_settings.count() == 0:
            print("✅ Simulator tab correctly removed from Settings View")
        else:
            print("❌ Simulator tab still present in Settings View")
            # Might be confusion between text content vs role.
            # TabButton uses label prop.

        # 4. Access Simulator via Header
        print("Accessing Simulator via Header...")
        sim_btn = page.get_by_title("Simulator")
        if sim_btn.count() > 0:
            sim_btn.click()
            print("Clicked Simulator button in Header")
        else:
             print("Simulator button not found in Header")
             return

        time.sleep(2)

        # 5. Check "Add Agent" and "Deploy Swarm" buttons
        print("Checking Simulator Sidebar buttons...")

        # Add Agent button has title "Add Agent"
        add_agent_btn = page.locator('button[title="Add Agent"]')
        if add_agent_btn.count() > 0:
            print("✅ Found Add Agent Button")
            add_agent_btn.click()
            time.sleep(1)
            # Verify new agent added (Agents list should grow)
            # We can check for "New Agent" text or "Agent 3" etc
            if page.get_by_text("Agent").count() > 2: # Assuming start with 2
                 print("✅ Agent added successfully")
        else:
            print("❌ Add Agent Button not found")

        swarm_btn = page.locator('button[title="Deploy Swarm"]') # or by text "+ SWARM"
        if swarm_btn.count() > 0:
            print("✅ Found Deploy Swarm Button")
        else:
            print("❌ Deploy Swarm Button not found")

        # 6. Check "Save Note" button in Community Window
        # Need a note first. Import user notes (if any) or wait for agent.
        # Let's try importing.
        import_btn = page.get_by_text("📥 Import My Notes")
        if import_btn.count() > 0:
            import_btn.click()
            time.sleep(1)

            # Since we are in a fresh session, we might not have user notes to import unless we create one.
            # But agents should publish eventually.
            # Start simulator
            start_btn = page.get_by_text("START")
            if start_btn.count() > 0:
                start_btn.click()
                print("Simulator Started")
                time.sleep(5) # Wait for agent to publish

                # Check for Save button (DownloadIcon)
                save_btns = page.locator('button[title="Save to My Notes"]')
                if save_btns.count() > 0:
                    print(f"✅ Found {save_btns.count()} Save Note buttons")
                    save_btns.first.click()
                    print("Clicked Save Note")
                else:
                    print("⚠️ No notes generated yet to save")

        browser.close()

if __name__ == "__main__":
    run()
