// pages/client/client-list.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReusableTable from '@/components/ReusableTable/ReusableTable';
import { getColumnsForPage } from '@/constants/tableColumns';

const ClientList = () => {
  const dispatch = useDispatch();
  // const { clients, loading, clientCustomFields, pagination } = useSelector(state => state.client);

  // Mock data for testing
  const clients = [
    {
      client_id: 1,
      serial_number: 'CL001',
      client_name: 'John Doe',
      email: 'john@example.com',
      created_at: '2024-01-15'
    },
    {
      client_id: 2,
      serial_number: 'CL002',
      client_name: 'Jane Smith',
      email: 'jane@example.com',
      created_at: '2024-01-16'
    },
    {
      client_id: 3,
      serial_number: 'CL003',
      client_name: 'Bob Johnson',
      email: 'bob@example.com',
      created_at: '2024-01-17'
    }
  ];
  const loading = false;
  const clientCustomFields = [];
  const pagination = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 45,
    pageSize: 10
  };

  const fixedColumns = getColumnsForPage('client-list');

  const dynamicColumns = (clientCustomFields || []).map(field => ({
    id: field.column_id,
    label: field.label,
    type: field.fieldType,
    sortable: true,
    width: field.width || 200
  }));

  const tableData = (clients || []).map(client => {
    const row = {
      id: client.client_id,
      serial_number: client.serial_number,
      client_name: client.client_name,
      email: client.email,
      created_at: client.created_at
    };

    (clientCustomFields || []).forEach(field => {
      const customValue = client.customValues?.find(v => v.column_id === field.column_id);
      row[field.column_id] = customValue?.row_value || '';
    });

    return row;
  });

  const handleAction = (action, row) => {
    console.log(`${action} action on:`, row);
  };

  const handleSelectionChange = (selectedIds) => {
    console.log('Selected clients:', selectedIds);
  };

  const handlePageChange = (newPage) => {
    console.log('Page changed to:', newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    console.log('Page size changed to:', newPageSize);
  };

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
    // Navigate to client details or open modal
  };

  const handleSort = (sortConfig) => {
    console.log('Sort config:', sortConfig);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Client List</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'CLIENT/CREATE' })}
          >
            Add New Client
          </button>
        </div>
      </div>

      <ReusableTable
        tableId="client_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={dynamicColumns}
        sortable={true}
        resizable={true}
        selectable={true}
        onAction={handleAction}
        onSort={handleSort}
        onRowClick={handleRowClick}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No clients found"
        // Pagination props
        pagination={true}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ClientList;