import pandas as pd
import json

def process_results(products_file, found_results):
    """
    Processes the raw results and compares them with the reference costs (FOTO).
    """
    with open(products_file, 'r', encoding='utf-8') as f:
        products = json.load(f)

    df_rows = []

    for product in products:
        desc = product['description']
        found = found_results.get(desc, [])

        avg_cost = product['average_cost']

        if not found:
            df_rows.append({
                "Produto": desc,
                "Melhor Preço Web": None,
                "Custo Referência FOTO": avg_cost,
                "Diferença R$": None,
                "Link do Anúncio": "Não Encontrado",
                "Status_Compra": "NÃO ENCONTRADO"
            })
            continue

        # Get the best found price for this item
        best_match = min(found, key=lambda x: x['price'])

        price_found = best_match['price']
        diff_real = price_found - avg_cost

        # Calculation of Viability
        # If price < average_cost: OPORTUNIDADE
        # If price > average_cost: ACIMA DO ORÇAMENTO
        if price_found < avg_cost:
            status = 'OPORTUNIDADE'
        else:
            status = 'ACIMA DO ORÇAMENTO'

        df_rows.append({
            "Produto": desc,
            "Melhor Preço Web": price_found,
            "Custo Referência FOTO": avg_cost,
            "Diferença R$": f"R$ {diff_real:.2f}",
            "Link do Anúncio": best_match['link'],
            "Status_Compra": status
        })

    return pd.DataFrame(df_rows)
