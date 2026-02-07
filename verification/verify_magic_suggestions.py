from playwright.sync_api import sync_playwright
import time

def verify(page):
    # 1. Open app
    print("Navigating to app...")
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    # 2. Create a note
    print("Creating note...")
    try:
        page.get_by_text("Create First Note").click(timeout=2000)
    except:
        # Resolve ambiguity by taking the first one
        page.get_by_role("button", name="New Note").first.click()

    # Wait for editor
    page.wait_for_selector(".ProseMirror")

    # 3. Get Note ID from URL
    url = page.url
    note_id = url.split("/")[-1]
    print(f"Note ID: {note_id}")

    # 4. Inject suggestions
    print("Injecting suggestions...")

    inject_script = f"""
    (async () => {{
        return new Promise((resolve, reject) => {{
            const request = indexedDB.open("localforage");
            request.onerror = reject;
            request.onsuccess = (event) => {{
                const db = event.target.result;
                if (!db.objectStoreNames.contains("keyvaluepairs")) {{
                    console.log("Store not found");
                    resolve();
                    return;
                }}
                const tx = db.transaction(["keyvaluepairs"], "readwrite");
                const store = tx.objectStore("keyvaluepairs");

                const data = {{
                    "{note_id}": ["[price:is:100]", "[role:contain:Developer]"]
                }};

                const req = store.put(data, "notention-suggestions");
                req.onsuccess = () => resolve();
                req.onerror = reject;
            }};
        }});
    }})()
    """
    page.evaluate(inject_script)

    # 5. Reload to pick up changes
    print("Reloading...")
    page.reload()
    page.wait_for_selector(".ProseMirror")

    # 6. Verify suggestions are visible
    print("Checking for suggestions...")
    try:
        page.get_by_text("Suggestions", exact=True).wait_for(timeout=5000)
    except Exception as e:
        print(f"Suggestions not found: {e}")

    # 7. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/magic_suggestions.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
