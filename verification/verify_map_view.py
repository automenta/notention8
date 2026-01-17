from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # 1. Create a Note with Location
        page.get_by_role("button", name="New Note").first.click()
        page.get_by_placeholder("Untitled Note").fill("Map Test Note")

        # Use Magic or manual typing to add location
        # [location:is:40.7128,-74.0060] (New York)
        page.locator(".ProseMirror").fill("This note has a location.\n\n[location:is:40.7128,-74.0060]")
        page.keyboard.press("Control+s")
        time.sleep(2) # Wait for save

        # 2. Go to Map View
        page.get_by_role("button", name="Map", exact=True).click()

        # 3. Verify Map Rendering
        page.locator(".leaflet-container").wait_for(timeout=10000)

        # 4. Check for Marker
        time.sleep(3) # Wait for map render
        markers = page.locator(".leaflet-marker-icon")

        count = markers.count()
        if count > 0:
            print(f"SUCCESS: Found {count} markers on the map.")
        else:
            print("FAILURE: No markers found on the map.")
            page.screenshot(path="verification/map_fail.png")
            # Go back to notes and check if property is there
            page.get_by_role("button", name="Notes", exact=True).click()
            page.wait_for_timeout(1000)
            # Check if property inspector shows it?
            # Or check content
            print("Note Content:", page.locator(".ProseMirror").text_content())
            raise Exception("No markers found")

        browser.close()

if __name__ == "__main__":
    run()
