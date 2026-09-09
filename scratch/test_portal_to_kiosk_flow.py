import time
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to /login/patient...")
        page.goto("http://localhost:3000/login/patient")
        page.wait_for_load_state("networkidle")

        print("2. Entering patient name and mobile...")
        # Select mobile tab
        mobile_tab = page.locator("button:has-text('Mobile')")
        if mobile_tab.count() > 0:
            mobile_tab.click()
            time.sleep(0.5)

        mobile_input = page.locator("input[placeholder='9876543210']")
        if mobile_input.count() > 0:
            mobile_input.fill("9876543210")

        # Also fill custom name if visible
        name_input = page.locator("input[placeholder*='Kamla Devi'], input[placeholder*='Full Name'], input[placeholder*='Name']")
        if name_input.count() > 0:
            name_input.fill("Ramesh Sharma")

        # Click Verify & Continue
        verify_btn = page.locator("button:has-text('Verify & Continue'), button:has-text('सत्यापित करें')")
        verify_btn.click()
        time.sleep(1.5)

        # Look for proceed button
        proceed_btn = page.locator("button:has-text('Access Patient Portal'), button:has-text('मरीज पोर्टल')")
        if proceed_btn.count() > 0:
            proceed_btn.click()
            time.sleep(1.5)

        print(f"3. Arrived at Patient Portal: {page.url}")
        page.screenshot(path="C:/Users/nikhi/.gemini/antigravity-ide/brain/6a369386-9a34-4fb3-b85a-36b71161609f/portal_logged_in.png")

        print("4. Clicking 'Start Doctor Consultation'...")
        talk_doctor_btn = page.locator("a:has-text('Talk to Doctor'), a:has-text('Start Doctor Consultation'), a:has-text('डॉक्टर से परामर्श लें')").first
        talk_doctor_btn.click()
        time.sleep(1.5)

        print(f"5. Arrived at Kiosk: {page.url}")
        page.screenshot(path="C:/Users/nikhi/.gemini/antigravity-ide/brain/6a369386-9a34-4fb3-b85a-36b71161609f/kiosk_portal_flow.png")

        # Verify whether identify is visible
        has_identify = page.locator("text='14-Digit ABHA ID'").is_visible()
        has_complaint_select = page.locator("text='Aaj ki mukhya pareshani kya hai?'").is_visible()
        has_auth_badge = page.locator("text='Authenticated ABHA Session'").is_visible()

        print(f"Results:")
        print(f" - Is asking for 14-digit ABHA (Identify step): {has_identify}")
        print(f" - Is on Chief Complaint selection: {has_complaint_select}")
        print(f" - Shows Authenticated ABHA Session badge: {has_auth_badge}")

        browser.close()

if __name__ == "__main__":
    main()
