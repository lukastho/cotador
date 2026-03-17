import pandas as pd
from openpyxl.styles import PatternFill
from datetime import datetime

def export_to_excel(df, filename_prefix="Relatorio_Precos_Stealth"):
    """
    Exports the DataFrame to Excel with formatting.
    Items marked as 'OPORTUNIDADE' are highlighted in green.
    """
    date_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{filename_prefix}_{date_str}.xlsx"

    # Write to Excel
    writer = pd.ExcelWriter(filename, engine='openpyxl')
    df.to_excel(writer, index=False, sheet_name='Resultados')

    workbook = writer.book
    worksheet = writer.sheets['Resultados']

    # Highlight opportunities in green
    green_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")

    for row_idx, status in enumerate(df["Status_Compra"], start=2): # Headers are row 1
        if status == 'OPORTUNIDADE':
            # Highlight the whole row
            for col_idx in range(1, len(df.columns) + 1):
                cell = worksheet.cell(row=row_idx, column=col_idx)
                cell.fill = green_fill

    writer.close()
    return filename
