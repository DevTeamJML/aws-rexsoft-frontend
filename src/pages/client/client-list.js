// pages/client/client-list.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  useSelectIsAdmin,
} from "../../../redux/slices/companySlice";
import { getFromSessionStorage, saveFilterPreference } from "@/utils/localStorage";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import {
  archiveClient,
  bulkArchiveClient,
  bulkDeleteClient,
  bulkRestoreClient,
  deleteClient,
  getAllClients,
  handleOnChangeClientGroup,
  setSelectedClientIds,
  setSelectedClientIdsSuccess,
  useSelectAllClients,
  useSelectClientPagination,
  useSelectCurrSelectedGroup,
  useSelectCurrSelectedGroupId,
  useSelectGetAllClientsLoading,
} from "../../../redux/slices/clientSlice";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../redux/slices/confirmModalSlice";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  FaSearch,
  FaTrash,
  FaColumns,
  FaSlidersH,
  FaEdit,
  FaRedo,
} from "react-icons/fa";
import FilterDrawer from "@/components/Misc/FilterDrawer";
import ColumnOrderDrawer from "@/components/Misc/ColumnOrderDrawer";
import { useSelectUserPermissions } from "../../../redux/slices/roleAuthSlice";
import { useSelectUser } from "../../../redux/slices/authSlice";
import SwitchField from "@/components/FormComponents/SwitchField";
import { hideToast, showToast } from "../../../redux/slices/toastSlice";
import { onValue, ref, set } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { debounce } from "lodash";
import ExportModal from "@/components/Misc/ExportModal";
import RtePreviewModal from "@/components/Misc/RtePreviewModal";

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
  const user = useSelectUser();
  const loading = useSelectGetAllClientsLoading() || false;

  const [modalType, setModalType] = useState("");

  const [targetClientId, setTargetClientId] = useState();
  const [searchText, setSearchText] = useState("");
  const [rowSelectedIds, setRowSelectedIds] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState({});
  const [isArchivedPage, setIsArchivedPage] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [rtePreviewContent, setRtePreviewContent] = useState("");

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const fixedColumns = getColumnsForPage("client-list");
  const userPermissions = useSelectUserPermissions();
  const isAdmin = useSelectIsAdmin();
  const canDeleteClient = isAdmin || userPermissions.includes("delete_client");
  const canManageClient = isAdmin || userPermissions.includes("manage_client");
  const canExportClient = isAdmin || userPermissions.includes("export_client");
  const canManageHandler =
    isAdmin || userPermissions.includes("manage_handler");

  const modalDescription = {
    bulkDelete: "Are you sure you want to delete these clients ?",
    delete: "Are you sure you want to delete this client ?",
  };

  const [columnWidths, setColumnWidths] = useState({});

  const [userSortingArray, setUserSortingArray] = useState(null);
  const [columnSortingArray, setColumnSortingArray] = useState(null);

  useEffect(() => {
    const groupId = currSelectedGroupId;
    if (!groupId) return;

    const allPrefs = JSON.parse(
      localStorage.getItem("filterPreference") || "{}",
    );

    const current = allPrefs[groupId];

    if (current) {
      setFilters(current.filters || []);
      setSearchText(current.search || "");
      setSortConfig(current.sort || {});
    }
  }, [currSelectedGroupId]);

  // useEffect(() => {
  //   const savedFilters = localStorage.getItem("filters");
  //   if (savedFilters) {
  //     setFilters(JSON.parse(savedFilters));
  //   }

  //   const savedSearchKeyword = localStorage.getItem("search");
  //   if (savedSearchKeyword) {
  //     setSearchText(JSON.parse(savedSearchKeyword));
  //   }

  //   const savedSortKeyword = localStorage.getItem("sort");
  //   if (savedSortKeyword) {
  //     setSortConfig(JSON.parse(savedSortKeyword));
  //   }
  // }, []);

  useEffect(() => {
    if (!currSelectedGroupId) return;
    if (!user) return;

    const widthRef = ref(
      db,
      `ClientColumnWidths/${user?.uid}/${currSelectedGroupId}`,
    );
    const unsubWidth = onValue(widthRef, (snap) => {
      const val = snap.val() || {};
      setColumnWidths(val);
    });

    const userRef = ref(
      db,
      `UserColumnSorting/${user?.uid}/${currSelectedGroupId}`,
    );
    const unsubUser = onValue(userRef, (snap) => {
      const val = snap.val() || [];
      const arr = Array.isArray(val) ? val : val?.columnsOrder;
      setUserSortingArray(Array.isArray(arr) ? arr : []);
    });

    const groupRef = ref(db, `ColumnSorting/${currSelectedGroupId}`);
    const unsubGroup = onValue(groupRef, (snap) => {
      const arr = snap.val() || [];
      setColumnSortingArray(Array.isArray(arr) ? arr : []);
    });

    const viewRef = ref(
      db,
      `ViewableClientColumn//${user?.uid}/${currSelectedGroupId}`,
    );
    const unsubView = onValue(viewRef, (snap) => {
      const arr = snap.val() || [];
      setColumnVisibility(Array.isArray(arr) ? arr : []);
    });

    // Cleanup listeners when unmounting or group changes
    return () => {
      unsubWidth();
      unsubUser();
      unsubGroup();
      unsubView();
    };
  }, [user, currSelectedGroupId]);

  useEffect(() => {
    if (!currSelectedGroup) return;

    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: filters,
        searchText: searchText,
        fixedColumns,
        user_id: user?.uid,
        isAdmin,
        isArchivedPage,
        hasPermission: canManageHandler,
      }),
    );
  }, [currSelectedGroup, isArchivedPage]);

  useEffect(() => {
    if (currSelectedGroup === null) return;
    if (searchText === "" && fixedColumns.length > 0) {
      saveFilterPreference(currSelectedGroupId, {
        filters: filters,
        search: "",
        sort: sortConfig,
      });
      // localStorage.setItem("search", "");
      dispatch(
        getAllClients({
          ...currSelectedGroup,
          sortConfig,
          pagination,
          filters: filters,
          fixedColumns,
          searchText: searchText,
          user_id: user?.uid,
          isAdmin,
          isArchivedPage,
          hasPermission: canManageHandler,
        }),
      );
    }
  }, [searchText]);

  useEffect(() => {
    if (currCompanyId) {
      dispatch(getAllClientGroupsName({ company_id: currCompanyId }));
    }
  }, [currCompanyId]);

  useEffect(() => {
    if (allGroupNames.length > 0) {
      const storedSelectedClientGroupId = getFromSessionStorage(
        process.env.CURR_SELECTED_GROUP_ID,
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

  const handleAction = useCallback(
    (action, row) => {
      if (action === "edit") {
        router.push(
          `/client/client-list/${currSelectedGroupId}/${row.id}/edit-client`,
        );
      }

      if (action === "delete") {
        dispatch(setShowModal(true));
        setModalType("delete");
        setTargetClientId(row.id);
      }
    },
    [router, currSelectedGroupId, dispatch],
  );

  const handleSelectionChange = useCallback((ids) => {
    setRowSelectedIds(ids);
  }, []);

  const handlePageChange = (newPage) => {
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination: { ...pagination, currentPage: newPage },
        filters: filters,
        fixedColumns,
        searchText: searchText,
        user_id: user?.uid,
        isAdmin,
        isArchivedPage,
        hasPermission: canManageHandler,
      }),
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

    // localStorage.setItem("sort", JSON.stringify(newSortConfig));
    saveFilterPreference(currSelectedGroupId, {
      filters: filters,
      search: searchText,
      sort: newSortConfig,
    });

    setSortConfig(newSortConfig);
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig: newSortConfig,
        pagination,
        filters: filters,
        fixedColumns,
        user_id: user?.uid,
        isAdmin,
        isArchivedPage,
        hasPermission: canManageHandler,
        searchText: searchText,
      }),
    );
  };

  const handleOnChangeGroup = (groupId) => {
    const selectedGroup = allGroupNames.find(
      (g) => g.client_group_id === groupId,
    );
    if (selectedGroup) {
      dispatch(
        handleOnChangeClientGroup({
          client_group_id: groupId,
          targetGroup: selectedGroup,
        }),
      );
    }
  };

  const onHandleDeleteClient = () => {
    if (targetClientId) {
      if (isArchivedPage) {
        dispatch(
          deleteClient({
            client_id: targetClientId,
            client_group_id: currSelectedGroupId,
          }),
        );
      } else {
        dispatch(
          archiveClient({
            client_id: targetClientId,
            client_group_id: currSelectedGroupId,
          }),
        );
      }
    }
  };

  const handleBulkUpdate = () => {
    if (rowSelectedIds.length < 2) {
      dispatch(
        showToast({
          message: "At least 2 client must be selected for bulk update !",
          status: "error",
        }),
      );
      return;
    } else {
      const clientIds = rowSelectedIds;
      dispatch(setSelectedClientIds({ router, data: clientIds }));
    }
  };

  const handleShowBulkDeleteModal = () => {
    if (rowSelectedIds.length < 1) return;
    setModalType("bulkDelete");
    dispatch(setShowModal(true));
  };

  const handleBulkDelete = () => {
    const client_id_list = rowSelectedIds;
    if (isArchivedPage) {
      dispatch(
        bulkDeleteClient({
          client_group_id: currSelectedGroupId,
          client_id_list: client_id_list,
          clientPayload: {
            ...currSelectedGroup,
            sortConfig,
            pagination,
            filters: filters,
            fixedColumns,
            user_id: user?.uid,
            isAdmin,
            isArchivedPage,
            hasPermission: canManageHandler,
          },
        }),
      );
    } else {
      dispatch(
        bulkArchiveClient({
          client_group_id: currSelectedGroupId,
          client_id_list: client_id_list,
          clientPayload: {
            ...currSelectedGroup,
            sortConfig,
            pagination,
            filters: filters,
            fixedColumns,
            user_id: user?.uid,
            isAdmin,
            isArchivedPage,
            hasPermission: canManageHandler,
          },
        }),
      );
    }

    dispatch(setSelectedClientIdsSuccess([]));
  };
  
  const handleColumnFilter = (filter) => {
    const newFilters = filters.filter((f) => f.column_id !== filter.column_id);

    newFilters.push(filter);

    setFilters(newFilters);

    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: newFilters,
        fixedColumns,
        user_id: user?.uid,
        isAdmin,
        isArchivedPage,
        hasPermission: canManageHandler,
      }),
    );
  };

  const handleApplyFilters = (targetFilters) => {
    saveFilterPreference(currSelectedGroupId, {
      filters: targetFilters,
      search: searchText,
      sort: sortConfig,
    });
    // localStorage.setItem("filters", JSON.stringify(targetFilters));
    setFilters(targetFilters);
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: targetFilters,
        fixedColumns,
        user_id: user?.uid,
        isAdmin,
        isArchivedPage,
        hasPermission: canManageHandler,
      }),
    );
  };

  const handleGlobalSearch = () => {
    saveFilterPreference(currSelectedGroupId, {
      filters: filters,
      search: searchText,
      sort: sortConfig,
    });

    // localStorage.setItem("search", JSON.stringify(searchText));
    dispatch(
      getAllClients({
        ...currSelectedGroup,
        sortConfig,
        pagination,
        filters: filters,
        fixedColumns,
        searchText: searchText,
        user_id: user?.uid,
        isAdmin,
        isArchivedPage,
        hasPermission: canManageHandler,
      }),
    );
  };

  const handleColumnVisibilityChange = async (visibilityUpdates) => {
    if (!user || !currSelectedGroupId) return;

    const path = `ViewableClientColumn/${user?.uid}/${currSelectedGroupId}`;
    await set(ref(db, path), visibilityUpdates);
  };

  const handleColumnOrderChange = async (newOrder) => {
    if (user?.uid && currSelectedGroupId) {
      await set(
        ref(db, `UserColumnSorting/${user?.uid}/${currSelectedGroupId}`),
        newOrder,
      );
    }
    dispatch(
      showToast({
        message: "Save column position successfully !",
        status: "success",
      }),
    );

    setTimeout(() => {
      dispatch(hideToast());
    }, 2000);
  };

  const handleBulkRestore = () => {
    if (rowSelectedIds.length < 1) return;
    const clientIds = rowSelectedIds;
    dispatch(
      bulkRestoreClient({
        client_id_list: clientIds,
        client_group_id: currSelectedGroupId,
        clientPayload: {
          ...currSelectedGroup,
          sortConfig,
          pagination,
          filters: filters,
          fixedColumns,
          user_id: user?.uid,
          isAdmin,
          isArchivedPage,
          hasPermission: canManageHandler,
        },
      }),
    );
  };

  const saveWidths = useCallback(
    debounce(async (widths, userId, clientGroupId) => {
      try {
        const path = `ClientColumnWidths/${userId}/${clientGroupId}`;
        await set(ref(db, path), widths);
      } catch (err) {
        console.error("Error saving widths:", err);
      }
    }, 2000),
    [],
  );

  useEffect(() => {
    if (!user || !currSelectedGroupId) return;
    saveWidths(columnWidths, user?.uid, currSelectedGroupId);
  }, [columnWidths, user, currSelectedGroupId]);

  return (
    <div className="page-container">
      <ExportModal
        sortConfig={sortConfig}
        filters={filters}
        searchText={searchText}
        open={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          dispatch(setSelectedClientIdsSuccess([]));
          setIsAllSelected(false);
          setSelectedRows(new Set());
        }}
        fixedColumns={fixedColumns}
        dynamicColumns={dynamicColumns}
        columnVisibility={columnVisibility}
        clients={clients}
        selectedClientIds={rowSelectedIds}
        currSelectedGroup={currSelectedGroup || {}}
        dispatch={dispatch}
        getAllClients={getAllClients}
        user={user}
        isArchivedPage={isArchivedPage}
        showToast={showToast}
        pagination={pagination}
        isAdmin={isAdmin}
        canManageHandler={canManageHandler}
        setSelectedRows={setSelectedRows}
        setIsAllSelected={setIsAllSelected}
      />

      <ColumnOrderDrawer
        open={isColumnDrawerOpen}
        onClose={() => setIsColumnDrawerOpen(false)}
        fixedColumns={fixedColumns}
        dynamicColumns={dynamicColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onColumnOrderChange={handleColumnOrderChange}
        columnSortingArray={columnSortingArray}
        userSortingArray={userSortingArray}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        isAdmin={isAdmin}
      />
      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        dynamicColumns={dynamicColumns}
        fixedColumns={fixedColumns}
        filters={filters}
        setFilters={setFilters}
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
      <RtePreviewModal
        open={
          rtePreviewContent !== "" && rtePreviewContent !== undefined
            ? true
            : false
        }
        content={rtePreviewContent}
        onCancel={() => {
          setRtePreviewContent("");
        }}
      />
      <div className="title-container">
        <h1>{isArchivedPage ? "Archived List" : "Client List"}</h1>
        <div className="title-actions">
          <label>{"Show Archived"}</label>
          <SwitchField
            checked={isArchivedPage}
            onChange={(e) => setIsArchivedPage(!isArchivedPage)}
          />
          <DropdownField
            value={currSelectedGroupId ?? ""}
            dropdownList={groupOptionList}
            onChange={(value) => handleOnChangeGroup(value)}
            width={"200px"}
          />
          {canExportClient && !isArchivedPage ? (
            <ActionButton
              label={"Export Client"}
              type="primary"
              onClick={() => setIsExportModalOpen(true)}
            />
          ) : null}

          {canManageClient && !isArchivedPage ? (
            <ActionButton
              label={"Import Client"}
              type="primary"
              onClick={() =>
                router.push(
                  `/client/client-list/${currSelectedGroupId}/import-client`,
                )
              }
            />
          ) : null}

          {canManageClient && !isArchivedPage ? (
            <ActionButton
              label={"+ New Client"}
              type="primary"
              onClick={() =>
                router.push(
                  `/client/client-list/${currSelectedGroupId}/new-client`,
                )
              }
            />
          ) : null}
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
          {isArchivedPage ? (
            <div className="icon-group" onClick={() => handleBulkRestore()}>
              <FaRedo className="icon" />
            </div>
          ) : null}
          {/* Bulk Update Icon */}
          {canManageClient && !isArchivedPage ? (
            <div className="icon-group" onClick={() => handleBulkUpdate()}>
              <FaEdit className="icon" />
            </div>
          ) : null}

          {/* Delete Icon */}
          {canDeleteClient ? (
            <div
              className="icon-group"
              onClick={() => handleShowBulkDeleteModal()}
            >
              <FaTrash className="icon" />
            </div>
          ) : null}

          {/* Filter Icon */}
          <div className="filter-icon-wrapper">
            <div className="icon-group" onClick={() => setIsFilterOpen(true)}>
              <FaSlidersH className="icon" />
            </div>
            {filters.length > 0 ? (
              <div className="running-filters-count">{filters.length}</div>
            ) : null}
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
        filter={true}
        sortable={true}
        resizable={true}
        selectable={true}
        onAction={handleAction}
        onSort={handleSort}
        onRowClick={handleRowClick}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        deletableAction={canDeleteClient}
        editableAction={canManageClient && !isArchivedPage}
        emptyMessage="No clients found"
        // Pagination props
        pagination={true}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={handlePageChange}
        columnSortingArray={columnSortingArray}
        userSortingArray={userSortingArray}
        columnVisibility={columnVisibility}
        columnWidths={columnWidths}
        setColumnWidths={setColumnWidths}
        canManageHandler={canManageHandler}
        isAdmin={isAdmin}
        rtePreviewContent={rtePreviewContent}
        setRtePreviewContent={setRtePreviewContent}
        onColumnFilter={handleColumnFilter}
        filters={filters}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        setIsAllSelected={setIsAllSelected}
      />
    </div>
  );
};

ClientList.featureKey = "client_list";

export default ClientList;
