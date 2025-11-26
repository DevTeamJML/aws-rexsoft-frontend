import { DropdownField } from "@/components/FormComponents/DropdownField";
import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import {
  getSelectedClientGroup,
  useSelectCurrGroup,
} from "../../../../redux/slices/clientGroupSlice";
import {
  bulkUpdateClient,
  useSelectCurrSelectedGroupId,
  useSelectSelectedClientIds,
} from "../../../../redux/slices/clientSlice";
import {
  useSelectAllCompanyUsers,
  useSelectIsAdmin,
} from "../../../../redux/slices/companySlice";
import { hideToast, showToast } from "../../../../redux/slices/toastSlice";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useDispatch } from "react-redux";
import { DateField } from "@/components/FormComponents/DateField";
import { renderClientInputField } from "@/utils/renderField";
import { useSelectUserPermissions } from "../../../../redux/slices/roleAuthSlice";
import { onValue, ref } from "firebase/database";
import { db } from "@/config/firebaseConfig";

export default function BulkUpdateClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const currSelectedGroupId = useSelectCurrSelectedGroupId();
  const currSelectedGroup = useSelectCurrGroup();
  const selectedClientIds = useSelectSelectedClientIds();

  const [handler, setHandler] = useState([]);
  const [formData, setFormData] = useState({});
  const [addHandler, setAddHandler] = useState([]);
  const [removeHandler, setRemoveHandler] = useState([]);

  const userPermissions = useSelectUserPermissions();
  const isAdmin = useSelectIsAdmin();
  const canManageHandler =
    isAdmin || userPermissions.includes("manage_handler");

  const { client_group_id } = router.query;

  const [userSortingArray, setUserSortingArray] = useState(null);
  const [columnSortingArray, setColumnSortingArray] = useState(null);

  useEffect(() => {
    if (!currSelectedGroupId) return;
    if (!user) return;

    const userRef = ref(
      db,
      `UserColumnSorting/${user?.uid}/${currSelectedGroupId}`
    );
    const unsubUser = onValue(userRef, (snap) => {
      const val = snap.val();
      const arr = Array.isArray(val) ? val : val?.columnsOrder;
      setUserSortingArray(Array.isArray(arr) ? arr : null);
    });

    const groupRef = ref(db, `ColumnSorting/${currSelectedGroupId}`);
    const unsubGroup = onValue(groupRef, (snap) => {
      const arr = snap.val();
      setColumnSortingArray(Array.isArray(arr) ? arr : null);
    });

    // Cleanup listeners when unmounting or group changes
    return () => {
      unsubUser();
      unsubGroup();
    };
  }, [user, currSelectedGroupId]);

  const clientColumns = useMemo(() => {
    if (currSelectedGroup) {
      return currSelectedGroup?.columns.map((c) => {
        return {
          ...c,
          options: c.options,
        };
      });
    } else {
      return [];
    }
  }, [currSelectedGroup]);

  const sortedColumns = useMemo(() => {
    if (!clientColumns) return [];

    const FIXED = ["handler", "created_at", "serial_number"];
    const getId = (c) => c.id ?? c.column_id;

    const orderIds =
      (Array.isArray(userSortingArray) &&
        userSortingArray.length > 0 &&
        userSortingArray) ||
      (Array.isArray(columnSortingArray) &&
        columnSortingArray.length > 0 &&
        columnSortingArray) ||
      null;

    const fixed = clientColumns.filter((c) => FIXED.includes(getId(c)));
    const dynamic = clientColumns.filter((c) => !FIXED.includes(getId(c)));

    if (!orderIds) {
      return [...fixed, ...dynamic];
    }

    const idToCol = new Map(dynamic.map((c) => [getId(c), c]));

    const ordered = orderIds.map((id) => idToCol.get(id)).filter(Boolean);

    const remaining = dynamic.filter((c) => !orderIds.includes(getId(c)));

    return [...fixed, ...ordered, ...remaining];
  }, [clientColumns, userSortingArray, columnSortingArray]);

  const visibleColumns = useMemo(() => {
    if (isAdmin) return sortedColumns; // admin sees all columns (including not_viewable)
    return sortedColumns.filter((c) => c.permission !== "not_viewable");
  }, [sortedColumns, isAdmin]);

  useEffect(() => {
    if (!currSelectedGroup && client_group_id) {
      dispatch(getSelectedClientGroup({ client_group_id: client_group_id }));
    }
  }, [client_group_id]);

  useEffect(() => {
    if (selectedClientIds.length < 1) {
      router.push("/client/client-list");
    }
  }, [selectedClientIds]);

  useEffect(() => {
    const handlerList =
      allCompanyUsers.map((list) => {
        return {
          label: list.first_name + " " + list.last_name,
          value: list.user_id,
        };
      }) || [];
    setHandler(handlerList);
  }, [allCompanyUsers]);

  // Initialize form data with empty values for all columns
  useEffect(() => {
    const initialData = {};

    // Initialize all columns with empty values
    clientColumns.forEach((column) => {
      initialData[column.column_id] = "";
    });

    setFormData(initialData);
  }, [clientColumns]);

  const handleInputChange = (columnId, value) => {
    setFormData((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  // Handler for adding handlers
  const handleAddHandlerChange = (newSelected) => {
    setAddHandler((prev) => [...new Set([...prev, newSelected])]);
    setRemoveHandler((prev) => prev.filter((h) => h !== newSelected));
  };

  // Remove handler from add list
  const handleRemoveAddHandler = (handlerToRemove) => {
    setAddHandler((prev) => prev.filter((h) => h !== handlerToRemove));
  };

  // Handler for removing handlers
  const handleRemoveHandlerChange = (newSelected) => {
    setRemoveHandler((prev) => [...new Set([...prev, newSelected])]);
    setAddHandler((prev) => prev.filter((h) => h !== newSelected));
  };

  // Remove handler from remove list
  const handleRemoveRemoveHandler = (handlerToRemove) => {
    setRemoveHandler((prev) => prev.filter((h) => h !== handlerToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that same handler isn't in both lists
    const conflictingHandlers = addHandler.filter((addHandlerItem) =>
      removeHandler.includes(addHandlerItem)
    );

    if (conflictingHandlers.length > 0) {
      // Get handler labels for error message
      const conflictingHandlerLabels = conflictingHandlers
        .map((userId) => {
          const handler = handler.find((h) => h.value === userId);
          return handler?.label || userId;
        })
        .join(", ");

      alert(
        `Error: The same handler cannot be in both Add and Remove lists. Conflicting handlers: ${conflictingHandlerLabels}`
      );
      return;
    }

    dispatch(
      showToast({
        message: "Processing data, please wait..",
        status: "success",
        loader: true,
      })
    );

    try {
      const BATCH_SIZE = 10;
      const columnsWithValues = clientColumns.filter(
        (col) => formData[col.column_id] && formData[col.column_id] !== ""
      );

      // Process each column
      for (const col of columnsWithValues) {
        const columnValue = formData[col.column_id];

        // Process clients in batches for this column
        for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
          const batchClientIds = selectedClientIds.slice(i, i + BATCH_SIZE);

          const updateList = {
            alert_values: [],
            custom_values: [],
          };

          if (col.field_type === "alert") {
            updateList["alert_values"] = batchClientIds.map((client_id) => ({
              client_group_id: currSelectedGroupId,
              column_id: col.column_id,
              client_id: client_id,
              row_value: columnValue,
            }));
          } else {
            updateList["custom_values"] = batchClientIds.map((client_id) => ({
              client_group_id: currSelectedGroupId,
              column_id: col.column_id,
              client_id: client_id,
              row_value: columnValue,
            }));
          }

          const addHandlerList = batchClientIds.flatMap((client_id) =>
            addHandler?.map((user_id) => ({
              client_id,
              user_id: user_id, // user_id is already a string
            }))
          );

          const removeHandlerList = batchClientIds.flatMap((client_id) =>
            removeHandler?.map((user_id) => ({
              client_id,
              user_id: user_id, // user_id is already a string
            }))
          );

          // Dispatch bulk update
          dispatch(
            bulkUpdateClient({
              router,
              payload: {
                client_group_id: currSelectedGroupId,
                custom_values: updateList.custom_values,
                alert_values: updateList.alert_values,
                client_id_list: batchClientIds,
                add_handler_list: addHandlerList,
                remove_handler_list: removeHandlerList,
              },
            })
          );

          // Small delay between batches
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      // If only handlers are being updated (no column changes)
      if (
        columnsWithValues.length === 0 &&
        (addHandler.length > 0 || removeHandler.length > 0)
      ) {
        for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
          const batchClientIds = selectedClientIds.slice(i, i + BATCH_SIZE);

          const addHandlerList = batchClientIds.flatMap((client_id) =>
            addHandler?.map((user_id) => ({
              client_id,
              user_id: user_id,
            }))
          );

          const removeHandlerList = batchClientIds.flatMap((client_id) =>
            removeHandler?.map((user_id) => ({
              client_id,
              user_id: user_id,
            }))
          );

          dispatch(
            bulkUpdateClient({
              router,
              payload: {
                client_group_id: currSelectedGroupId,
                custom_values: [],
                alert_values: [],
                client_id_list: batchClientIds,
                add_handler_list: addHandlerList,
                remove_handler_list: removeHandlerList,
              },
            })
          );

          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
      dispatch(hideToast());
      router.push("/client/client-list");
    } catch (error) {
      console.error("Error during bulk update:", error);
      dispatch(hideToast());
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className="create-client-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Bulk Update Clients ({selectedClientIds.length} selected)</h1>
          <p>
            Update the selected clients below. Changes will apply to all{" "}
            {selectedClientIds.length} selected clients.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-section">
            {/* Handler Fields */}

            {canManageHandler ? (
              <Fragment>
                <div className="input-group" style={{ width: "98%" }}>
                  <label>Add Handlers</label>
                  <MultiSelectDropdownField
                    selected={addHandler}
                    onChange={handleAddHandlerChange}
                    options={handler}
                    placeholder="Select handlers to add"
                    onRemove={handleRemoveAddHandler}
                  />
                  {addHandler.length > 0 && (
                    <div className="handler-selection-info">
                      Selected:{" "}
                      {addHandler
                        .map((userId) => {
                          const handlerObj = handler.find(
                            (h) => h.value === userId
                          );
                          return handlerObj?.label || userId;
                        })
                        .join(", ")}
                    </div>
                  )}
                </div>

                <div className="input-group" style={{ width: "98%" }}>
                  <label>Remove Handlers</label>
                  <MultiSelectDropdownField
                    selected={removeHandler}
                    onChange={handleRemoveHandlerChange}
                    options={handler}
                    placeholder="Select handlers to remove"
                    onRemove={handleRemoveRemoveHandler}
                  />
                  {removeHandler.length > 0 && (
                    <div className="handler-selection-info">
                      Selected:{" "}
                      {removeHandler
                        .map((userId) => {
                          const handlerObj = handler.find(
                            (h) => h.value === userId
                          );
                          return handlerObj?.label || userId;
                        })
                        .join(", ")}
                    </div>
                  )}
                </div>
              </Fragment>
            ) : null}

            {/* Regular columns */}
            {visibleColumns.map((column) => (
              <div
                key={column.column_id}
                className="input-group"
                style={{ width: `${column.width - 4}%` }}
              >
                <label>{column.label}</label>
                {renderClientInputField(formData, column, setFormData)}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <ActionButton
              type="outlined"
              label="Cancel"
              onClick={handleCancel}
            />
            <ActionButton
              type="primary"
              label={`Update ${selectedClientIds.length} Clients`}
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
