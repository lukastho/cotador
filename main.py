import asyncio
import json
import sys
import os
from src.scraper import get_best_price
from src.data_processor import process_results
from src.excel_exporter import export_to_excel

PRODUCTS_FILE = 'data/products.json'

def list_products():
    """Lists all products currently in data/products.json."""
    if not os.path.exists(PRODUCTS_FILE):
        print(f"Arquivo {PRODUCTS_FILE} não encontrado.")
        return

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
        print("\n=== LISTA DE ITENS PARA BUSCA ===")
        for i, p in enumerate(products):
            print(f"{i+1:2d}. {p['description']:<40} | Custo: R$ {p['average_cost']:>8.2f}")
        print("=================================\n")

async def search_and_store(product, results_dict, region="Goiânia"):
    """Worker to search for a single product and store results."""
    desc = product['description']
    part_code = product.get('part_code')
    print(f"Iniciando busca ({region}): {desc}...")
    res = await get_best_price(desc, part_code=part_code, region=region)
    results_dict[desc] = res
    print(f"Finalizado: {desc}")

async def run_search(region="Goiânia"):
    """Main execution flow: stealth scrape (parallel), process, and export."""
    # 1. Show all items simultaneously at the start
    list_products()

    print(f"Iniciando busca STEALTH paralela para {region}...\n")

    if not os.path.exists(PRODUCTS_FILE):
        print(f"Arquivo {PRODUCTS_FILE} não encontrado.")
        return

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    found_results = {}

    # 2. Use asyncio.gather for parallel execution
    tasks = [search_and_store(p, found_results, region=region) for p in products]
    await asyncio.gather(*tasks)

    print("\nProcessando dados (Versão Stealth)...")
    df = process_results(PRODUCTS_FILE, found_results)

    # Show summary table in terminal
    print("\n=== RESUMO DOS RESULTADOS ===")
    print(df.to_string(index=False))
    print("==============================\n")

    print("Exportando para Excel...")
    filename = export_to_excel(df)
    print(f"Relatório STEALTH gerado com sucesso: {filename}")

def print_help():
    print("""
Buscador de Preços Eletricos - Versão STEALTH (Simultâneo)
Comandos:
  run     - Inicia a busca stealth para todos os itens.
  list    - Mostra os produtos atuais no arquivo JSON.
  help    - Mostra esta ajuda.
    """)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
    else:
        command = sys.argv[1].lower()
        if command == "run":
            region = sys.argv[2] if len(sys.argv) > 2 else "Goiânia"
            if "USE_MOCK" not in os.environ:
                os.environ["USE_MOCK"] = "true"
            asyncio.run(run_search(region=region))
        elif command == "list":
            list_products()
        else:
            print_help()
