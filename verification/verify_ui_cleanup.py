from playwright.sync_api import sync_playwright

def test_ui_cleanup(page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")

    # 2. Go to Settings
    page.get_by_role("button", name="Settings").click()

    # Check that the big "Settings" header is GONE
    # We expect NOT to find an H1 with "Settings" text
    try:
        page.get_by_role("heading", name="Settings", exact=True).wait_for(timeout=2000)
        print("FAIL: Settings header still visible")
    except:
        print("PASS: Settings header removed")

    # Check that tabs are visible
    page.get_by_role("button", name="🤖 AI").wait_for()

    # Check Developer Mode toggle is present
    page.get_by_text("DEV MODE").wait_for()

    # Screenshot Settings
    page.screenshot(path="verification/settings_clean.png")

    # 3. Enable Dev Mode and check Ontology
    page.get_by_label("Toggle Developer Mode").click()
    page.get_by_role("button", name="🧬 Ontology").click()

    # Check Ontology header is gone
    try:
        page.get_by_role("heading", name="Ontology", exact=True).wait_for(timeout=2000)
        print("FAIL: Ontology header still visible")
    except:
        print("PASS: Ontology header removed")

    # Screenshot Ontology
    page.screenshot(path="verification/ontology_clean.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_ui_cleanup(page)
        finally:
            browser.close()
