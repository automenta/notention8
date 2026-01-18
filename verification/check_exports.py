from playwright.sync_api import sync_playwright

def check_tiptap_exports():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        # We need to load a page that imports tiptap
        page.goto("http://localhost:5173")

        # Inject script to import and log
        # This is tricky because it's a module.
        # But we can inspect the error context.

        page.wait_for_timeout(5000)

        browser.close()

if __name__ == "__main__":
    check_tiptap_exports()
