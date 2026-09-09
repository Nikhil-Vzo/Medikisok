import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    url = 'http://localhost:3000/kiosk?abha=14-5555-6666-7777&name=Rohan+Verma&gender=Male&age=29&lang=en&authenticated=true&from=portal&step=complaint_select'
    page.goto(url)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Click Chest Pain button
    chest_btn = page.query_selector("button:has-text('Chest pain')")
    print('Found chest pain button:', chest_btn is not None)
    if chest_btn:
        chest_btn.click()
        page.wait_for_timeout(1500)
        h = [x.inner_text() for x in page.query_selector_all('h1, h2, h3, h4')]
        print('Next Step Headings:', h)
        print('Current Step or Banner:', [p_el.inner_text() for p_el in page.query_selector_all('.text-xs, .text-sm')][:5])
        page.screenshot(path='scratch/kiosk_converse_verified.png')
        print('Screenshot saved!')
    browser.close()
