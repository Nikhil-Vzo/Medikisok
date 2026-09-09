import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.on("console", lambda msg: print(f"[CONSOLE {msg.type}]: {msg.text}"))
    page.on("response", lambda res: print(f"[NET {res.status}] {res.url}"))

    page.goto('http://localhost:3000/login/patient')
    page.wait_for_load_state('networkidle')

    page.fill('input[placeholder*="91-XXXX"]', '14-5555-6666-7777')
    page.fill('input[placeholder*="Enter your full name"]', 'Rohan Verma')
    
    verify_btn = page.query_selector("button:has-text('Verify & Continue')")
    verify_btn.click()

    page.wait_for_timeout(3000)
    
    err = page.query_selector('.text-red-800')
    if err:
        print('Error text:', err.inner_text())

    browser.close()
