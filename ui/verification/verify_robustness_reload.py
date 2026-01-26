from playwright.sync_api import sync_playwright
import os

def verify_robustness_reload():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")

            # 1. Create Note & Generate Suggestions
            page.click("button:has-text('Write')")
            page.wait_for_selector(".ProseMirror", timeout=5000)

            # Type something
            page.fill(".ProseMirror", "Need a plumber for $200.")

            # Trigger Magic (Slash)
            page.type(".ProseMirror", "/")
            page.click("text=Magic Align")

            # Wait for suggestions to appear
            page.wait_for_selector("text=Suggestions", timeout=10000)

            # Verify suggestion content (e.g. price)
            page.wait_for_selector("text=price", timeout=5000)
            print("Suggestions generated.")

            # 2. Reload Page
            print("Reloading page...")
            page.reload()

            # 3. Verify Persistence
            # Should be back on the note view (URL routing) or we navigate there.
            # Assuming URL persists or last view persists.
            # If not, navigate to note.

            page.wait_for_selector(".ProseMirror", timeout=10000)

            # Check if Suggestions panel is still there
            page.wait_for_selector("text=Suggestions", timeout=10000)
            page.wait_for_selector("text=price", timeout=5000)
            print("PASS: Suggestions persisted after reload!")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/robustness_reload.png")
            browser.close()

if __name__ == "__main__":
    verify_robustness_reload()
