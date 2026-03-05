# Buscador de Preços Elétricos - Goiânia

Este programa automatiza a busca de preços em tempo real para uma lista de 20 itens elétricos, comparando-os com custos médios predefinidos e gerando um relatório em Excel com destaques de oportunidades.

## Funcionalidades
- Busca em marketplaces (Mercado Livre, etc.) com foco na região de Goiânia.
- Cálculo de variação percentual (Δ%) entre o preço encontrado e o custo médio.
- Destaque visual (cor verde) para itens com preço pelo menos 5% abaixo do custo médio.
- Exportação automática para Excel (.xlsx) com data e hora.

## Como Executar
1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```
2. Inicie a busca:
   ```bash
   python3 main.py run
   ```
3. Liste os produtos configurados:
   ```bash
   python3 main.py list
   ```

## Configuração
Os itens de busca e seus custos médios são armazenados no arquivo `products.json`. Sinta-se à vontade para editar este arquivo para adicionar novos itens ou atualizar os preços de referência.

## Estrutura do Projeto
- `main.py`: Interface de linha de comando.
- `scraper.py`: Lógica de extração de dados e fallback.
- `data_processor.py`: Tratamento de dados e cálculos com Pandas.
- `excel_exporter.py`: Geração do arquivo formatado.
- `products.json`: Banco de dados de produtos e custos.
