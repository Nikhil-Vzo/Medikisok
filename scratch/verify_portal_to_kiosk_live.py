from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to patient login...")
        page.goto("http://localhost:3000/login/patient")
        page.wait_for_load_state("networkidle")

        # Fill in ABHA & Name
        page.fill('input[placeholder*="91-XXXX"]', "14-5555-6666-7777")
        page.fill('input[placeholder*="Enter your full name"]', "Rohan Verma")
        page.click("button:has-text('Verify')")

        page.wait_for_timeout(1500)
        print("Current URL after login verify:", page.url)

        # Click proceed to patient portal
        proceed_btn = page.query_selector("button:has-text('Access Patient Portal')")
        if proceed_btn:
            proceed_btn.click()
            page.wait_for_load_state("networkidle")

        print("2. On Patient Portal:", page.url)
        content_portal = page.content()
        assert "Rohan Verma" in content_portal, "Patient name not found on portal page!"

        # Find link to start consultation
        consult_link = None
        for a in page.query_selector_all("a"):
            href = a.get_attribute("href") or ""
            if "/kiosk" in href and "from=portal" in href:
                consult_link = a
                print("Found consultation link with href:", href)
                break

        assert consult_link is not None, "Consultation link to /kiosk not found!"
        consult_link.click()

        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)
        print("3. Arrived at Kiosk:", page.url)

        content_kiosk = page.content()
        has_identify_form = "Enter 14-digit ABHA" in content_kiosk
        has_complaint_select = ("What health issue are you facing today" in content_kiosk or 
                                "Select Chief Complaint" in content_kiosk or 
                                "Chest Pain" in content_kiosk)

        print("-> Has identify form (should be False):", has_identify_form)
        print("-> Has complaint select (should be True):", has_complaint_select)

        page.screenshot(path="scratch/portal_to_kiosk_verified.png")
        print("Screenshot saved to scratch/portal_to_kiosk_verified.png")

        assert not has_identify_form, "Error: identify step is unexpectedly visible to authenticated portal patient!"
        assert has_complaint_select, "Error: complaint selection step is not visible!"

        print("SUCCESS! All checks passed seamlessly.")
        browser.close()

if __name__ == "__main__":
    run()
