import time
from playwright.sync_api import sync_playwright

def verify_usability(page):
    page.goto("http://localhost:5173")

    # 1. Clear Local Storage to simulate fresh user
    # localforage might not be on window directly or loaded yet.
    # Try indexedDB delete
    page.evaluate("indexedDB.deleteDatabase('notention')")
    page.evaluate("localStorage.clear()")
    page.reload()

    # Wait for either Create First Note or list to load (might be empty)
    # If notes exist (from previous tests not cleared correctly), we might see them.
    # But deleteDatabase should work.
    try:
        page.wait_for_selector("text=Create First Note", timeout=5000)
    except:
        # If timeout, maybe we need to delete items manually?
        # Or maybe the db name is different.
        # localforage default name is 'localforage'.
        page.evaluate("indexedDB.deleteDatabase('localforage')")
        page.reload()
        page.wait_for_selector("text=Create First Note", timeout=5000)

    # 2. Click Create First Note and check content
    page.get_by_role("button", name="Create First Note").click()
    page.wait_for_selector("#note-title-input")

    # Check title
    title_val = page.input_value("#note-title-input")
    if title_val != "Welcome to Notention":
        print(f"FAILED: Title mismatch. Expected 'Welcome to Notention', got '{title_val}'")
    else:
        print("SUCCESS: Welcome note created.")

    # Check content text presence
    content = page.locator(".ProseMirror").text_content()
    if "Getting Started" not in content and "Getting Started" not in page.content():
        # Tiptap renders H2, check page content or editor text
        print("FAILED: Welcome content missing.")

    # 3. Test Magic Tags
    # Type text with keywords
    page.locator(".ProseMirror").click()
    page.keyboard.press("Control+a")
    page.keyboard.press("Backspace")
    page.keyboard.type("I have a todo to fix a bug in the code. http://example.com")

    # Click Magic button
    page.get_by_title("Magic Align (Auto-generate semantic properties)").click()
    time.sleep(1) # wait for heuristics

    # Check if tags were added
    # We expect #task (from todo), #bug (from bug), #link (from http)
    # The TagInput displays tags as badges.
    tags = page.locator(".tag-input .tag-badge").all_inner_texts() # Assuming class name or logic
    # Actually, TagInput renders div with text. Let's inspect TagInput.tsx or just look for text.

    # We can check if specific text exists in the tag area
    page.wait_for_selector("text=task")
    page.wait_for_selector("text=bug")
    page.wait_for_selector("text=link")

    page.screenshot(path="verification/usability_magic.png")
    print("SUCCESS: Magic tags generated.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_usability(page)
        except Exception as e:
            print(e)
        finally:
            browser.close()
