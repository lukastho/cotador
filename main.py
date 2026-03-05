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
    """Main execution flow: scrape, process, and export."""
    print("Iniciando busca de preços em tempo real para Goiânia...")

    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    found_results = {}
    for p in products:
        desc = p['description']
        print(f"Buscando: {desc}...")
        res = await get_best_price(desc, region="Goiânia")
        found_results[desc] = res

    print("Processando dados...")
    df = process_results('products.json', found_results)

    print("Exportando para Excel...")
    filename = export_to_excel(df)
    print(f"Relatório gerado com sucesso: {filename}")

def print_help():
    print("""
Comandos disponíveis:
  run     - Inicia a busca de preços para todos os itens da lista.
  list    - Mostra os produtos atuais no banco de dados.
  help    - Mostra esta mensagem de ajuda.
    """)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
    else:
        command = sys.argv[1].lower()
        if command == "run":
            asyncio.run(run_search())
        elif command == "list":
            list_products()
        else:
            print_help()
