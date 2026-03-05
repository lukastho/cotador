import asyncio
import json
import sys
import os
from scraper import get_best_price
from data_processor import process_results
from excel_exporter import export_to_excel

def list_products():
    """Lists all products currently in products.json."""
    if not os.path.exists('products.json'):
        print("Arquivo products.json não encontrado.")
        return

    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
        print("\n" + "="*85)
        print(f"{'#':<3} | {'PRODUTO':<45} | {'CUSTO REF. (FOTO)':>15}")
        print("-"*85)
        for i, p in enumerate(products):
            print(f"{i+1:2d} | {p['description'][:45]:<45} | R$ {p['average_cost']:>12.2f}")
        print("="*85 + "\n")

async def search_and_store(product, results_dict):
    """Worker to search for a single product and store results."""
    desc = product['description']
    part_code = product.get('part_code')
    print(f"Buscando preço atual para: {desc}...")
    res = await get_best_price(desc, part_code=part_code, region="Goiânia")
    results_dict[desc] = res
    print(f"OK -> {desc}")

async def run_search():
    """Main execution flow: stealth scrape (parallel), process, and export."""
    # Show all items at once as requested
    list_products()

    print(f"Iniciando localização de melhores preços em tempo real para os {len(json.load(open('products.json')))} itens...\n")

    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    found_results = {}

    # Parallel execution
    tasks = [search_and_store(p, found_results) for p in products]
    await asyncio.gather(*tasks)

    print("\nCalculando viabilidade e gerando relatório...\n")
    df = process_results('products.json', found_results)

    # Adjusted terminal summary for 20 items
    print("="*120)
    print(f"{'PRODUTO':<40} | {'PREÇO WEB':>12} | {'REF. FOTO':>12} | {'STATUS':<20}")
    print("-"*120)
    for _, row in df.iterrows():
        price_web = f"R$ {row['Melhor Preço Web']:.2f}" if row['Melhor Preço Web'] else "N/A"
        print(f"{row['Produto'][:40]:<40} | {price_web:>12} | R$ {row['Custo Referência FOTO']:>9.2f} | {row['Status_Compra']:<20}")
    print("="*120 + "\n")

    print("Exportando para Excel...")
    filename = export_to_excel(df)
    print(f"Relatório STEALTH gerado com sucesso: {filename}")

def print_help():
    print("""
Buscador de Preços Eletricos - Versão STEALTH (Full 20 Itens)
Comandos:
  run     - Inicia a busca para os 20 itens da SC 627.
  list    - Mostra os produtos atuais.
  help    - Ajuda.
    """)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
    else:
        command = sys.argv[1].lower()
        if command == "run":
            if "USE_MOCK" not in os.environ:
                os.environ["USE_MOCK"] = "true"
            asyncio.run(run_search())
        elif command == "list":
            list_products()
        else:
            print_help()
