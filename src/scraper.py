import asyncio
import random
import json
import urllib.parse
import re
import os
import time

# Attempt to import stealth libraries
try:
    import undetected_chromedriver as uc
    from selenium_stealth import stealth
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    HAS_STEALTH = True
except ImportError:
    HAS_STEALTH = False

# Rotating User-Agents to avoid detection
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

# Global semaphore to control concurrency
# Limits to 3 simultaneous browser instances to save resources
browser_semaphore = asyncio.Semaphore(3)

def get_stealth_driver():
    """
    Configures and returns an undetected-chromedriver instance with stealth settings.
    """
    if not HAS_STEALTH:
        raise Exception("Bibliotecas stealth (undetected-chromedriver, selenium-stealth) não instaladas.")

    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # User-Agent rotation
    user_agent = random.choice(USER_AGENTS)
    options.add_argument(f'user-agent={user_agent}')

    driver = uc.Chrome(options=options)

    # Apply extra stealth measures
    stealth(driver,
            languages=["pt-BR", "pt"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
            )
    return driver

def scrape_mercadolivre_stealth(query, part_code=None, region="Goiânia"):
    """
    Stealth scraper for Mercado Livre with human-like behavior.
    """
    driver = get_stealth_driver()
    results = []

    try:
        refinement = part_code if part_code else ""
        full_query = f"{query} {refinement} {region}".strip()
        search_url = f"https://lista.mercadolivre.com.br/{urllib.parse.quote(full_query)}"

        print(f"Buscando: {full_query}")
        driver.get(search_url)

        # Random sleep between 4 and 9 seconds to simulate human behavior
        sleep_time = random.uniform(4, 9)
        print(f"Delay stealth: {sleep_time:.2f}s")
        time.sleep(sleep_time)

        items = driver.find_elements(By.CSS_SELECTOR, '.ui-search-layout__item, .ui-search-result__wrapper')

        for item in items[:5]:
            try:
                title = item.find_element(By.CSS_SELECTOR, '.ui-search-item__title').text
                # Filter out used or defective items
                if any(bad in title.lower() for bad in ['usado', 'conserto', 'defeito']):
                    continue

                price_text = item.find_element(By.CSS_SELECTOR, '.andes-money-amount__fraction').text
                price = float(price_text.replace('.', '').replace(',', ''))

                try:
                    cents = item.find_element(By.CSS_SELECTOR, '.andes-money-amount__cents').text
                    price += float(cents) / 100
                except:
                    pass

                link = item.find_element(By.CSS_SELECTOR, 'a.ui-search-link').get_attribute('href')

                results.append({
                    "title": title,
                    "price": price,
                    "link": link,
                    "store": "Mercado Livre"
                })
            except:
                continue

    except Exception as e:
        print(f"Erro no scraper stealth para '{query}': {e}")
    finally:
        driver.quit()

    return results

async def scrape_mock(query):
    """Fallback logic when real scraper is not possible or desired."""
    await asyncio.sleep(random.uniform(1, 2))
    # ... mock data logic remains the same ...
    mock_data = {
        "Conector ETE 7512": [{"title": "Conector Derivação ETE 7512 Azul", "price": 4.50, "store": "Loja Elétrica Goiânia (Simulado)", "link": "https://example.com/ete7512"}],
        "Lanterna Lateral Facchini LED": [{"title": "Lanterna Lateral Facchini LED Amarela", "price": 16.50, "store": "Auto Peças Goiás (Simulado)", "link": "https://example.com/lanterna-facchini"}],
        "Lanterna de Placa Pradolux (544)": [{"title": "Lanterna Placa Pradolux", "price": 15.00, "store": "Distribuidora Regional (Simulado)", "link": "https://example.com/pradolux"}],
        "Sirene de Ré (DNI4127)": [{"title": "Sirene de Ré DNI 4127 Bivolt", "price": 17.50, "store": "Goiânia Acessórios (Simulado)", "link": "https://example.com/sirene-dni"}],
        "Chicote Reparo ETE 5961": [{"title": "Chicote Reparo ETE 5961", "price": 55.00, "store": "Auto Peças Goiás (Simulado)", "link": "https://example.com/chicote"}],
        "Cabo Flexível 2x1": [{"title": "Cabo Flexível 2x1mm", "price": 4.20, "store": "Loja Elétrica (Simulado)", "link": "https://example.com/cabo"}]
    }
    return mock_data.get(query, [{"title": f"{query} Original", "price": 10.0, "store": "Distribuidora Regional (Simulado)", "link": "https://example.com/item"}])

async def get_best_price(query, part_code=None, region="Goiânia"):
    """
    Tries to get real price from multiple sources using a semaphore to control concurrency.
    """
    async with browser_semaphore:
        if os.environ.get("USE_MOCK", "false").lower() == "true":
            return await scrape_mock(query)

        try:
            loop = asyncio.get_event_loop()
            res = await loop.run_in_executor(None, scrape_mercadolivre_stealth, query, part_code, region)
            if not res:
                return await scrape_mock(query)
            return res
        except Exception:
            return await scrape_mock(query)

if __name__ == "__main__":
    test_query = "Sirene de Ré (DNI4127)"
    os.environ["USE_MOCK"] = "true"
    res = asyncio.run(get_best_price(test_query))
    print(json.dumps(res, indent=2, ensure_ascii=False))
