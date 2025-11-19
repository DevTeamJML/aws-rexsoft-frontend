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
} from "../../../../../../redux/slices/companySlice";
import { generateCustomValues } from "@/utils/formHelper";
import { getFromLocalStorage } from "@/utils/localStorage";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { DateField } from "@/components/FormComponents/DateField";
import { renderClientInputField } from "@/utils/renderField";

export default function EditClientPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const currSelectedGroupId = useSelectCurrSelectedGroupId();
  const currSelectedGroup = useSelectCurrGroup();
  const clientData = useSelectTargetedClientData();
  const [handler, setHandler] = useState([]);
  // const [sortedColumn, setSortedColumn] = useState([]);

  const { client_group_id, client_id } = router.query;

  const clientColumns = useMemo(() => {
    if (currSelectedGroup) {
      // Create handler field as the first column
      const handlerField = {
        column_id: "handler",
        label: "Handler",
        field_type: "handler",
        options: handler,
        width: 100,
        is_required: true,
      };

      const groupColumns = currSelectedGroup?.columns.map((c) => {
        return {
          ...c,
          options: c.options,
        };
      });

      return [handlerField, ...groupColumns];
    } else {
      return [
        {
          column_id: "handler",
          label: "Handler",
          field_type: "handler",
          options: handler,
          width: 100,
          is_required: true,
        },
      ];
    }
  }, [currSelectedGroup, handler]);

  useEffect(() => {
    if (!currSelectedGroup && client_group_id) {
      // const storedSelectedClientGroupId = getFromLocalStorage(
      //   process.env.CURR_SELECTED_GROUP_ID
      // );

      // const targetGroupId = storedSelectedClientGroupId || client_group_id;

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

  const currCompanyId = useSelectCurrCompanyId();

  useEffect(() => {
    const initialData = {
      handler: clientData?.handler.map((h) => h.value) || [],
    };

    if (clientData?.raw) {
      const rawData = clientData.raw.reduce((acc, item) => {
        if (item.column_id) {
          acc[item.column_id] = item.row_value;
        }
        return acc;
      }, {});

      Object.assign(initialData, rawData);
    }

    setFormData(initialData);
  }, [clientData]);

  const handleInputChange = (columnId, value) => {
    if (columnId === "handler") {
      setFormData((prev) => ({
        ...prev,
        [columnId]: prev[columnId].includes(value)
          ? prev[columnId].filter((o) => o.value !== value)
          : [...prev[columnId], value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [columnId]: value,
      }));
    }
  };

  const handleHandlerRemove = (columnId, value) => {
    setFormData((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((o) => o !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const client_group_id = currSelectedGroupId;
    const rawColumnId = clientData.raw.map((col) => col.column_id);
    const columns = clientColumns.filter((c) => c.column_id !== "handler");

    const missingColumns = columns.filter(
      (col) => !rawColumnId.includes(col.column_id)
    );

    // find existing columns
    const existingColumns = columns.filter((col) =>
      rawColumnId.includes(col.column_id)
    );

    const custom_values = generateCustomValues(
      existingColumns,
      formData,
      client_id,
      client_group_id
    );

    const missing_custom_values = generateCustomValues(
      missingColumns,
      formData,
      client_id,
      client_group_id
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

    console.log("Submit Payload", finalPayload);
    dispatch(updateClient({ payload: finalPayload, router }));
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
          <div className="form-section">
            {clientColumns.map((column) => (
              <div
                key={column.column_id}
                className="input-group"
                style={{ width: `${column.width - 2}%` }}
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
            <ActionButton type="primary" label="Save" onClick={handleSubmit} />
          </div>
        </form>
      </div>
    </div>
  );
}
