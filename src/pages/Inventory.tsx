
import React from 'react';
import StockTable from '@/components/StockTable';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Upload, Download } from 'lucide-react';

const sampleInventoryData = [
  { id: '1', name: 'Laptop Dell XPS 13', sku: 'LAP-DEL-001', category: 'Electronics', location: 'Main Warehouse', quantity: 24, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-10' },
  { id: '2', name: 'iPhone 13 Pro', sku: 'PHN-APP-002', category: 'Electronics', location: 'Main Warehouse', quantity: 5, unit: 'pcs', status: 'Low' as const, lastUpdated: '2023-06-09' },
  { id: '3', name: 'Wireless Headphones', sku: 'AUD-SNY-003', category: 'Electronics', location: 'Downtown Shop', quantity: 32, unit: 'pcs', status: 'High' as const, lastUpdated: '2023-06-08' },
  { id: '4', name: 'Smart Watch Series 7', sku: 'WTC-APP-004', category: 'Wearables', location: 'Mall Branch', quantity: 18, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-07' },
  { id: '5', name: 'Gaming Mouse', sku: 'ACC-LOG-005', category: 'Accessories', location: 'Main Warehouse', quantity: 41, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-06' },
  { id: '6', name: 'External SSD 1TB', sku: 'STR-SMS-006', category: 'Storage', location: 'Secondary Warehouse', quantity: 15, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-05' },
  { id: '7', name: 'Bluetooth Speaker', sku: 'AUD-JBL-007', category: 'Audio', location: 'Downtown Shop', quantity: 8, unit: 'pcs', status: 'Low' as const, lastUpdated: '2023-06-04' },
  { id: '8', name: 'Mechanical Keyboard', sku: 'ACC-LOG-008', category: 'Accessories', location: 'Mall Branch', quantity: 12, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-03' },
  { id: '9', name: 'Monitor 27"', sku: 'DSP-DEL-009', category: 'Displays', location: 'Main Warehouse', quantity: 7, unit: 'pcs', status: 'Low' as const, lastUpdated: '2023-06-02' },
  { id: '10', name: 'Wireless Mouse', sku: 'ACC-LOG-010', category: 'Accessories', location: 'Airport Outlet', quantity: 25, unit: 'pcs', status: 'Normal' as const, lastUpdated: '2023-06-01' },
];

const Inventory = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage and track your product inventory across all locations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Upload size={16} className="mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <FileText size={16} className="mr-1" />
            Report
          </Button>
          <Button className="bg-stock-blue-600 hover:bg-stock-blue-700 flex items-center">
            <Plus size={16} className="mr-1" />
            Add Product
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stock-card">
          <h3 className="text-lg font-semibold">Categories</h3>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span>Electronics</span>
              <span className="text-sm text-gray-500">45</span>
            </li>
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span>Accessories</span>
              <span className="text-sm text-gray-500">78</span>
            </li>
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span>Wearables</span>
              <span className="text-sm text-gray-500">24</span>
            </li>
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span>Audio</span>
              <span className="text-sm text-gray-500">35</span>
            </li>
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span>Displays</span>
              <span className="text-sm text-gray-500">18</span>
            </li>
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span>Storage</span>
              <span className="text-sm text-gray-500">29</span>
            </li>
          </ul>
          <div className="mt-3 pt-3 border-t">
            <button className="text-stock-blue-600 text-sm hover:underline">
              Manage Categories
            </button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <StockTable 
            title="All Products"
            items={sampleInventoryData}
          />
        </div>
      </div>
    </div>
  );
};

export default Inventory;
