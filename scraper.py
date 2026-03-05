import asyncio
from playwright.async_api import async_playwright
import json
import urllib.parse
import re

async def scrape_mercadolivre(query, region="Goiânia"):
    """
    Scrapes Mercado Livre for a specific query, prioritizing Goiânia.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            locale="pt-BR"
        )
        page = await context.new_page()

        # Enhanced query for regional relevance
        search_query = f"{query} {region}"
        url = f"https://www.mercadolivre.com.br/search?as_word={urllib.parse.quote(search_query)}"

        try:
            await page.goto(url, wait_until="domcontentloaded")
            # Wait for results container
            await page.wait_for_selector('.ui-search-layout__item, .ui-search-result__wrapper', timeout=5000)

            items = await page.evaluate('''() => {
                const results = [];
                const titles = document.querySelectorAll('.ui-search-item__title');
                for (let titleEl of titles) {
                    let container = titleEl.closest('.ui-search-result__wrapper, .ui-search-layout__item');
                    if (!container) continue;
                    const priceEl = container.querySelector('.andes-money-amount__fraction');
                    const centsEl = container.querySelector('.andes-money-amount__cents');
                    const linkEl = container.querySelector('a.ui-search-link');
                    if (priceEl) {
                        let price = priceEl.innerText.replace(/[.]/g, '').replace(/[,]/g, '');
                        if (centsEl) price += '.' + centsEl.innerText;
                        results.push({
                            title: titleEl.innerText,
                            price: parseFloat(price),
                            link: linkEl ? linkEl.href : ''
                        });
                    }
                    if (results.length >= 3) break;
                }
                return results;
            }''')

            # Keywords filter
            keywords = [k for k in re.findall(r'\w+', query.upper()) if len(k) > 2]
            results = []
            for item in items:
                if all(k in item['title'].upper() for k in keywords):
                    item['store'] = "Mercado Livre"
                    results.append(item)

            await browser.close()
            return results
        except:
            await browser.close()
            return []

async def scrape_amazon(query):
    """
    Scrapes Amazon.com.br for a specific query.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            locale="pt-BR"
        )
        page = await context.new_page()

        url = f"https://www.amazon.com.br/s?k={urllib.parse.quote(query)}"
        try:
            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_selector('[data-component-type="s-search-result"]', timeout=5000)

            items = await page.evaluate('''() => {
                const results = [];
                const elements = document.querySelectorAll('[data-component-type="s-search-result"]');
                for (let el of elements) {
                    const titleEl = el.querySelector('h2');
                    const priceWhole = el.querySelector('.a-price-whole');
                    const priceFraction = el.querySelector('.a-price-fraction');
                    const linkEl = el.querySelector('a.a-link-normal.s-no-outline');
                    if (titleEl && priceWhole) {
                        let price = priceWhole.innerText.replace(/[.]/g, '').replace(/[,]/g, '');
                        if (priceFraction) price += '.' + priceFraction.innerText;
                        results.push({
                            title: titleEl.innerText,
                            price: parseFloat(price),
                            link: linkEl ? "https://www.amazon.com.br" + linkEl.getAttribute('href') : ''
                        });
                    }
                    if (results.length >= 3) break;
                }
                return results;
            }''')

            # Keywords filter
            keywords = [k for k in re.findall(r'\w+', query.upper()) if len(k) > 2]
            results = []
            for item in items:
                if all(k in item['title'].upper() for k in keywords):
                    item['store'] = "Amazon"
                    results.append(item)

            await browser.close()
            return results
        except:
            await browser.close()
            return []

async def scrape_mock(query):
    """
    Mock scraper as fallback for when both ML and Amazon fail.
    """
    # Simulate network delay
    await asyncio.sleep(0.1)

    # Simple logic to generate relevant mock data based on query
    mock_data = {
        "CONECTOR ETE 7512": [
            {"title": "Conector Derivação ETE 7512 Azul - Rainha das Sete", "price": 4.50, "store": "Loja Elétrica Goiânia (Simulado)", "link": "https://example.com/ete7512"},
            {"title": "Kit 100 Conectores ETE 7512 AZ", "price": 3.90, "store": "Mercado Livre (Simulado)", "link": "https://mercadolivre.com.br/ete7512"}
        ],
        "LANTERNA LATERAL FACCHINI": [
            {"title": "Lanterna Lateral Facchini LED Amarela", "price": 16.50, "store": "Auto Peças Goiás (Simulado)", "link": "https://example.com/lanterna-facchini"},
            {"title": "Lanterna Facchini Original Bivolt", "price": 18.20, "store": "Mercado Livre (Simulado)", "link": "https://mercadolivre.com.br/facchini"}
        ],
        "SIRENE DE RÉ": [
            {"title": "Sirene de Ré DNI 4127 Bivolt", "price": 17.50, "store": "Goiânia Acessórios (Simulado)", "link": "https://example.com/sirene-dni"},
            {"title": "Sirene de Ré 24V Universal", "price": 19.00, "store": "Amazon (Simulado)", "link": "https://amazon.com.br/sirene"}
        ]
    }

    # Try to find a match
    for key in mock_data:
        if key in query.upper():
            return mock_data[key]

    # Default mock if no specific match
    price = 10.0 + (len(query) % 5)
    return [{"title": f"{query} Original", "price": price, "store": "Distribuidora Regional (Simulado)", "link": "https://example.com/item"}]

async def get_best_price(query, region="Goiânia"):
    """
    Tries to get real price from multiple sources, falls back to mock if all fail.
    """
    ml_results = await scrape_mercadolivre(query, region)
    amazon_results = await scrape_amazon(query)

    all_results = ml_results + amazon_results

    if not all_results:
        # If all real sources fail, use mock but mark it as simulated
        return await scrape_mock(query)

    return all_results

if __name__ == "__main__":
    test_query = "Conector ETE 7512"
    res = asyncio.run(get_best_price(test_query))
    print(f"Results for '{test_query}':")
    print(json.dumps(res, indent=2, ensure_ascii=False))
