import React, { useState } from 'react';
import styled from 'styled-components';
import { Download, FileText, File, Printer } from 'react-feather';
import { format } from 'date-fns';
import * as XLSX from 'xlsx'; // You'll need to install xlsx package

const ExportButton = styled.button`
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

const ExportMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const ExportOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #f5f5f5;
  }
`;

function OrderExport({ orders }) {
  const [showMenu, setShowMenu] = useState(false);

  // Prepare data for export
  const prepareData = () => {
    return orders.map(order => ({
      'Order ID': order._id,
      'Date': format(new Date(order.createdAt), 'yyyy-MM-dd'),
      'Customer Name': order.user.name,
      'Customer Email': order.user.email,
      'Status': order.status,
      'Total Amount': order.totalAmount,
      'Items': order.items.map(item => 
        `${item.product.name} (${item.quantity})`
      ).join('; '),
      'Shipping Address': `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
      'Tracking Number': order.tracking?.trackingNumber || '',
      'Carrier': order.tracking?.carrier || ''
    }));
  };

  // Export as CSV
  const exportCSV = () => {
    const data = prepareData();
    const csv = [
      Object.keys(data[0]),
      ...data.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    setShowMenu(false);
  };

  // Export as Excel
  const exportExcel = () => {
    const data = prepareData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    setShowMenu(false);
  };

  // Export as PDF
  const exportPDF = () => {
    // Implementation depends on your PDF library choice
    // Here's a simple example using browser print
    const printWindow = window.open('', '', 'height=600,width=800');
    const data = prepareData();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Orders Export</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Orders Export - ${format(new Date(), 'PPP')}</h2>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <ExportButton onClick={() => setShowMenu(!showMenu)}>
        <Download size={16} />
        Export
      </ExportButton>

      {showMenu && (
        <ExportMenu>
          <ExportOption onClick={exportCSV}>
            <FileText size={16} />
            Export as CSV
          </ExportOption>
          <ExportOption onClick={exportExcel}>
            <File size={16} />
            Export as Excel
          </ExportOption>
          <ExportOption onClick={exportPDF}>
            <Printer size={16} />
            Export as PDF
          </ExportOption>
        </ExportMenu>
      )}
    </div>
  );
}

export default OrderExport; 