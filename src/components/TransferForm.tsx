
import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useTransfers } from '@/hooks/use-transfers';

type TransferType = 'godown-to-godown' | 'godown-to-shop' | 'shop-to-shop';

interface TransferFormProps {
  onCancel?: () => void;
}

const TransferForm = ({ onCancel }: TransferFormProps) => {
  const [transferType, setTransferType] = useState<TransferType>('godown-to-godown');
  const [sourceLocation, setSourceLocation] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState([{ id: 1, productName: '', quantity: '', unit: 'pcs' }]);

  const { useCreateTransfer } = useTransfers();
  const createTransfer = useCreateTransfer();

  const handleAddItem = () => {
    const newItem = {
      id: items.length + 1,
      productName: '',
      quantity: '',
      unit: 'pcs'
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getLocationTypes = () => {
    switch (transferType) {
      case 'godown-to-godown':
        return { source: 'Godown', destination: 'Godown' };
      case 'godown-to-shop':
        return { source: 'Godown', destination: 'Shop' };
      case 'shop-to-shop':
        return { source: 'Shop', destination: 'Shop' };
      default:
        return { source: 'Location', destination: 'Location' };
    }
  };

  const locationTypes = getLocationTypes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferData = {
      transferType,
      sourceLocation,
      destinationLocation,
      transferDate,
      notes,
      items: items.filter(item => item.productName && item.quantity),
      status: 'Pending'
    };
    
    createTransfer.mutate(transferData, {
      onSuccess: () => {
        if (onCancel) onCancel();
      }
    });
  };

  return (
    <div className="stock-card">
      <h2 className="text-lg font-semibold mb-4">Create Stock Transfer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Type</label>
            <Select 
              value={transferType} 
              onValueChange={(value) => setTransferType(value as TransferType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="godown-to-godown">Godown to Godown</SelectItem>
                <SelectItem value="godown-to-shop">Godown to Shop</SelectItem>
                <SelectItem value="shop-to-shop">Shop to Shop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source {locationTypes.source}
              </label>
              <Select value={sourceLocation} onValueChange={setSourceLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select source ${locationTypes.source.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.source === 'Godown' ? (
                    <>
                      <SelectItem value="godown1">Main Warehouse</SelectItem>
                      <SelectItem value="godown2">Secondary Warehouse</SelectItem>
                      <SelectItem value="godown3">Cold Storage Facility</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="shop1">Downtown Shop</SelectItem>
                      <SelectItem value="shop2">Mall Branch</SelectItem>
                      <SelectItem value="shop3">Airport Outlet</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination {locationTypes.destination}
              </label>
              <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select destination ${locationTypes.destination.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.destination === 'Godown' ? (
                    <>
                      <SelectItem value="godown1">Main Warehouse</SelectItem>
                      <SelectItem value="godown2">Secondary Warehouse</SelectItem>
                      <SelectItem value="godown3">Cold Storage Facility</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="shop1">Downtown Shop</SelectItem>
                      <SelectItem value="shop2">Mall Branch</SelectItem>
                      <SelectItem value="shop3">Airport Outlet</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
            <Input 
              type="date" 
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Items to Transfer</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <div className="flex-grow">
                  <Select 
                    value={item.productName} 
                    onValueChange={(value) => handleItemChange(item.id, 'productName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product1">Laptop</SelectItem>
                      <SelectItem value="product2">Smartphone</SelectItem>
                      <SelectItem value="product3">Headphones</SelectItem>
                      <SelectItem value="product4">Monitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-20">
                  <Input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                    placeholder="Qty" 
                  />
                </div>
                
                <div className="w-20">
                  <Select 
                    value={item.unit} 
                    onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="boxes">boxes</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 size={18} className="text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="mt-3" 
            onClick={handleAddItem}
          >
            <Plus size={16} className="mr-1" />
            Add More Items
          </Button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-stock-blue-500" 
            rows={3}
            placeholder="Add any additional notes or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="default" 
            className="bg-stock-blue-600 hover:bg-stock-blue-700"
            disabled={createTransfer.isPending}
          >
            {createTransfer.isPending ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Transfer'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;
