from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # 1. Enable Dev Mode (if needed)
        page.get_by_role("button", name="Settings").click()
        toggle = page.get_by_label("Toggle Developer Mode")
        class_attr = toggle.get_attribute("class")
        is_checked = "bg-blue-600" in class_attr
        if not is_checked:
            toggle.click()

        # 2. Go to Network View
        page.get_by_title("Network").click()

        # Check if "Connect Identity" is visible (likely state for fresh start)
        try:
            # wait briefly
            page.wait_for_selector("text=Connect Identity", timeout=5000)
            page.screenshot(path="verification/network_connect.png")
            print("Found Connect Identity screen")
        except:
             # Maybe we are already connected?
             pass

        browser.close()

if __name__ == "__main__":
    verify_frontend()
