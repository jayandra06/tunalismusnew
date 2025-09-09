import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Login
        page.goto("http://localhost:3000/login")
        page.get_by_label("Email").fill("admin3@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for dashboard and take screenshot
        expect(page).to_have_url(re.compile(".*dashboard"))
        page.screenshot(path="jules-scratch/verification/dashboard.png")

        # Navigate to Users page and take screenshot
        page.get_by_role("link", name="Users").click()
        expect(page).to_have_url(re.compile(".*users"))
        page.screenshot(path="jules-scratch/verification/users.png")

        # Navigate to Courses page and take screenshot
        page.get_by_role("link", name="Courses").click()
        expect(page).to_have_url(re.compile(".*courses"))
        page.screenshot(path="jules-scratch/verification/courses.png")

        # Navigate to Batches page and take screenshot
        page.get_by_role("link", name="Batches").click()
        expect(page).to_have_url(re.compile(".*batches"))
        page.screenshot(path="jules-scratch/verification/batches.png")

        # Navigate to Payments page and take screenshot
        page.get_by_role("link", name="Payments").click()
        expect(page).to_have_url(re.compile(".*payments"))
        page.screenshot(path="jules-scratch/verification/payments.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
