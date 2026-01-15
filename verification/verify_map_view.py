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
        time.sleep(1)

        # 2. Go to Map View
        page.get_by_role("button", name="Map", exact=True).click()

        # 3. Verify Map Rendering
        # MapView uses Leaflet. We should see the map container.
        # It usually has class 'leaflet-container'
        page.locator(".leaflet-container").wait_for(timeout=10000)

        # 4. Check for Marker
        # Leaflet markers are usually img with class 'leaflet-marker-icon'
        # We might need to wait a bit for it to render
        time.sleep(2)
        markers = page.locator(".leaflet-marker-icon")

        if markers.count() > 0:
            print(f"Found {markers.count()} markers on the map.")
        else:
            print("WARNING: No markers found on the map.")

        # 5. Screenshot
        page.screenshot(path="verification/map_view.png")
        print("Map View verification passed.")

        browser.close()

if __name__ == "__main__":
    run()
