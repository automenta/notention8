from playwright.sync_api import sync_playwright

def verify_sidebar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Wait for sidebar to be visible
        # Note: Depending on screen size, sidebar might be hidden or visible.
        # Assuming desktop view (1280x720 is default usually, let's set a size)
        page.set_viewport_size({"width": 1280, "height": 720})

        # Wait for the search input to be visible, which is in the sidebar
        page.wait_for_selector("#sidebar-search-input")

        # Take a screenshot of the sidebar area
        # We can target the sidebar container. The class name in App.tsx for sidebar container is somewhat generic but we can try to find the sidebar element.
        # The sidebar has 'bg-gray-900 flex flex-col h-full'

        sidebar = page.locator(".bg-gray-900.flex.flex-col.h-full").first

        # Take screenshot of the sidebar
        sidebar.screenshot(path="verification/sidebar_screenshot.png")

        browser.close()

if __name__ == "__main__":
    verify_sidebar()
