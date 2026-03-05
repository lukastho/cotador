import unittest
import json
import os
from data_processor import calculate_delta, process_results

class TestDataProcessor(unittest.TestCase):
    def test_calculate_delta(self):
        self.assertAlmostEqual(calculate_delta(150, 100), 50.0)
        self.assertAlmostEqual(calculate_delta(50, 100), -50.0)
        self.assertEqual(calculate_delta(100, 100), 0.0)

    def test_process_results(self):
        # Create a temp products file
        test_products = [{"description": "Item A", "average_cost": 10.0, "quantity": 1}]
        with open('test_products.json', 'w') as f:
            json.dump(test_products, f)

        mock_res = {"Item A": [{"title": "Item A Found", "price": 9.0, "store": "Store X"}]}
        df = process_results('test_products.json', mock_res)

        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]["Nome do Produto"], "Item A")
        self.assertEqual(df.iloc[0]["Δ%"], "-10.00%")
        self.assertTrue(df.iloc[0]["Oportunidade"])

        os.remove('test_products.json')

if __name__ == "__main__":
    unittest.main()
