import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.on("console", lambda msg: print(f"[CONSOLE {msg.type}]: {msg.text}"))

    url = 'http://localhost:3000/kiosk?abha=14-5555-6666-7777&name=Rohan+Verma&gender=Male&age=29&lang=en&authenticated=true&from=portal&step=complaint_select'
    print("Navigating to Kiosk directly with portal params:")
    page.goto(url)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    print("Page title:", page.title())
    content = page.content()
    has_identify = "Enter 14-digit ABHA" in content
    has_complaint_select = ("What health issue are you facing" in content or 
                            "Select Chief Complaint" in content or
                            "Chest Pain" in content)

    print("-> Has identify (should be False):", has_identify)
    print("-> Has complaint select (should be True):", has_complaint_select)

    page.screenshot(path="scratch/kiosk_direct_verified.png")
    print("Screenshot saved to scratch/kiosk_direct_verified.png")
    browser.close()
