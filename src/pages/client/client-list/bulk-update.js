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
  useSelectAllClients,
  useSelectCurrSelectedGroupId,
  useSelectSelectedClientIds,
} from "../../../../redux/slices/clientSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
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
import pLimit from "p-limit";
import { API } from "@/service/api";
import { ApiRoute } from "@/enums/api-route";

export default function BulkUpdateClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const currSelectedGroupId = useSelectCurrSelectedGroupId();
  const currSelectedGroup = useSelectCurrGroup();
  const selectedClientIds = useSelectSelectedClientIds();
  const clients = useSelectAllClients();
  const currCompanyId = useSelectCurrCompanyId();

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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validate that same handler isn't in both lists
  //   const conflictingHandlers = addHandler.filter((addHandlerItem) =>
  //     removeHandler.includes(addHandlerItem)
  //   );

  //   if (conflictingHandlers.length > 0) {
  //     // Get handler labels for error message
  //     const conflictingHandlerLabels = conflictingHandlers
  //       .map((userId) => {
  //         const handlerObj = handler.find((h) => h.value === userId);
  //         return handlerObj?.label || userId;
  //       })
  //       .join(", ");

  //     alert(
  //       `Error: The same handler cannot be in both Add and Remove lists. Conflicting handlers: ${conflictingHandlerLabels}`
  //     );
  //     return;
  //   }

  //   dispatch(
  //     showToast({
  //       message: "Processing data, please wait..",
  //       status: "success",
  //       loader: true,
  //     })
  //   );

  //   try {
  //     const BATCH_SIZE = 25;
  //     const CONCURRENCY = 3;
  //     const limit = pLimit(CONCURRENCY);
  //     const tasks = [];

  //     const columnsWithValues = clientColumns.filter(
  //       (col) => formData[col.column_id] && formData[col.column_id] !== ""
  //     );

  //     // Process each column (we will queue requests via p-limit)
  //     for (const col of columnsWithValues) {
  //       const columnValue = formData[col.column_id];

  //       // Process clients in batches for this column
  //       for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
  //         const batchClientIds = selectedClientIds.slice(i, i + BATCH_SIZE);

  //         const updateList = {
  //           alert_values: [],
  //           custom_values: [],
  //         };

  //         if (col.field_type === "alert") {
  //           updateList["alert_values"] = batchClientIds.map((client_id) => ({
  //             client_group_id: currSelectedGroupId,
  //             column_id: col.column_id,
  //             client_id: client_id,
  //             row_value: columnValue,
  //           }));
  //         } else {
  //           updateList["custom_values"] = batchClientIds.map((client_id) => ({
  //             client_group_id: currSelectedGroupId,
  //             column_id: col.column_id,
  //             client_id: client_id,
  //             row_value: columnValue,
  //           }));
  //         }

  //         const addHandlerList = batchClientIds.flatMap((client_id) =>
  //           (addHandler || []).map((user_id) => ({
  //             client_id,
  //             user_id: user_id, // user_id is already a string
  //           }))
  //         );

  //         const removeHandlerList = batchClientIds.flatMap((client_id) =>
  //           (removeHandler || []).map((user_id) => ({
  //             client_id,
  //             user_id: user_id, // user_id is already a string
  //           }))
  //         );

  //         // Queue the dispatch with concurrency limit.
  //         // We include a small delay inside the limited function to preserve your pacing.
  //         tasks.push(
  //           limit(async () => {
  //             dispatch(
  //               bulkUpdateClient({
  //                 router,
  //                 payload: {
  //                   client_group_id: currSelectedGroupId,
  //                   custom_values: updateList.custom_values,
  //                   alert_values: updateList.alert_values,
  //                   client_id_list: batchClientIds,
  //                   add_handler_list: addHandlerList,
  //                   remove_handler_list: removeHandlerList,
  //                 },
  //               })
  //             );

  //             // small delay/jitter to avoid bursts — keeps your original behavior
  //             await new Promise((resolve) =>
  //               setTimeout(resolve, 50 + Math.floor(Math.random() * 50))
  //             );
  //           })
  //         );
  //       }
  //     }

  //     // If only handlers are being updated (no column changes)
  //     if (
  //       columnsWithValues.length === 0 &&
  //       (addHandler.length > 0 || removeHandler.length > 0)
  //     ) {
  //       for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
  //         const batchClientIds = selectedClientIds.slice(i, i + BATCH_SIZE);

  //         const addHandlerList = batchClientIds.flatMap((client_id) =>
  //           (addHandler || []).map((user_id) => ({
  //             client_id,
  //             user_id: user_id,
  //           }))
  //         );

  //         const removeHandlerList = batchClientIds.flatMap((client_id) =>
  //           (removeHandler || []).map((user_id) => ({
  //             client_id,
  //             user_id: user_id,
  //           }))
  //         );

  //         tasks.push(
  //           limit(async () => {
  //             await dispatch(
  //               bulkUpdateClient({
  //                 router,
  //                 payload: {
  //                   client_group_id: currSelectedGroupId,
  //                   custom_values: [],
  //                   alert_values: [],
  //                   client_id_list: batchClientIds,
  //                   add_handler_list: addHandlerList,
  //                   remove_handler_list: removeHandlerList,
  //                 },
  //               })
  //             );

  //             // small delay/jitter
  //             await new Promise((resolve) =>
  //               setTimeout(resolve, 50 + Math.floor(Math.random() * 50))
  //             );
  //           })
  //         );
  //       }
  //     }

  //     // Wait for all queued tasks to finish (respecting concurrency)
  //     await Promise.all(tasks);

  //     dispatch(hideToast());
  //     router.push("/client/client-list");
  //   } catch (error) {
  //     console.error("Error during bulk update:", error);
  //     dispatch(hideToast());
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------- Guards & Validation ----------
    if (!Array.isArray(selectedClientIds) || selectedClientIds.length === 0) {
      dispatch(
        showToast({
          message: "No clients selected for bulk update.",
          status: "error",
        })
      );
      return;
    }

    const conflictingHandlers = (addHandler || []).filter((id) =>
      (removeHandler || []).includes(id)
    );
    if (conflictingHandlers.length > 0) {
      const labels = conflictingHandlers
        .map((id) => (handler || []).find((h) => h.value === id)?.label || id)
        .join(", ");
      alert(
        `Error: The same handler cannot be in both Add and Remove lists. Conflicting handlers: ${labels}`
      );
      return;
    }

    // dispatch(
    //   showToast({
    //     message: "Processing data, please wait..",
    //     status: "success",
    //     loader: true,
    //   })
    // );

    try {
      // ---------- Setup ----------
      const BATCH_SIZE = 25;
      const CONCURRENCY = 3;
      const limit = pLimit(CONCURRENCY);
      const tasks = [];

      // build client_id -> { serial_number, client_name } map (defensive)
      const clientInfoMap = {};
      (clients || []).forEach((c) => {
        const id = c.id ?? c.client_id;
        const serial = c.serial_number ?? c.mapped?.serial_number ?? null;
        // try mapped client_name, fallback to raw lookup or null
        const clientName =
          c.mapped?.client_name ??
          (Array.isArray(c.raw)
            ? (() => {
                const found = c.raw.find(
                  (r) =>
                    // try to detect column that represents client name (system id might differ)
                    r.column_id === "38096615-7993-4122-9275-a4627efba466"
                );
                return found ? found.row_value : null;
              })()
            : null) ??
          null;

        clientInfoMap[id] = {
          serial_number: serial,
          client_name: clientName,
        };
      });

      // columns that actually have a value to write
      const columnsWithValues = (clientColumns || []).filter(
        (col) =>
          typeof formData[col.column_id] !== "undefined" &&
          formData[col.column_id] !== null &&
          !(String(formData[col.column_id]).trim() === "")
      );

      const hasHandlerChanges =
        (addHandler?.length || 0) > 0 || (removeHandler?.length || 0) > 0;
      if (columnsWithValues.length === 0 && !hasHandlerChanges) {
        dispatch(hideToast());
        dispatch(showToast({ message: "Nothing to update.", status: "info" }));
        return;
      }

      // Accumulators for aggregated logs (we'll build single logs entry after all batches done)
      const aggregatedFieldsTouched = []; // { column_id, label, value } (unique by column_id)
      const aggregatedAffected = new Map(); // client_id -> { serial_number, client_name }
      let totalAffectedCount = 0;

      // helper to register metadata for a batch (we'll push batch fields & affected clients)
      const registerBatchMetadata = (fieldsTouched, batchClientIds) => {
        // fields: keep unique by column_id in aggregatedFieldsTouched
        for (const f of fieldsTouched) {
          if (
            !aggregatedFieldsTouched.find((x) => x.column_id === f.column_id)
          ) {
            aggregatedFieldsTouched.push(f);
          }
        }
        for (const client_id of batchClientIds) {
          if (!aggregatedAffected.has(client_id)) {
            const info = clientInfoMap[client_id] ?? {
              serial_number: null,
              client_name: null,
            };
            aggregatedAffected.set(client_id, {
              serial_number: info.serial_number ?? null,
              client_name: info.client_name ?? null,
            });
          }
        }
        totalAffectedCount = aggregatedAffected.size;
      };

      // helper to create per-batch handler lists
      const handlerListsForBatch = (batchClientIds) => {
        const add_handler_list = batchClientIds.flatMap((client_id) =>
          (addHandler || []).map((user_id) => ({ client_id, user_id }))
        );
        const remove_handler_list = batchClientIds.flatMap((client_id) =>
          (removeHandler || []).map((user_id) => ({ client_id, user_id }))
        );
        return { add_handler_list, remove_handler_list };
      };

      // ---------- enqueue batches for columnsWithValues ----------
      for (const col of columnsWithValues) {
        const columnValue = formData[col.column_id];

        for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
          const batchClientIds = selectedClientIds.slice(i, i + BATCH_SIZE);

          // build per-batch payload arrays
          const custom_values = [];
          const alert_values = [];

          if (col.field_type === "alert") {
            for (const client_id of batchClientIds) {
              alert_values.push({
                client_group_id: currSelectedGroupId,
                column_id: col.column_id,
                client_id,
                row_value: columnValue,
              });
            }
          } else {
            for (const client_id of batchClientIds) {
              custom_values.push({
                client_group_id: currSelectedGroupId,
                column_id: col.column_id,
                client_id,
                row_value: columnValue,
              });
            }
          }

          const { add_handler_list, remove_handler_list } =
            handlerListsForBatch(batchClientIds);

          const fieldsTouched = [
            {
              column_id: col.column_id,
              label: col.label ?? col.column_id,
              value: columnValue,
            },
          ];

          // Register metadata now (for aggregated logs after all batches)
          registerBatchMetadata(fieldsTouched, batchClientIds);

          // push limited task. NOTE: we do NOT pass logsBody here; we'll create logs after all tasks finish.
          tasks.push(
            limit(async () => {
              // include isAdmin / created_by_admin flags so backend can decide the path in a single endpoint
              const payload = {
                client_group_id: currSelectedGroupId,
                custom_values,
                alert_values,
                client_id_list: batchClientIds,
                add_handler_list,
                remove_handler_list,
                is_admin: !!isAdmin,
                created_by_admin: !!isAdmin,
              };

              // dispatch and await completion. Make sure your saga returns a Promise/response.
              dispatch(bulkUpdateClient({ router, payload }));

              // small jitter
              await new Promise((res) =>
                setTimeout(res, 50 + Math.floor(Math.random() * 50))
              );
            })
          );
        }
      }

      // ---------- enqueue handler-only batches if no column updates (or you may want to always add handler batches too) ----------
      if (columnsWithValues.length === 0 && hasHandlerChanges) {
        for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
          const batchClientIds = selectedClientIds.slice(i, i + BATCH_SIZE);
          const { add_handler_list, remove_handler_list } =
            handlerListsForBatch(batchClientIds);

          const fieldsTouched = [
            {
              column_id: "handler",
              label: "Handler",
              value: { add: addHandler || [], remove: removeHandler || [] },
            },
          ];

          registerBatchMetadata(fieldsTouched, batchClientIds);

          tasks.push(
            limit(async () => {
              const payload = {
                client_group_id: currSelectedGroupId,
                custom_values: [],
                alert_values: [],
                client_id_list: batchClientIds,
                add_handler_list,
                remove_handler_list,
                is_admin: !!isAdmin,
                created_by_admin: !!isAdmin,
              };

              dispatch(bulkUpdateClient({ router, payload }));
              await new Promise((res) =>
                setTimeout(res, 50 + Math.floor(Math.random() * 50))
              );
            })
          );
        }
      }

      // if no tasks, nothing to do
      if (tasks.length === 0) {
        dispatch(hideToast());
        dispatch(showToast({ message: "Nothing to update.", status: "info" }));
        return;
      }

      // ---------- run all batches concurrently (bounded by CONCURRENCY) ----------
      // This will reject if any individual batch throws
      await Promise.all(tasks);

      // ---------- after all batches succeeded, create one aggregated log entry ----------
      // build final aggregated logsBody
      const affectedArray = Array.from(aggregatedAffected.entries()).map(
        ([, /* client_id */ info]) => ({
          client_name: info.client_name ?? "",
          serial_number: info.serial_number ?? "",
        })
      );

      const logsBody = {
        company_id: currCompanyId,
        user_id: user?.uid,
        section: "Client",
        action: "BulkUpdate",
        text: `${user?.displayName} bulk updated ${aggregatedFieldsTouched
          .map((f) => f.label)
          .join(", ")}`,
        subject_id: currSelectedGroupId,
        metadata: {
          type: "bulk_update",
          fields: aggregatedFieldsTouched,
          affected: affectedArray,
          count: totalAffectedCount,
        },
      };

      // send logs once (server call)
      await API.post(ApiRoute.logs.create, logsBody);

      dispatch(hideToast());
      router.push("/client/client-list");
    } catch (err) {
      console.error("Error during bulk update:", err);
      dispatch(hideToast());
      dispatch(
        showToast({
          message: "Bulk update failed. Check console for details.",
          status: "error",
        })
      );
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
