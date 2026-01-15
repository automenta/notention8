from playwright.sync_api import sync_playwright

def debug_console():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        page.goto("http://localhost:5173")
        page.wait_for_timeout(3000)

        browser.close()

if __name__ == "__main__":
    debug_console()
