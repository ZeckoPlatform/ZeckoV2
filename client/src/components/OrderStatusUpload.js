import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, AlertCircle, CheckCircle } from 'react-feather';
import * as XLSX from 'xlsx';

const UploadContainer = styled.div`
  margin: 20px 0;
`;

const UploadButton = styled.button`
  padding: 8px 15px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    opacity: 0.9;
  }
`;

const ResultMessage = styled.div`
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.success ? `
    background-color: #d4edda;
    color: #155724;
  ` : `
    background-color: #f8d7da;
    color: #721c24;
  `}
`;

const Template = styled.a`
  color: var(--primary-color);
  text-decoration: none;
  margin-left: 10px;
  
  &:hover {
    text-decoration: underline;
  }
`;

function OrderStatusUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const downloadTemplate = () => {
    const template = [
      ['Order ID', 'New Status', 'Tracking Number (optional)', 'Carrier (optional)'],
      ['123456', 'shipped', 'TN123456', 'DHL'],
      ['789012', 'delivered', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'order-status-template.xlsx');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const updates = [];
        const errors = [];

        // Validate data
        for (const row of rows) {
          if (!row['Order ID'] || !row['New Status']) {
            errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
            continue;
          }

          if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(row['New Status'])) {
            errors.push(`Invalid status "${row['New Status']}" for order ${row['Order ID']}`);
            continue;
          }

          updates.push({
            orderId: row['Order ID'],
            status: row['New Status'],
            tracking: row['Tracking Number (optional)'] ? {
              trackingNumber: row['Tracking Number (optional)'],
              carrier: row['Carrier (optional)'] || 'Other'
            } : null
          });
        }

        if (errors.length > 0) {
          setResult({
            success: false,
            message: 'Validation errors found',
            errors
          });
          return;
        }

        // Process updates
        try {
          const response = await fetch('/api/orders/bulk-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ updates })
          });

          const result = await response.json();

          if (response.ok) {
            setResult({
              success: true,
              message: `Successfully updated ${updates.length} orders`
            });
            if (onUploadComplete) onUploadComplete();
          } else {
            setResult({
              success: false,
              message: result.error || 'Failed to update orders'
            });
          }
        } catch (error) {
          setResult({
            success: false,
            message: 'Failed to process updates'
          });
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to read file'
      });
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <UploadContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="status-upload"
        />
        <label htmlFor="status-upload">
          <UploadButton as="span" disabled={uploading}>
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Status Updates'}
          </UploadButton>
        </label>
        <Template onClick={downloadTemplate}>
          Download Template
        </Template>
      </div>

      {result && (
        <ResultMessage success={result.success}>
          {result.success ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {result.message}
          {result.errors && (
            <ul>
              {result.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </ResultMessage>
      )}
    </UploadContainer>
  );
}

export default OrderStatusUpload; 