// pages/client/client-list.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useRouter } from "next/router";
import {
  getAllClientGroupsName,
  getSelectedClientGroup,
  useSelectAllClientGroupsName,
  useSelectCurrGroup,
} from "../../../redux/slices/clientGroupSlice";
import {
  useSelectCurrCompany,
  useSelectCurrCompanyId,
} from "../../../redux/slices/companySlice";
import { getFromLocalStorage } from "@/utils/localStorage";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import {
  bulkDeleteClient,
  deleteClient,
  getAllClients,
  handleOnChangeClientGroup,
  setSelectedClientIds,
  setSelectedClientIdsSuccess,
  useSelectAllClients,
  useSelectClientPagination,
  useSelectCurrSelectedGroup,
  useSelectCurrSelectedGroupId,
} from "../../../redux/slices/clientSlice";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../redux/slices/confirmModalSlice";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  FaSearch,
  FaTrash,
  FaFilter,
  FaColumns,
  FaSort,
  FaTable,
  FaEye,
  FaEyeSlash,
  FaSlidersH,
  FaEdit,
} from "react-icons/fa";
import FilterDrawer from "@/components/Misc/FilterDrawer";
import ColumnOrderDrawer from "@/components/Misc/ColumnOrderDrawer";

const ClientList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currCompanyId = useSelectCurrCompanyId();
  const allGroupNames = useSelectAllClientGroupsName();
  const currSelectedGroupId = useSelectCurrSelectedGroupId();
  const currSelectedGroup = useSelectCurrGroup();
  const showModal = useSelectShowModal();
  const clients = useSelectAllClients();
  const pagination = useSelectClientPagination();
  // const [pagination, setPagination] = useState({
  //   pageIndex: 0,
  //   pageSize: 200,
  //   currentPage: 1,
  //   totalPages: 0,
  // });

  const [modalType, setModalType] = useState("");

  const [targetClientId, setTargetClientId] = useState();
  const [searchText, setSearchText] = useState("");
  const [rowSelectedIds, setRowSelectedIds] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState({});

  const fixedColumns = getColumnsForPage("client-list");

  const modalDescription = {
    bulkDelete: "Are you sure you want to delete these clients ?",
    delete: "Are you sure you want to delete this client ?",
  };

  const loading = false;
  const clientCustomFields = [];

  useEffect(() => {
    if (!currSelectedGroup) return;

    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: filters,
        fixedColumns,
      })
    );
  }, [currSelectedGroup]);

  useEffect(() => {
    if (currSelectedGroup === null) return;
    if (searchText === "" || fixedColumns.length === 0) return;

    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: filters,
        fixedColumns,
        searchText: searchText,
      })
    );
  }, [searchText]);

  useEffect(() => {
    if (currCompanyId) {
      dispatch(getAllClientGroupsName({ company_id: currCompanyId }));
    }
  }, [currCompanyId]);

  useEffect(() => {
    if (allGroupNames.length > 0) {
      const storedSelectedClientGroupId = getFromLocalStorage(
        process.env.CURR_SELECTED_GROUP_ID
      );

      const targetGroupId =
        storedSelectedClientGroupId || allGroupNames[0].client_group_id;

      dispatch(getSelectedClientGroup({ client_group_id: targetGroupId }));
    }
  }, [allGroupNames]);

  const groupOptionList = useMemo(() => {
    return allGroupNames?.map((g) => ({
      value: g.client_group_id,
      label: g.client_group_name,
    }));
  }, [allGroupNames]);

  const dynamicColumns = useMemo(() => {
    return currSelectedGroup?.columns?.map((g) => {
      return {
        ...g,
        id: g.column_id,
      };
    });
  }, [currSelectedGroup]);

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(
        `/client/client-list/${currSelectedGroupId}/${row.id}/edit-client`
      );
    }

    if (action === "delete") {
      dispatch(setShowModal(true));
      setModalType("delete");
      setTargetClientId(row.id);
    }
  };

  const handleSelectionChange = (selectedIds) => {
    setRowSelectedIds(selectedIds);
    // console.log("Selected clients:", selectedIds);
  };

  const handlePageChange = (newPage) => {

    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination: { ...pagination, currentPage : newPage },
        filters: filters,
        fixedColumns,
        searchText: searchText,
      })
    );
  };

  const handleRowClick = (row) => {
    // console.log("Row clicked:", row);
  };

  const handleSort = (sortConfiguration) => {
    let newOrder;

    // If clicking the same column, toggle the order
    if (sortConfig.id === sortConfiguration.id) {
      newOrder = sortConfig.order === "asc" ? "desc" : "asc";
    } else {
      // If clicking a different column, default to ascending
      newOrder = "asc";
    }

    const newSortConfig = {
      id: sortConfiguration.id,
      order: newOrder,
    };

    setSortConfig(newSortConfig);
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig: newSortConfig,
        pagination,
        filters: filters,
        fixedColumns,
      })
    );
  };

  const handleOnChangeGroup = (groupId) => {
    const selectedGroup = allGroupNames.find(
      (g) => g.client_group_id === groupId
    );
    if (selectedGroup) {
      dispatch(
        handleOnChangeClientGroup({
          client_group_id: groupId,
          targetGroup: selectedGroup,
        })
      );
    }
  };

  const onHandleDeleteClient = () => {
    if (targetClientId) {
      dispatch(
        deleteClient({
          client_id: targetClientId,
          client_group_id: currSelectedGroupId,
        })
      );
    }
  };

  const handleBulkUpdate = () => {
    if (rowSelectedIds.length < 1) return;
    const clientIds = rowSelectedIds;
    dispatch(setSelectedClientIds({ router, data: clientIds }));
  };

  const handleShowBulkDeleteModal = () => {
    if (rowSelectedIds.length < 1) return;
    setModalType("bulkDelete");
    dispatch(setShowModal(true));
  };

  const handleBulkDelete = () => {
    const client_id_list = rowSelectedIds;
    dispatch(
      bulkDeleteClient({
        client_group_id: currSelectedGroupId,
        client_id_list: client_id_list,
      })
    );
    dispatch(setSelectedClientIdsSuccess([]));
  };

  const handleApplyFilters = (targetFilters) => {
    setFilters(targetFilters);
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: targetFilters,
        fixedColumns,
      })
    );
    console.log("Applied filters:", targetFilters);
  };

  const handleGlobalSearch = () => {
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: filters,
        fixedColumns,
        searchText: searchText,
      })
    );
  };

  const handleColumnVisibilityChange = (visibilityUpdates) => {
    setColumnVisibility(visibilityUpdates);
    console.log(visibilityUpdates);
    // Apply visibility changes to your table
  };

  const handleColumnOrderChange = (newOrder) => {
    setColumnOrder(newOrder);
    // Apply new column order to your table
  };

  return (
    <div className="page-container">
      <ColumnOrderDrawer
        open={isColumnDrawerOpen}
        onClose={() => setIsColumnDrawerOpen(false)}
        fixedColumns={fixedColumns}
        dynamicColumns={dynamicColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onColumnOrderChange={handleColumnOrderChange}
      />
      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        dynamicColumns={dynamicColumns}
        fixedColumns={fixedColumns}
        onApplyFilters={handleApplyFilters}
      />
      <ConfirmModal
        open={showModal}
        description={modalType ? modalDescription[modalType] : ""}
        onConfirm={() => {
          modalType === "bulkDelete"
            ? handleBulkDelete()
            : onHandleDeleteClient();
        }}
        onCancel={() => {
          dispatch(setSelectedClientIdsSuccess([]));
          dispatch(setShowModal(false));
        }}
      />
      <div className="title-container">
        <h1>Client List</h1>
        <div className="title-actions">
          <DropdownField
            value={currSelectedGroupId ?? ""}
            dropdownList={groupOptionList}
            onChange={(value) => handleOnChangeGroup(value)}
            width={"200px"}
          />
          <ActionButton
            label={"Import Client"}
            type="primary"
            onClick={() =>
              router.push(
                `/client/client-list/${currSelectedGroupId}/import-client`
              )
            }
          />
          <ActionButton
            label={"+ New Client"}
            type="primary"
            onClick={() => router.push("/client/client-list/new-client")}
          />
        </div>
      </div>

      <div className="action-container">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-bar"
              placeholder="Search records..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleGlobalSearch();
                }
              }}
            />
          </div>
        </div>

        {/* Icons Section */}
        <div className="icons-section">
          <div className="icon-group" onClick={() => handleBulkUpdate()}>
            <FaEdit className="icon" />
          </div>

          {/* Delete Icon */}
          <div
            className="icon-group"
            onClick={() => handleShowBulkDeleteModal()}
          >
            <FaTrash className="icon" />
          </div>

          {/* Filter Icon */}
          <div className="icon-group" onClick={() => setIsFilterOpen(true)}>
            <FaSlidersH className="icon" />
          </div>

          {/* Show/Hide Columns */}
          <div
            className="icon-group"
            onClick={() => setIsColumnDrawerOpen(true)}
          >
            <FaColumns className="icon" />
          </div>
        </div>
      </div>
      <ReusableTable
        tableId="client_list"
        data={clients}
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
      />
    </div>
  );
};

export default ClientList;
