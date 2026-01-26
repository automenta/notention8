from playwright.sync_api import Page, expect, sync_playwright
import os
import time

def test_enhancements(page: Page):
    print("Navigating to App...")
    page.goto("http://localhost:5173/")

    # Wait for dashboard load
    try:
        page.wait_for_selector("h1", timeout=10000)
    except:
        print("App load timeout")
        page.screenshot(path="/home/jules/verification/timeout.png")
        raise

    print("Checking Dashboard enhancements...")

    # 1. Smart Input
    expect(page.get_by_text("What's on your mind?")).to_be_visible()
    expect(page.get_by_placeholder("Describe a project")).to_be_visible()
    print("Smart Input found.")

    # 2. Quick Actions
    main = page.locator("main")
    expect(main.get_by_role("button", name="Write", exact=True)).to_be_visible()
    expect(main.get_by_role("button", name="Network")).to_be_visible()
    print("Quick Actions 'Write' and 'Network' found.")

    # 3. Navigate to Editor via "Write"
    print("Clicking 'Write'...")
    main.get_by_role("button", name="Write", exact=True).click()

    # Wait for editor
    expect(page.locator(".ProseMirror")).to_be_visible()
    print("Editor loaded.")

    # 4. Open Property Inspector
    print("Opening Property Inspector...")
    # Button title: "Toggle Property Inspector"
    inspector_btn = page.get_by_title("Toggle Property Inspector")
    inspector_btn.click()

    # Wait for Inspector (Sidebar on right)
    expect(page.get_by_text("Properties", exact=True)).to_be_visible() # Inspector title
    print("Property Inspector opened.")

    # 5. Click "Add Property" in Inspector
    print("Clicking Add Property...")
    # Button title: "Add Property" (PlusIcon)
    add_btn = page.get_by_title("Add Property")
    add_btn.click()

    # Wait for Form
    expect(page.get_by_text("New Property")).to_be_visible()
    print("Property Form appeared.")

    # 6. Check Magic Button
    print("Checking Magic Button...")
    magic_btn = page.get_by_role("button", name="Magic", exact=True)
    expect(magic_btn).to_be_visible()

    # 7. Click Magic Button and check Textarea
    magic_btn.click()
    expect(page.get_by_placeholder("Describe property")).to_be_visible()
    print("Magic extraction textarea visible.")

    # Screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/enhancements.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_enhancements(page)
            print("Verification passed!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
            raise e
        finally:
            browser.close()
