
import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            print("Navigating to home...")
            page.goto("http://localhost:5174")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="verification/sidebar_home.png")

            # Create New Note from Sidebar
            print("Creating New Note from Sidebar...")
            # Look for button with title "New Note (Ctrl+N)"
            new_note_btn = page.locator("button[title='New Note (Ctrl+N)']")
            new_note_btn.click()

            # Wait for editor
            page.wait_for_selector("input[placeholder='Untitled Note']", timeout=5000)
            print("New note created.")
            page.screenshot(path="verification/sidebar_new_note.png")

            # Type something
            page.locator("input[placeholder='Untitled Note']").fill("Sidebar Test Note")

            # Click the editor area to focus it
            page.locator(".ProseMirror").click()
            page.keyboard.type("Some content")

            # Check sidebar list
            print("Checking sidebar list...")
            # Sidebar items have class .note-list-item
            # Wait for "Sidebar Test Note" to appear
            page.get_by_text("Sidebar Test Note").first.click()
            page.screenshot(path="verification/sidebar_updated.png")

            # Delete the note
            print("Deleting note from sidebar...")
            # Find the delete button within the active note item
            # The active note item has extra classes.
            # We can find the button with title "Move to Trash" inside the note item

            # We need to hover first to make delete visible? The CSS says opacity-0 group-hover:opacity-100
            # But we can try forcing click or hover.

            note_item = page.locator(".note-list-item").filter(has_text="Sidebar Test Note").first
            note_item.hover()

            delete_btn = note_item.locator("button[title='Move to Trash']")
            delete_btn.click()

            print("Note deleted.")
            page.wait_for_timeout(500)
            page.screenshot(path="verification/sidebar_deleted.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_sidebar.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
