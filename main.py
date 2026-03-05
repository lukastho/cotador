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
        for i, p in enumerate(products):
            print(f"{i+1}. {p['description']} - Custo: R$ {p['average_cost']:.2f}")

async def run_search():
    """Main execution flow: stealth scrape, process, and export."""
    print("Iniciando busca STEALTH de preços em tempo real para Goiânia...")

    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    found_results = {}
    for p in products:
        desc = p['description']
        part_code = p.get('part_code')
        print(f"Buscando: {desc} {'(Código: ' + part_code + ')' if part_code else ''}...")
        res = await get_best_price(desc, part_code=part_code, region="Goiânia")
        found_results[desc] = res

    print("Processando dados (Versão Stealth)...")
    df = process_results('products.json', found_results)

    print("Exportando para Excel...")
    filename = export_to_excel(df)
    print(f"Relatório STEALTH gerado com sucesso: {filename}")

def print_help():
    print("""
Buscador de Preços Eletricos - Versão STEALTH
Comandos:
  run     - Inicia a busca stealth para todos os itens.
  list    - Mostra os produtos atuais.
  help    - Ajuda.
    """)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
    else:
        command = sys.argv[1].lower()
        if command == "run":
            # For sandbox testing, we force USE_MOCK=true unless specified
            if "USE_MOCK" not in os.environ:
                os.environ["USE_MOCK"] = "true"
            asyncio.run(run_search())
        elif command == "list":
            list_products()
        else:
            print_help()
