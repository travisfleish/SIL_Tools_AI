from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import psycopg2
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# PostgreSQL connection settings
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}


# Function to connect to PostgreSQL
def connect_db():
    return psycopg2.connect(**DB_CONFIG)


# Function to create table if it doesn't exist
def create_table():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS ai_tools (
            id SERIAL PRIMARY KEY,
            name TEXT,
            description TEXT,
            category TEXT,
            source TEXT,
            source_url TEXT UNIQUE
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()


# Function to scrape FutureTools.io Newly Added page
def scrape_futuretools():
    url = "https://www.futuretools.io/newly-added"

    # Set up Selenium WebDriver (no headless mode so you can see it)
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")  # Avoid detection
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    print("[INFO] Opening FutureTools.io Newly Added page in Chrome...")
    driver.get(url)

    # Wait for AI tool elements to appear
    try:
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "tool-item-columns-new"))
        )
        print("[INFO] AI tools have loaded.")
    except Exception as e:
        print("[ERROR] Timeout waiting for AI tool elements:", e)
        driver.quit()
        return []

    # Get the fully rendered page source
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    tools = []

    # Find all AI tools on the page
    for index, card in enumerate(soup.find_all("div", class_="tool-item-columns-new")):
        if index >= 5:  # Limit to first 5 tools
            break

        name_tag = card.find("a", class_="tool-item-link---new")
        name = name_tag.text.strip() if name_tag else ""

        description_tag = card.find("div", class_="tool-item-description-box---new")
        description = description_tag.text.strip() if description_tag else ""

        source_link_tag = card.find("a", class_="tool-item-link-block---new w-inline-block")
        source_url = "https://www.futuretools.io" + source_link_tag["href"] if source_link_tag else ""

        tools.append((name, description, "", "FutureTools.io", source_url))

    driver.quit()

    # Print extracted tools
    print("Extracted Tools:")
    for tool in tools:
        print(tool)

    return tools


# Function to store data in PostgreSQL
def store_data(tools):
    conn = connect_db()
    cur = conn.cursor()

    for tool in tools:
        cur.execute(
            "INSERT INTO ai_tools (name, description, category, source, source_url) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (source_url) DO NOTHING",
            tool
        )

    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    create_table()
    tools = scrape_futuretools()
    store_data(tools)
    print(f"Scraped and stored {len(tools)} AI tools from FutureTools.io Newly Added!")
