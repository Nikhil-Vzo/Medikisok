import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.on("console", lambda msg: print(f"[CONSOLE {msg.type}]: {msg.text}"))
    page.on("response", lambda res: print(f"[NET {res.status}] {res.url}"))

    url = 'http://localhost:3000/patient?abha=14-5555-6666-7777&name=Rohan+Verma&gender=Male&age=29'
    print("Navigating to:", url)
    page.goto(url)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    print("Title:", page.title())
    content = page.content()
    print("Rohan Verma in content:", "Rohan Verma" in content)

    # Check localStorage in page
    storage = page.evaluate("() => localStorage.getItem('medikiosk_patient_session')")
    print("localStorage session in portal:", storage)

    # Find the consultation link
    consult_link = None
    for a in page.query_selector_all("a"):
        href = a.get_attribute("href") or ""
        if "/kiosk" in href:
            print("Found kiosk link:", href, "| text:", a.inner_text().strip())
            consult_link = a
            break

    if consult_link:
        consult_link.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        print("Arrived at Kiosk URL:", page.url)
        content_kiosk = page.content()
        has_identify = "Enter 14-digit ABHA" in content_kiosk
        has_complaint_select = ("What health issue are you facing" in content_kiosk or 
                                "Select Chief Complaint" in content_kiosk or
                                "Chest Pain" in content_kiosk)
        print("-> Has identify (should be False):", has_identify)
        print("-> Has complaint select (should be True):", has_complaint_select)
        page.screenshot(path="scratch/portal_direct_verified.png")
        print("Saved screenshot to scratch/portal_direct_verified.png")

    browser.close()
