import { DropdownField } from "@/components/FormComponents/DropdownField";
import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../../../../redux/slices/authSlice";
import {
  getSelectedClientGroup,
  useSelectCurrGroup,
} from "../../../../../../redux/slices/clientGroupSlice";
import {
  createClient,
  getClientDataByClientId,
  updateClient,
  useSelectCurrSelectedGroup,
  useSelectCurrSelectedGroupId,
  useSelectTargetedClientData,
} from "../../../../../../redux/slices/clientSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../../../../../redux/slices/companySlice";
import { generateCustomValues } from "@/utils/formHelper";
import { getFromLocalStorage } from "@/utils/localStorage";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { DateField } from "@/components/FormComponents/DateField";
import { renderClientInputField } from "@/utils/renderField";
import { useSelectUserPermissions } from "../../../../../../redux/slices/roleAuthSlice";
import { checkDuplicate } from "@/utils/checkDuplicate";
import { onValue, ref } from "firebase/database";
import { db } from "@/config/firebaseConfig";

export default function EditClientPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const currSelectedGroupId = useSelectCurrSelectedGroupId();
  const currSelectedGroup = useSelectCurrGroup();
  const clientData = useSelectTargetedClientData();
  const [handler, setHandler] = useState([]);

  const { client_group_id, client_id } = router.query;

  const userPermissions = useSelectUserPermissions();
  const isAdmin = useSelectIsAdmin();
  const canManageHandler =
    isAdmin || userPermissions.includes("manage_handler");

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
    const cols = [];

    if (canManageHandler) {
      cols.push({
        column_id: "handler",
        label: "Handler",
        field_type: "handler",
        options: handler,
        width: 100,
        is_required: true,
        permission: "editable",
        allow_duplicate: 1,
      });
    }

    if (currSelectedGroup) {
      const groupColumns = currSelectedGroup.columns.map((c) => ({
        ...c,
        options: c.options,
      }));
      cols.push(...groupColumns);
    }

    return cols;
  }, [currSelectedGroup, handler, canManageHandler]);

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

  // visibleColumns: admins see everything, non-admins hide not_viewable
  const visibleColumns = useMemo(() => {
    if (isAdmin) return sortedColumns;
    return sortedColumns.filter((c) => c.permission !== "not_viewable");
  }, [sortedColumns, isAdmin]);

  useEffect(() => {
    if (!currSelectedGroup && client_group_id) {
      dispatch(getSelectedClientGroup({ client_group_id: client_group_id }));
    }
  }, [client_group_id]);

  useEffect(() => {
    if (client_id && clientColumns.length > 0) {
      dispatch(getClientDataByClientId({ columns: clientColumns, client_id }));
    }
  }, [client_id, clientColumns]);

  useEffect(() => {
    const handlerList =
      allCompanyUsers.map((list) => {
        return {
          name: list.first_name + " " + list.last_name,
          label: list.first_name + " " + list.last_name,
          value: list.user_id,
        };
      }) || [];

    setHandler(handlerList);
  }, [allCompanyUsers]);

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({}); // field-level errors
  const currCompanyId = useSelectCurrCompanyId();

  useEffect(() => {
    // Build initialData using clientData (when available)
    const initialData = {
      handler: (clientData?.handler || []).map((h) => h.value) || [],
    };

    if (clientData?.raw) {
      const rawData = clientData.raw.reduce((acc, item) => {
        if (item.column_id) {
          // preserve original row_value (string or json)
          acc[item.column_id] = item.row_value;
        }
        return acc;
      }, {});
      Object.assign(initialData, rawData);
    }

    setFormData(initialData);
  }, [clientData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Admin bypass: skip front-end validation
    if (isAdmin) {
      // Build payload same as non-admin path but without validations
      const rawColumnId = (clientData?.raw || []).map((col) => col.column_id);
      const columns = clientColumns.filter((c) => c.column_id !== "handler");

      const existingColumns = columns.filter((col) =>
        rawColumnId.includes(col.column_id)
      );
      const missingColumns = columns.filter(
        (col) => !rawColumnId.includes(col.column_id)
      );

      const custom_values = generateCustomValues(
        existingColumns,
        formData,
        client_id,
        currSelectedGroupId
      );

      const missing_custom_values = generateCustomValues(
        missingColumns,
        formData,
        client_id,
        currSelectedGroupId
      );

      const handlerList =
        (formData.handler || []).map((h) => {
          const user_id = h.value || h;
          return {
            client_id: client_id,
            user_id: user_id,
          };
        }) || [];

      const finalPayload = {
        handler: handlerList,
        client_group_id: currSelectedGroupId,
        user_id: user?.uid,
        client_id: client_id,
        custom_values,
        missing_custom_values,
        // optional audit flag
        created_by_admin: true,
      };

      // Build logs payload similar to original flow (minimal here)
      const logsBody = {
        company_id: currCompanyId,
        user_id: user?.uid,
        section: "Client",
        action: "Update",
        text: `${user?.displayName} updated client ${client_id}`,
        metadata: {},
      };

      dispatch(updateClient({ payload: finalPayload, logsBody, router }));
      return;
    } else {
      // Non-admin: perform validations
      const errors = {};

      // required checks
      clientColumns.forEach((col) => {
        if (col.is_required) {
          const val = formData[col.column_id];
          if (col.column_id === "handler") {
            if (!val || (Array.isArray(val) && val.length === 0)) {
              errors[col.column_id] = `${col.label} is required`;
            }
          } else if (col.field_type === "alert") {
            const v = formData[col.column_id] || {
              date: "",
              is_complete: false,
            };
            if (!v.date) {
              errors[col.column_id] = `${col.label} date is required`;
            }
          } else {
            if (
              val === undefined ||
              val === null ||
              String(val).trim() === ""
            ) {
              errors[col.column_id] = `${col.label} is required`;
            }
          }
        }
      });

      // if required errors exist, stop early
      if (Object.keys(errors).length === 0) {
        // duplicate checks for allow_duplicate === 0
        for (const col of clientColumns) {
          if (col.allow_duplicate === 0) {
            if (col.column_id === "handler") continue; // skip handler
            const value = formData[col.column_id];
            const { isDuplicate, ok } = await checkDuplicate(
              dispatch,
              currSelectedGroupId,
              col.column_id,
              value
            );

            // console.log(isDuplicate)
            // console.log(ok)
            if (!ok) {
              errors[col.column_id] = `${col.label} error`;
              break;
            }
            if (isDuplicate) {
              errors[col.column_id] = `${col.label} value already exists`;
              break;
            }
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // If validations passed, proceed to build update payload (same as original)
      const rawColumnId = (clientData?.raw || []).map((col) => col.column_id);
      const columns = clientColumns.filter((c) => c.column_id !== "handler");

      const missingColumns = columns.filter(
        (col) => !rawColumnId.includes(col.column_id)
      );

      const existingColumns = columns.filter((col) =>
        rawColumnId.includes(col.column_id)
      );

      const custom_values = generateCustomValues(
        existingColumns,
        formData,
        client_id,
        currSelectedGroupId
      );

      const missing_custom_values = generateCustomValues(
        missingColumns,
        formData,
        client_id,
        currSelectedGroupId
      );

      const handlerList =
        formData.handler?.map((h) => {
          const user_id = h.value || h;
          return {
            client_id: client_id,
            user_id: user_id,
          };
        }) || [];

      const finalPayload = {
        handler: handlerList,
        client_group_id: currSelectedGroupId,
        user_id: user?.uid,
        client_id: client_id,
        custom_values,
        missing_custom_values,
      };

      // Build change-diff for logs (copied from your original logic)
      const prevMap = {};
      (clientData.raw || []).forEach((r) => {
        let prevVal = r.row_value ?? r.value ?? "";
        try {
          prevVal =
            typeof prevVal === "string" &&
            (prevVal.startsWith("{") || prevVal.startsWith("["))
              ? JSON.parse(prevVal)
              : prevVal;
        } catch (err) {
          // leave as string
        }
        prevMap[r.column_id] = prevVal;
      });

      const changes = [];

      existingColumns.forEach((col) => {
        const colId = col.column_id;
        const newRaw = formData[colId];
        let newVal = newRaw;
        if (col.field_type === "alert") {
          newVal = newRaw || {};
        }

        const oldVal = prevMap[colId] ?? "";

        const equal =
          typeof oldVal === "object" || typeof newVal === "object"
            ? JSON.stringify(oldVal) === JSON.stringify(newVal)
            : String(oldVal) === String(newVal);

        if (!equal) {
          changes.push({
            column_id: colId,
            label: col.label ?? colId,
            old: oldVal,
            new: newVal,
          });
        }
      });

      const prevHandlers =
        Array.isArray(clientData.handler) && clientData.handler.length > 0
          ? clientData.handler.map((h) => h.label ?? h.value)
          : typeof clientData.handler_name === "string" &&
            clientData.handler_name.length
          ? clientData.handler_name.split(",").map((s) => s.trim())
          : [];

      const handlerLookup = (clientData.handler || []).reduce((acc, h) => {
        acc[h.value] = h.label;
        return acc;
      }, {});

      const newHandlers = handlerList.map(
        (h) => handlerLookup[h.user_id] ?? h.user_id
      );

      const handlersChanged =
        JSON.stringify(prevHandlers.sort()) !==
        JSON.stringify(newHandlers.sort());
      if (handlersChanged) {
        changes.push({
          column_id: "handler",
          label: "Handler",
          old: prevHandlers,
          new: newHandlers,
        });
      }

      // Retrieve clientName (existing DB value preferred, fallback to edited)
      let clientName = "";
      const clientNameColumn = clientColumns.find(
        (c) => c.label === "Client Name"
      );
      if (clientNameColumn) {
        const rawItem = (clientData.raw || []).find(
          (r) => r.column_id === clientNameColumn.column_id
        );
        if (rawItem) {
          try {
            const parsed =
              typeof rawItem.row_value === "string" &&
              (rawItem.row_value.startsWith("{") ||
                rawItem.row_value.startsWith("["))
                ? JSON.parse(rawItem.row_value)
                : rawItem.row_value;
            clientName = parsed ?? "";
          } catch {
            clientName = rawItem.row_value ?? "";
          }
        }
        const editedName = formData[clientNameColumn.column_id];
        if (
          editedName !== undefined &&
          editedName !== null &&
          String(editedName).trim() !== ""
        ) {
          clientName = editedName;
        }
      }
      if (!clientName) clientName = client_id;

      const serialNumber =
        clientData.serial_number ?? clientData.mapped?.serial_number ?? null;

      const logsBody = {
        company_id: currCompanyId,
        user_id: user?.uid,
        section: "Client",
        action: "Update",
        text: `${user?.displayName} updated client ${clientName}`,
        metadata: {
          serial_number: serialNumber,
          changes,
        },
      };

      dispatch(updateClient({ payload: finalPayload, logsBody, router }));
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
          <h1>Edit Client</h1>
          <p>Update the client details below</p>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          {Object.keys(formErrors).length > 0 && (
            <div className="form-errors">
              <strong>Please fix the highlighted fields.</strong>
            </div>
          )}

          <div className="form-section">
            {visibleColumns.map((column) => (
              <div
                key={column.column_id}
                className="input-group"
                style={{ width: `${column.width - 4}%` }}
              >
                <label>
                  {column.label}
                  {column.is_required ? (
                    <span style={{ color: "red" }}> *</span>
                  ) : null}
                </label>

                {renderClientInputField(formData, column, setFormData, {
                  disabled: column.permission === "view_only",
                  error: formErrors[column.column_id],
                })}

                {formErrors[column.column_id] && (
                  <div
                    className="field-error"
                    style={{ color: "red", marginTop: 4 }}
                  >
                    {formErrors[column.column_id]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <ActionButton
              type="outlined"
              label="Cancel"
              onClick={handleCancel}
            />
            <ActionButton type="primary" label="Save" onClick={handleSubmit} />
          </div>
        </form>
      </div>
    </div>
  );
}
