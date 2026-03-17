import pandas as pd
import json

def calculate_percentage_variation(web_price, ref_cost):
    """
    Calcula a variação percentual (Δ%) entre o preço web e o custo de referência.
    FÓRMULA: ((Preço Web - Custo Ref) / Custo Ref) * 100
    """
    if not ref_cost or ref_cost == 0:
        return 0.0 # Evita divisão por zero
    return ((web_price - ref_cost) / ref_cost) * 100

def process_results(products_source, found_results):
    """
    Processa os resultados brutos e os compara com os custos de referência.

    PARÂMETROS:
    - products_source: Caminho para o arquivo JSON ou uma lista de dicionários de produtos.
    - found_results: Dicionário mapeando descrição do produto para lista de anúncios encontrados.
    """
    # Carregamento polimórfico: aceita arquivo ou lista dinâmica
    if isinstance(products_source, str):
        with open(products_source, 'r', encoding='utf-8') as f:
            products = json.load(f)
    else:
        products = products_source

    df_rows = []

    for product in products:
        desc = product['description']
        found = found_results.get(desc, [])

        avg_cost = product['average_cost']

        # Caso nenhum anúncio tenha sido encontrado para o item
        if not found:
            df_rows.append({
                "Produto": desc,
                "Preço Web": None,
                "Custo Referência": avg_cost,
                "Diferença em R$": None,
                "Link": "Não Encontrado",
                "Variação %": None,
                "Status_Compra": "NÃO ENCONTRADO"
            })
            continue

        # Seleciona o melhor preço (mínimo) entre os resultados filtrados
        best_match = min(found, key=lambda x: x['price'])

        price_found = best_match['price']
        diff_real = price_found - avg_cost
        var_percent = calculate_percentage_variation(price_found, avg_cost)

        # LÓGICA DE VIABILIDADE (Regra dos 5%):
        # Se for 5% ou mais barato: OPORTUNIDADE DE COMPRA
        if var_percent <= -5.0:
            status = 'OPORTUNIDADE DE COMPRA'
        elif price_found <= avg_cost:
            status = 'DENTRO DO ORÇAMENTO'
        else:
            status = 'ACIMA DO ORÇAMENTO'

        # Montagem da linha da tabela seguindo a ordem solicitada
        df_rows.append({
            "Produto": desc,
            "Preço Web": price_found,
            "Custo Referência": avg_cost,
            "Diferença em R$": f"R$ {diff_real:.2f}",
            "Link": best_match['link'],
            "Variação %": f"{var_percent:+.2f}%",
            "Status_Compra": status
        })

    return pd.DataFrame(df_rows)
