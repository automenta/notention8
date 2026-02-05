from playwright.sync_api import sync_playwright
import os
import time

def test_ui_refactor():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Wait for app
        page.wait_for_selector('h1:has-text("Good afternoon")', timeout=10000)

        # 1. Verify Sidebar View Selector
        print("Verifying Sidebar View Selector...")
        sidebar = page.locator('.bg-gray-900.flex-col') # Sidebar container
        page.screenshot(path="verification/sidebar_refactor.png", clip=sidebar.bounding_box())

        # 2. Verify Timeline Widget
        print("Verifying Timeline Widget...")
        # Scroll to reveal Timeline if needed
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)

        # Find Timeline Widget
        # It has title "Timeline"
        timeline = page.locator('.rounded-2xl:has-text("Timeline")').first
        if timeline.count() > 0:
             timeline.scroll_into_view_if_needed()
             time.sleep(0.5)
             page.screenshot(path="verification/timeline_refactor.png", clip=timeline.bounding_box())
             print("Timeline screenshot saved.")
        else:
             print("Timeline widget not found!")

        browser.close()

if __name__ == "__main__":
    test_ui_refactor()
