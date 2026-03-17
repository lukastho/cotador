import asyncio
import json
import sys
import os
from src.scraper import get_best_price
from src.data_processor import process_results
from src.excel_exporter import export_to_excel

# Localização do banco de dados de produtos da Solicitação 627
PRODUCTS_FILE = 'data/products.json'

def list_products():
    """Exibe no terminal a lista atual de itens configurados no JSON."""
    if not os.path.exists(PRODUCTS_FILE):
        print(f"Erro: Arquivo {PRODUCTS_FILE} não encontrado.")
        return

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
        print("\n=== LISTA DE ITENS PARA BUSCA (SOLICITAÇÃO 627) ===")
        # Mostra Descrição e Custo com formatação alinhada
        for i, p in enumerate(products):
            print(f"{i+1:2d}. {p['description']:<50} | Custo: R$ {p['average_cost']:>8.4f}")
        print("===================================================\n")

async def search_and_store(product, results_dict, region="Goiânia"):
    """
    Trabalhador (Worker) que executa a busca de um único item e guarda o resultado.
    Esta função é chamada em paralelo para ganhar performance.
    """
    desc = product['description']
    part_code = product.get('part_code')
    print(f"Iniciando busca ({region}): {desc}...")

    # Chama o motor de scraping (src/scraper.py)
    res = await get_best_price(desc, part_code=part_code, region=region)
    results_dict[desc] = res
    print(f"Finalizado: {desc}")

async def run_search(products=None, region="Goiânia"):
    """
    Fluxo principal de execução: busca paralela, processamento e exportação.
    """
    # Se nenhum produto for passado, carrega a lista completa do PDF/JSON
    if products is None:
        if not os.path.exists(PRODUCTS_FILE):
            print(f"Arquivo {PRODUCTS_FILE} não encontrado.")
            return
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            products = json.load(f)

    print(f"\nIniciando busca STEALTH para {region} ({len(products)} itens)...\n")

    found_results = {}

    # DISPARO PARALELO: asyncio.gather executa várias buscas simultaneamente
    # O semáforo no scraper.py controla para não abrir navegadores demais ao mesmo tempo
    tasks = [search_and_store(p, found_results, region=region) for p in products]
    await asyncio.gather(*tasks)

    print("\nProcessando dados e gerando relatório...")

    # Define a fonte de dados para o processador (Arquivo ou Lista Temporária)
    is_batch = products is None or len(products) > 1 or products[0].get("id") != "CUSTOM"
    source = PRODUCTS_FILE if is_batch else products

    df = process_results(source, found_results)

    # Exibe a tabela resumo no terminal para conferência imediata
    print("\n=== RESUMO DOS RESULTADOS ===")
    print(df.to_string(index=False))
    print("==============================\n")

    # Gera o arquivo Excel final
    filename = export_to_excel(df)
    print(f"Relatório gerado com sucesso: {filename}")

async def interactive_mode(region="Goiânia"):
    """Interface de linha de comando interativa."""
    print("\n=== BUSCADOR DE PREÇOS ELÉTRICOS (STEALTH) ===")
    print(f"Região de busca: {region}")
    print("----------------------------------------------")

    while True:
        # Mostra a lista de produtos cadastrados no início de cada ciclo
        list_products()

        prompt = "\nDigite o NOME de um produto para buscar OU pressione [ENTER] para atualizar a lista completa (ou 'sair'): "
        user_input = input(prompt).strip()

        # Comandos de saída
        if user_input.lower() in ['sair', 'exit', 'quit']:
            print("Encerrando programa...")
            break

        if user_input == "":
            # Caso o usuário aperte apenas Enter -> Busca os 20 itens do PDF
            print("\nAtualizando lista completa do PDF...")
            await run_search(region=region)
        else:
            # Caso o usuário digite um nome -> Busca apenas aquele item avulso
            print(f"\nBuscando produto específico: {user_input}")
            custom_product = {
                "id": "CUSTOM",
                "description": user_input,
                "average_cost": 0.0 # Custo zero para itens fora da lista oficial
            }
            await run_search(products=[custom_product], region=region)

        print("\n--- Ciclo finalizado. Voltando ao menu principal ---")

if __name__ == "__main__":
    # Permite passar a região como argumento (Ex: python3 main.py Goias)
    region_arg = sys.argv[1] if len(sys.argv) > 1 else "Goiânia"

    # MOCK MODE: Por padrão, usamos dados simulados para proteger seu IP durante testes.
    # Para rodar o scraper real, execute: USE_MOCK=false python3 main.py
    if "USE_MOCK" not in os.environ:
        os.environ["USE_MOCK"] = "true"

    try:
        # Inicia o loop de eventos assíncronos
        asyncio.run(interactive_mode(region=region_arg))
    except KeyboardInterrupt:
        print("\nPrograma interrompido pelo usuário.")
