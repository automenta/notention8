from playwright.sync_api import sync_playwright
import os

def verify_slash_commands():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")

            # Wait for app to load
            page.wait_for_selector("text=What's on your mind?", timeout=10000)

            # Create a new note to enter editor
            page.click("button:has-text('Write')")

            # Wait for editor
            page.wait_for_selector(".ProseMirror", timeout=5000)

            # Type "/" to trigger slash command
            page.type(".ProseMirror", "/")

            # Wait for suggestion list
            page.wait_for_selector(".suggestion-slash", state="hidden") # Tiptap renders it but maybe the popup is different
            # The popup usually has a specific class from SuggestionList.tsx
            # It uses a portal or absolute positioning.
            # Look for text "Magic Align" which should be in the menu
            page.wait_for_selector("text=Magic Align", timeout=5000)
            print("Slash menu appeared!")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path="/home/jules/verification/slash_commands.png")
            browser.close()

if __name__ == "__main__":
    verify_slash_commands()
