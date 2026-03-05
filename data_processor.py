import pandas as pd
import json

def calculate_delta(found_price, average_cost):
    """
    Calculates Δ% variation.
    Formula: ((Found Price - Average Cost) / Average Cost) * 100
    """
    if average_cost == 0:
        return 0
    return ((found_price - average_cost) / average_cost) * 100

def process_results(products_file, found_results):
    """
    Processes the raw results and compares them with the average costs.
    """
    with open(products_file, 'r', encoding='utf-8') as f:
        products = json.load(f)

    df_rows = []
    total_avg_cost = sum(p['average_cost'] * p['quantity'] for p in products)

    # Threshold for opportunity (5% below total list cost R$ 7.990,35)
    OPPORTUNITY_THRESHOLD_TOTAL = 7990.35 * 0.95

    for product in products:
        found = found_results.get(product['description'], [])

        if not found:
            # Entry for items not found
            df_rows.append({
                "Nome do Produto": product['description'],
                "Loja": "Não Encontrado",
                "Preço Atual": None,
                "Custo Médio (PDF)": product['average_cost'],
                "Diferença Real (R$)": None,
                "Δ%": None,
                "Oportunidade": False
            })
            continue

        # Get the best found price for this item
        best_match = min(found, key=lambda x: x['price'])

        price_found = best_match['price']
        avg_cost = product['average_cost']
        delta = calculate_delta(price_found, avg_cost)
        diff_real = price_found - avg_cost

        # Rule: opportunity if price is at least 5% below average list total (or item specific?)
        # User requested: "itens que estejam com preço pelo menos 5% abaixo do custo médio de R$ 7.990,35 do total da lista"
        # This part is a bit ambiguous - 5% below the total? Or 5% below the item's cost if total is high?
        # Interpreting as: highlight if price < 0.95 * avg_cost
        is_opportunity = delta <= -5.0

        df_rows.append({
            "Nome do Produto": product['description'],
            "Loja": best_match['store'],
            "Preço Atual": price_found,
            "Custo Médio (PDF)": avg_cost,
            "Diferença Real (R$)": diff_real,
            "Δ%": f"{delta:.2f}%",
            "Oportunidade": is_opportunity
        })

    return pd.DataFrame(df_rows)

if __name__ == "__main__":
    # Test
    with open('products.json', 'r') as f:
        ps = json.load(f)
    mock_results = {
        ps[0]['description']: [{"title": "Test", "price": 3.50, "store": "Test Store"}],
        ps[1]['description']: [{"title": "Test", "price": 20.0, "store": "Test Store"}]
    }
    df = process_results('products.json', mock_results)
    print(df.head())
