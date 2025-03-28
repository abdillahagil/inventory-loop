
import React from 'react';
import TransferForm from '@/components/TransferForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpDown, 
  Filter, 
  Search,
  ArrowRight,
  CheckCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTransfers } from '@/hooks/use-transfers';
import { Skeleton } from '@/components/ui/skeleton';

// Fallback sample data
const sampleTransfers = [
  { 
    id: 'TR-001', 
    source: 'Main Warehouse', 
    destination: 'Downtown Shop', 
    items: '5 items', 
    requestedBy: 'John Doe', 
    date: '2023-06-10', 
    status: 'Completed' 
  },
  { 
    id: 'TR-002', 
    source: 'Secondary Warehouse', 
    destination: 'Mall Branch', 
    items: '3 items', 
    requestedBy: 'Sarah Smith', 
    date: '2023-06-09', 
    status: 'In Transit' 
  },
  { 
    id: 'TR-003', 
    source: 'Main Warehouse', 
    destination: 'Airport Outlet', 
    items: '8 items', 
    requestedBy: 'Mike Johnson', 
    date: '2023-06-08', 
    status: 'Pending' 
  },
  { 
    id: 'TR-004', 
    source: 'Downtown Shop', 
    destination: 'Mall Branch', 
    items: '2 items', 
    requestedBy: 'Emily Davis', 
    date: '2023-06-07', 
    status: 'Completed' 
  },
  { 
    id: 'TR-005', 
    source: 'Main Warehouse', 
    destination: 'Secondary Warehouse', 
    items: '12 items', 
    requestedBy: 'Alex Turner', 
    date: '2023-06-06', 
    status: 'Cancelled' 
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Completed':
      return (
        <Badge className="bg-alert-green flex items-center gap-1">
          <CheckCircle size={12} />
          Completed
        </Badge>
      );
    case 'In Transit':
      return (
        <Badge variant="outline" className="border-stock-blue-500 text-stock-blue-700 flex items-center gap-1">
          <ArrowRight size={12} />
          In Transit
        </Badge>
      );
    case 'Pending':
      return (
        <Badge variant="outline" className="border-alert-amber text-alert-amber flex items-center gap-1">
          <Clock size={12} />
          Pending
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle size={12} />
          Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const Transfers = () => {
  const [showForm, setShowForm] = React.useState(false);
  const { useAllTransfers, useUpdateTransferStatus } = useTransfers();
  const { data: transfers, isLoading } = useAllTransfers();
  const updateTransferStatus = useUpdateTransferStatus();
  
  // Use API data if available, otherwise fall back to sample data
  const displayedTransfers = transfers || sampleTransfers;
  
  const handleStatusUpdate = (id: string, status: string) => {
    updateTransferStatus.mutate({ id, status });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Stock Transfers</h1>
          <p className="text-gray-600">Manage and track stock transfers between locations</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-stock-blue-600 hover:bg-stock-blue-700"
          >
            Create New Transfer
          </Button>
        )}
      </div>
      
      {showForm ? (
        <div>
          <TransferForm onCancel={() => setShowForm(false)} />
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
            >
              Cancel & Return to Transfers
            </Button>
          </div>
        </div>
      ) : (
        <div className="stock-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Transfers</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search transfers..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stock-blue-500 w-48"
                />
              </div>
              <button className="flex items-center p-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter size={16} className="mr-1" />
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">
                    <div className="flex items-center cursor-pointer">
                      Transfer ID
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="whitespace-nowrap">From</th>
                  <th className="whitespace-nowrap">To</th>
                  <th className="whitespace-nowrap">Items</th>
                  <th className="whitespace-nowrap">Requested By</th>
                  <th className="whitespace-nowrap">Date</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, index) => (
                    <tr key={`loading-${index}`}>
                      <td><Skeleton className="h-5 w-full" /></td>
                      <td><Skeleton className="h-5 w-full" /></td>
                      <td><Skeleton className="h-5 w-full" /></td>
                      <td><Skeleton className="h-5 w-full" /></td>
                      <td><Skeleton className="h-5 w-full" /></td>
                      <td><Skeleton className="h-5 w-full" /></td>
                      <td><Skeleton className="h-5 w-20" /></td>
                      <td><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : displayedTransfers.length > 0 ? (
                  // Actual data
                  displayedTransfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td className="font-medium">{transfer.id}</td>
                      <td>{transfer.source}</td>
                      <td>{transfer.destination}</td>
                      <td>{transfer.items}</td>
                      <td>{transfer.requestedBy}</td>
                      <td>{transfer.date}</td>
                      <td>{getStatusBadge(transfer.status)}</td>
                      <td>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-stock-blue-700">
                            View
                          </Button>
                          
                          {transfer.status === 'Pending' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-alert-green"
                              onClick={() => handleStatusUpdate(transfer.id, 'In Transit')}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // No data
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500">
                      No transfers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="text-gray-500">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `Showing 1-${displayedTransfers.length} of ${displayedTransfers.length} transfers`
              )}
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
