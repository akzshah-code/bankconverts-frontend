// src/components/DataPreviewTable.tsx

import React, { useState, useEffect } from 'react';

// Define a type for a single transaction row
interface Transaction {
  [key: string]: any;
}

// Define the props for our component
interface DataPreviewTableProps {
  initialData: Transaction[];
  onConvert: (data: Transaction[]) => void; // Callback to trigger conversion
  onCancel: () => void; // Callback to go back
}

function DataPreviewTable({ initialData, onConvert, onCancel }: DataPreviewTableProps): React.JSX.Element {
  const [editedData, setEditedData] = useState<Transaction[]>([]);

  useEffect(() => {
    // Initialize the state with the data passed from the parent
    setEditedData(initialData);
  }, [initialData]);

  if (!editedData || editedData.length === 0) {
    return <p>No data to display.</p>;
  }

  const headers = Object.keys(editedData[0]);

  // Function to handle changes in any table cell
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
    <div className="data-preview-container">
      <h3>Review and Edit Your Data</h3>
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {editedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td key={header}>
                  <input
                    type="text"
                    value={row[header] || ''}
                    onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-group">
        <button onClick={() => onConvert(editedData)}>Confirm & Download</button>
        <button onClick={onCancel} className="cancel-button">Cancel</button>
      </div>
    </div>
  );
}

export default DataPreviewTable;
