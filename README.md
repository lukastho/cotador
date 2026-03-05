# Buscador de Preços Elétricos - Versão Stealth (Goiânia)

Este programa automatiza a busca de preços em tempo real para itens elétricos da Solicitação de Compra 627, comparando-os com custos de referência e gerando um relatório em Excel.

## Funcionalidades Stealth
- **Camuflagem:** Utiliza `undetected-chromedriver` e `selenium-stealth` para evitar detecção por bots.
- **Comportamento Humano:** Delays aleatórios entre 4 e 9 segundos e User-Agents rotativos.
- **Busca Refinada:** Combina nome do produto com código da peça para maior precisão.
- **Filtro de Qualidade:** Ignora anúncios de itens usados, com defeito ou para conserto.

## Como Executar
1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
2. Inicie a busca:
   ```bash
   python3 main.py run
   ```
   *Nota: O script prioriza vendedores da região de Goiânia/Goiás.*

3. Verifique a lista de produtos:
   ```bash
   python3 main.py list
   ```

## Configuração
- `products.json`: Contém os itens, códigos de peça e custos de referência da FOTO 627.
- `main.py`: Interface CLI.
- `scraper.py`: Lógica de raspagem stealth e fallback.
- `data_processor.py`: Cálculo de viabilidade (OPORTUNIDADE vs ACIMA DO ORÇAMENTO).
- `excel_exporter.py`: Geração do relatório formatado com destaques em verde.

## Requisitos
- Python 3.x
- Google Chrome instalado no sistema.
