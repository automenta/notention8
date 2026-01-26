from playwright.sync_api import sync_playwright
import os
import time

def test_dashboard_widgets():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Wait for dashboard
        page.wait_for_selector('h1:has-text("Good afternoon")', timeout=10000)

        # Scroll to reveal Widgets
        print("Scrolling...")
        page.evaluate("""
            const header = document.querySelector('h1');
            let el = header;
            while (el && getComputedStyle(el).overflowY !== 'auto') {
                el = el.parentElement;
            }
            if (el) {
                el.scrollTop = el.scrollHeight;
            } else {
                window.scrollTo(0, document.body.scrollHeight);
            }
        """)
        time.sleep(1)

        # Screenshot
        output_path = os.path.join(os.getcwd(), "verification/dashboard_refactor_2.png")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        page.screenshot(path=output_path)
        print(f"Screenshot saved to {output_path}")

        browser.close()

if __name__ == "__main__":
    test_dashboard_widgets()
