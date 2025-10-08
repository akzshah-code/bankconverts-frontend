// src/components/DataPreviewTable.tsx

import React, { useState, useEffect } from 'react';

interface Transaction {
  [key: string]: any;
}

interface DataPreviewTableProps {
  initialData: Transaction[];
  onConvert: (data: Transaction[]) => void;
  onCancel: () => void;
}

function DataPreviewTable({ initialData, onConvert, onCancel }: DataPreviewTableProps): React.JSX.Element {
  const [editedData, setEditedData] = useState<Transaction[]>([]);

  useEffect(() => {
    setEditedData(initialData);
  }, [initialData]);

  if (!editedData || editedData.length === 0) {
    return <p className="p-4 text-center text-gray-500">No data available for preview.</p>;
  }

  const headers = Object.keys(editedData[0]);

  const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
    const updatedData = editedData.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [columnId]: value };
      }
      return row;
    });
    setEditedData(updatedData);
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Review and Edit Your Data</h3>
      
      {/* This container makes the table scroll horizontally on small screens */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th 
                  key={header} 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="text"
                      value={row[header] || ''}
                      onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                      className="w-full bg-transparent border-0 p-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-gray-50 rounded-md"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button 
          onClick={onCancel} 
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button 
          onClick={() => onConvert(editedData)} 
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Confirm & Download
        </button>
      </div>
    </div>
  );
}

export default DataPreviewTable;
