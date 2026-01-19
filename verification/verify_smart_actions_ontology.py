from playwright.sync_api import sync_playwright
import time

def verify_smart_actions_ontology():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("Navigating...")
            page.goto("http://localhost:5173", timeout=60000)
            page.wait_for_load_state("networkidle")

            # Create a new note
            print("Creating new note...")
            if page.locator('button[title="New Note"]').is_visible():
                 page.locator('button[title="New Note"]').first.click()
            else:
                page.keyboard.press("Control+k")
                page.get_by_placeholder("Type a command...").fill("New Note")
                page.keyboard.press("Enter")

            time.sleep(1)

            # 1. Test "Job Request" (Defined in Ontology)
            print("Testing Job Request...")
            # Open tag input
            page.locator('button[title="Add/Edit Tags"]').click()
            tag_input = page.locator('input[placeholder="Add tags..."]')

            # We match "job request" label in ontology.
            tag_input.fill("job request")
            page.keyboard.press("Enter")
            time.sleep(1)

            # Should see "Post Job"
            if page.locator("button", has_text="Post Job").is_visible():
                print("SUCCESS: 'Post Job' appeared for tag 'job request'.")
            else:
                print("FAILURE: 'Post Job' did NOT appear.")

            # 2. Test "Marketplace Listing" (Defined in Ontology)
            print("Testing Marketplace Listing...")
            # Remove previous tag (simulate by clearing tags or making new note? let's just add new tag and see if it overrides or behaves)
            # Actually our logic finds *any* match.
            # Let's clear tags first.
            # Simplified: Just reload/new note.
            page.reload()
            if page.locator('button[title="New Note"]').is_visible():
                 page.locator('button[title="New Note"]').first.click()
            else:
                 # fallback
                 pass

            time.sleep(1)
            page.locator('button[title="Add/Edit Tags"]').click()
            page.locator('input[placeholder="Add tags..."]').fill("marketplace listing")
            page.keyboard.press("Enter")
            time.sleep(1)

            # Check if tag exists
            if page.locator("span", has_text="marketplace listing").is_visible():
                 print("Tag 'marketplace listing' added successfully.")
            else:
                 print("Tag 'marketplace listing' NOT found.")

            if page.locator("button", has_text="List Item").is_visible():
                print("SUCCESS: 'List Item' appeared for tag 'marketplace listing'.")
            else:
                print("FAILURE: 'List Item' did NOT appear.")
                # Check what label IS visible
                if page.locator("button", has_text="Publish").is_visible():
                     print("Button says 'Publish'.")

            page.screenshot(path="verification/smart_action_ontology.png")

        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/smart_action_ontology_error.png")

        browser.close()

if __name__ == "__main__":
    verify_smart_actions_ontology()
