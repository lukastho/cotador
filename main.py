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
        print("\n=== LISTA DE ITENS PARA BUSCA (SOLICITAÇÃO 627) ===")
        for i, p in enumerate(products):
            print(f"{i+1:2d}. {p['description']:<50} | Custo: R$ {p['average_cost']:>8.4f}")
        print("===================================================\n")

async def search_and_store(product, results_dict, region="Goiânia"):
    """Worker to search for a single product and store results."""
    desc = product['description']
    part_code = product.get('part_code')
    print(f"Iniciando busca ({region}): {desc}...")
    res = await get_best_price(desc, part_code=part_code, region=region)
    results_dict[desc] = res
    print(f"Finalizado: {desc}")

async def run_search(products=None, region="Goiânia"):
    """Main execution flow: stealth scrape (parallel), process, and export."""
    if products is None:
        if not os.path.exists(PRODUCTS_FILE):
            print(f"Arquivo {PRODUCTS_FILE} não encontrado.")
            return
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            products = json.load(f)

    print(f"\nIniciando busca STEALTH para {region} ({len(products)} itens)...\n")

    found_results = {}
    tasks = [search_and_store(p, found_results, region=region) for p in products]
    await asyncio.gather(*tasks)

    print("\nProcessando dados e gerando relatório...")
    # Handle both full list (from file) and specific item (from list)
    source = products if isinstance(products, list) and len(products) == 1 and products[0].get("id") == "CUSTOM" else PRODUCTS_FILE
    df = process_results(source, found_results)

    # Show summary table in terminal
    print("\n=== RESUMO DOS RESULTADOS ===")
    print(df.to_string(index=False))
    print("==============================\n")

    filename = export_to_excel(df)
    print(f"Relatório gerado com sucesso: {filename}")

async def interactive_mode(region="Goiânia"):
    print("\n=== BUSCADOR DE PREÇOS ELÉTRICOS (STEALTH) ===")
    print(f"Região de busca: {region}")
    print("----------------------------------------------")

    while True:
        list_products()
        prompt = "\nDigite o NOME de um produto para buscar OU pressione [ENTER] para atualizar a lista completa (ou 'sair'): "
        user_input = input(prompt).strip()

        if user_input.lower() in ['sair', 'exit', 'quit']:
            print("Encerrando programa...")
            break

        if user_input == "":
            print("\nAtualizando lista completa do PDF...")
            await run_search(region=region)
        else:
            print(f"\nBuscando produto específico: {user_input}")
            # Create a temporary product object for the custom search
            custom_product = {
                "id": "CUSTOM",
                "description": user_input,
                "average_cost": 0.0 # Placeholder for custom items
            }
            await run_search(products=[custom_product], region=region)

        print("\n--- Ciclo finalizado. Voltando ao menu principal ---")

if __name__ == "__main__":
    region = sys.argv[1] if len(sys.argv) > 1 else "Goiânia"

    # Force mock mode for safety if not specified
    if "USE_MOCK" not in os.environ:
        os.environ["USE_MOCK"] = "true"

    try:
        asyncio.run(interactive_mode(region=region))
    except KeyboardInterrupt:
        print("\nPrograma interrompido pelo usuário.")
