import pandas as pd
import json

def calculate_percentage_variation(web_price, ref_cost):
    """
    Calculates the percentage variation using the formula:
    ((Web Price - Ref Cost) / Ref Cost) * 100
    """
    if not ref_cost or ref_cost == 0:
        return 0.0
    return ((web_price - ref_cost) / ref_cost) * 100

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
                "Preço Web": None,
                "Custo Referência": avg_cost,
                "Diferença em R$": None,
                "Variação %": None,
                "Link": "Não Encontrado",
                "Status_Compra": "NÃO ENCONTRADO"
            })
            continue

        # Get the best found price for this item
        best_match = min(found, key=lambda x: x['price'])

        price_found = best_match['price']
        diff_real = price_found - avg_cost
        var_percent = calculate_percentage_variation(price_found, avg_cost)

        # Calculation of Viability
        # If price is 5% or more cheaper than average_cost: OPORTUNIDADE DE COMPRA
        # Otherwise: ACIMA DO ORÇAMENTO or DENTRO DO ORÇAMENTO
        if var_percent <= -5.0:
            status = 'OPORTUNIDADE DE COMPRA'
        elif price_found <= avg_cost:
            status = 'DENTRO DO ORÇAMENTO'
        else:
            status = 'ACIMA DO ORÇAMENTO'

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
