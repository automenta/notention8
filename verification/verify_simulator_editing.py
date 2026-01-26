from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_simulator(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(3000)

    # 1. Enable Developer Mode
    print("Enabling Developer Mode...")
    page.get_by_role("button", name="Settings").click()
    page.wait_for_timeout(500)

    # Toggle Dev Mode
    dev_toggle = page.get_by_label("Toggle Developer Mode")
    if not dev_toggle.is_checked():
        dev_toggle.click()

    # 2. Navigate to Simulator
    print("Navigating to Simulator...")
    # Simulator button should be in Header now
    page.get_by_role("button", name="Simulator").click()
    page.wait_for_timeout(1000)

    # 3. Add Agent
    print("Adding Agent...")
    # Add Single Agent button (IconButton with PlusIcon)
    # The selector might be tricky. It has title="Add Single Agent"
    page.get_by_title("Add Single Agent").click()

    # 4. Select the new agent (it should be selected automatically or last in list)
    # Let's assume it adds to the list.
    # We can try to click the last agent button in the sidebar.
    # The sidebar buttons have agent names. New agent usually has a default name like "New Agent" or "Random Agent".
    # Or we can just click the "Overview" button and then the agent.
    # Let's see if we can find "New Agent" or similar.
    # Actually, `addAgent` in `useSimulationAgents` likely creates a random agent.
    # Let's just click the *last* button in the sidebar agent list.
    # The sidebar agent buttons are siblings of the "Overview" button? No, they are in a list.

    # Let's wait a bit for agent creation
    page.wait_for_timeout(500)

    # Click the last button in the sidebar that is NOT Overview or Swarm
    # The agent buttons are rendered after the "Agents" label.
    # Let's try to target by text or icon.
    # Or just select "Alice (Client)" if it exists (INITIAL_AGENTS).
    # `INITIAL_AGENTS` are usually loaded.

    print("Selecting Agent...")
    page.get_by_text("Alice (Client)").click()
    page.wait_for_timeout(500)

    # 5. Verify Editor Fields
    print("Verifying Editor Fields...")
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/simulator_editor.png")

    # Check for new fields
    expect(page.get_by_label("Persona (System Prompt)")).to_be_visible()
    expect(page.get_by_label("Goal")).to_be_visible()

    # Try editing
    page.get_by_label("Goal").fill("My new goal")
    expect(page.get_by_label("Goal")).to_have_value("My new goal")

    print("Simulator Editor verified successfully.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            verify_simulator(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="/home/jules/verification/simulator_failure.png")
            raise e
        finally:
            browser.close()
