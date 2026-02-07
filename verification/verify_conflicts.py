from playwright.sync_api import sync_playwright

def verify_conflicts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173")

        # 1. Enable Developer Mode to Seed
        page.get_by_title("Settings").click()
        page.get_by_text("Manage your preferences and data.").wait_for()

        dev_toggle = page.get_by_label("Toggle Developer Mode")
        if "bg-blue-600" not in dev_toggle.get_attribute("class"):
            dev_toggle.click()

        # 2. Seed Ontology (price: number)
        try:
             page.get_by_role("button", name="Create First Note").click()
        except:
             page.locator("button[title='New Note']").first.click()

        page.wait_for_selector("#note-title-input")
        page.fill("#note-title-input", "Seed Ontology Note")

        editor = page.locator(".ProseMirror")
        editor.click()
        editor.fill("Seed note.\n\n[price:is:100]\n")
        page.keyboard.press("Control+s")
        page.wait_for_timeout(1000)

        # Verify it's in ontology
        page.locator("button[title='Ontology']").click()
        page.locator(".text-purple-400", has_text="price").wait_for()

        # 3. Disable Developer Mode (Stop Evolution)
        page.get_by_title("Settings").click()
        dev_toggle = page.get_by_label("Toggle Developer Mode")
        if "bg-blue-600" in dev_toggle.get_attribute("class"):
            dev_toggle.click()

        # 4. Create Conflict Note
        page.locator("button[title='New Note']").first.click()
        page.wait_for_selector("#note-title-input")
        page.fill("#note-title-input", "Conflict Note")

        editor.click()
        editor.fill("This is a conflict.\n\n[price:is:abc]\n")
        page.keyboard.press("Control+s")
        page.wait_for_timeout(1000)

        # 5. Enable Developer Mode (View Conflicts)
        page.get_by_title("Settings").click()
        dev_toggle = page.get_by_label("Toggle Developer Mode")
        if "bg-blue-600" not in dev_toggle.get_attribute("class"):
            dev_toggle.click()

        # 6. Check Conflicts Tab
        page.locator("button[title='Ontology']").click()

        # Click "Conflicts" tab
        page.get_by_role("button", name="Conflicts").click()

        page.wait_for_timeout(1000)
        page.screenshot(path="verification/conflict_tab_success.png")

        # Verify conflict is listed
        try:
            page.locator("main").get_by_text("Conflict Note").wait_for(timeout=5000)
            page.locator("main").get_by_text("[price]").wait_for(timeout=5000)
            print("Conflict verification passed.")
        except Exception as e:
            print(f"Conflict verification failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_conflicts()
