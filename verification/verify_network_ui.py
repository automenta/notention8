from playwright.sync_api import sync_playwright

def verify_network_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173")

        # Use first new note button
        page.locator("button[title='New Note']").first.click()
        page.wait_for_selector("#note-title-input")
        page.fill("#note-title-input", "Badge Test")

        editor = page.locator(".ProseMirror")
        editor.click()
        editor.fill("Content with [badge:is:visible]")
        page.keyboard.press("Control+s")
        page.wait_for_timeout(500)

        # Publish
        page.on("dialog", lambda dialog: dialog.accept())
        page.locator("button[title='Publish to Nostr']").click()
        page.wait_for_timeout(1000)

        # Go to Network
        page.locator("button[title='Network']").click()

        page.wait_for_timeout(3000)

        page.screenshot(path="verification/network_ui.png")
        print("Network UI screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_network_ui()
