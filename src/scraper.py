import asyncio
import random
import json
import urllib.parse
import re
import os
import time

# Tentativa de importar bibliotecas stealth para evitar detecção por robôs
try:
    import undetected_chromedriver as uc
    from selenium_stealth import stealth
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    HAS_STEALTH = True
except ImportError:
    HAS_STEALTH = False

# Lista de User-Agents rotativos para simular diferentes navegadores e plataformas
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

# Semáforo global para controlar a concorrência
# Limita a 3 instâncias simultâneas de navegador para economizar memória e evitar bans por IP
browser_semaphore = asyncio.Semaphore(3)

def get_stealth_driver():
    """
    Configura e retorna uma instância do undetected-chromedriver com medidas stealth.
    """
    if not HAS_STEALTH:
        raise Exception("Bibliotecas stealth (undetected-chromedriver, selenium-stealth) não instaladas.")

    options = uc.ChromeOptions()
    options.add_argument('--headless') # Roda sem interface gráfica
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # Rotação de User-Agent para cada nova instância
    user_agent = random.choice(USER_AGENTS)
    options.add_argument(f'user-agent={user_agent}')

    driver = uc.Chrome(options=options)

    # Medidas extras contra detecção (JS injection)
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
    Scraper focado no Mercado Livre com comportamento humano.

    PARA ALTERAR A URL:
    - O padrão atual é: https://lista.mercadolivre.com.br/{termo-de-busca}{slug-de-estado}
    - Se a estrutura mudar, ajuste a variável 'search_url' abaixo.
    """
    driver = get_stealth_driver()
    results = []

    try:
        # Refinamento de busca: Nome + Código da Peça
        query_base = query
        if part_code and str(part_code).lower() not in query.lower():
            query_base = f"{query} {part_code}"

        full_query = f"{query_base}".strip()

        # Priorização Regional: Goiânia/Goiás
        # O Mercado Livre usa o sufixo '_Estado_Goiás' para filtrar por UF na URL
        region_slug = ""
        if "goiânia" in region.lower() or "goiás" in region.lower() or "goias" in region.lower():
            region_slug = "_Estado_Goiás"

        # CONSTRUÇÃO DA URL: Altere aqui caso o ML mude o padrão de busca
        search_url = f"https://lista.mercadolivre.com.br/{urllib.parse.quote(full_query)}{region_slug}"

        print(f"Buscando no Mercado Livre (Prioridade {region}): {full_query}")
        driver.get(search_url)

        # Delay aleatório entre 4 e 9 segundos (Comportamento Humano)
        sleep_time = random.uniform(4, 9)
        print(f"Pausa Stealth: {sleep_time:.2f}s")
        time.sleep(sleep_time)

        # SELETORES CSS: Se o site mudar, altere as classes abaixo
        # 'li.ui-search-layout__item' é o container de cada anúncio
        items = driver.find_elements(By.CSS_SELECTOR, 'li.ui-search-layout__item')

        for item in items[:5]: # Analisa os 5 primeiros resultados
            try:
                # 1. Título do Anúncio
                title_el = item.find_element(By.CSS_SELECTOR, '.ui-search-item__title')
                title = title_el.text

                # FILTRO DE QUALIDADE: Descarta usados, sucatas e defeituosos
                forbidden_terms = ['usado', 'conserto', 'defeito', 'recondicionado', 'sucata', 'quebrado']
                if any(bad in title.lower() for bad in forbidden_terms):
                    continue

                # 2. Preço (Inteiro e Decimais)
                # O ML separa o preço em 'fraction' (reais) e 'cents' (centavos)
                price_integer = item.find_element(By.CSS_SELECTOR, '.andes-money-amount__fraction').text
                price = float(price_integer.replace('.', '').replace(',', ''))

                try:
                    price_decimals = item.find_element(By.CSS_SELECTOR, '.andes-money-amount__cents').text
                    price += float(price_decimals) / 100
                except:
                    pass

                # 3. Link do Anúncio
                link = item.find_element(By.CSS_SELECTOR, 'a.ui-search-link').get_attribute('href')

                results.append({
                    "title": title,
                    "price": price,
                    "link": link,
                    "store": "Mercado Livre"
                })
            except:
                continue # Pula anúncios com erro de extração

    except Exception as e:
        print(f"Erro no scraper para '{query}': {e}")
    finally:
        driver.quit() # Garante o fechamento do navegador

    return results

async def scrape_mock(query):
    """Lógica de simulação (Mock) para testes sem gastar recursos de rede."""
    await asyncio.sleep(random.uniform(0.5, 1.5))
    mock_data = {
        "CONECTOR ETE 7512 AZ DERIVAÇÃO": [{"title": "Conector ETE 7512 Original", "price": 4.50, "store": "Loja Simulada", "link": "https://example.com/item"}],
        "SIRENE DE RÉ (DNI4127)": [{"title": "Sirene de Ré DNI 4127 Bivolt", "price": 17.50, "store": "Loja Simulada", "link": "https://example.com/item"}],
        "LANTERNA LATERAL FACCHINI LED AM SEM SUPORTE": [{"title": "Lanterna Facchini LED Amarela", "price": 16.50, "store": "Loja Simulada", "link": "https://example.com/item"}]
    }
    return mock_data.get(query, [{"title": f"{query} Nova", "price": 10.0, "store": "Distribuidora Regional", "link": "https://example.com/item"}])

async def get_best_price(query, part_code=None, region="Goiânia"):
    """
    Função principal de entrada que orquestra a busca.
    Usa um semáforo para limitar a concorrência.
    """
    async with browser_semaphore:
        # Verifica se deve usar dados simulados (definido no main.py)
        if os.environ.get("USE_MOCK", "false").lower() == "true":
            return await scrape_mock(query)

        try:
            # Executa o scraper Selenium (síncrono) em um executor para não travar o loop async
            loop = asyncio.get_event_loop()
            res = await loop.run_in_executor(None, scrape_mercadolivre_stealth, query, part_code, region)

            if not res:
                return await scrape_mock(query) # Fallback se não encontrar nada
            return res
        except Exception:
            return await scrape_mock(query)

if __name__ == "__main__":
    # Teste rápido do módulo
    test_query = "Sirene de Ré (DNI4127)"
    os.environ["USE_MOCK"] = "true"
    res = asyncio.run(get_best_price(test_query))
    print(json.dumps(res, indent=2, ensure_ascii=False))
