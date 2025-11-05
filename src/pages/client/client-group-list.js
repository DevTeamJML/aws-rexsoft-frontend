// pages/client/client-list.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReusableTable from '@/components/ReusableTable/ReusableTable';
import { getColumnsForPage } from '@/constants/tableColumns';
import { PageHeader } from '@/components/PageLayout/PageHeader';
import { useRouter } from 'next/router';

const ClientGroupList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // const { clients, loading, clientCustomFields, pagination } = useSelector(state => state.client);

  // Mock data for testing
  const clients = [
    {
      client_group_id: 1,
      client_group_name: 'CL001',
      created_at: '2024-01-15'
    },
    {
      client_group_id: 2,
      client_group_name: 'CL002',
      created_at: '2024-01-16'
    },
    {
      client_group_id: 3,
      client_group_name: 'CL003',
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

  const fixedColumns = getColumnsForPage('client-group-list');

  const tableData = (clients || []).map(group => {
    const row = {
      id: group.client_group_id,
      client_group_name: group.client_group_name,
      created_at: group.created_at
    };

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
    <div className="client-group-page-container">
      <PageHeader />
      <div className="title-container">
        <h1>Client Group List</h1>
        <div className="title-actions">
          <button 
            className="btn btn-primary"
            onClick={() => router.push("/client/group-list/new-client-group")}
          >
            Add New Group
          </button>
        </div>
      </div>

      <ReusableTable
        tableId="client_group_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
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

export default ClientGroupList;