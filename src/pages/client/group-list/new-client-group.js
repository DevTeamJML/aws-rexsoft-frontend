import { DropdownField } from "@/components/FormComponents/DropdownField";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import SwitchField from "@/components/FormComponents/SwitchField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "@/redux/slices/authSlice";
import { createClientGroup } from "@/redux/slices/clientGroupSlice";
import { useSelectCurrCompany } from "@/redux/slices/companySlice";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";

// Main Component
export default function NewClientGroupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const currCompany = useSelectCurrCompany();
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [fields, setFields] = useState([
    {
      column_id: v4(),
      label: "Client Name",
      field_type: "short_text",
      permission: "editable",
      width: "100",
      is_required: false,
      allow_duplicate: true,
      options: [],
    },
  ]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [newField, setNewField] = useState({
    label: "",
    field_type: "short_text",
    permission: "editable",
    width: "100",
    is_required: false,
    allow_duplicate: true,
    options: [],
  });

  const fieldTypes = [
    { label: "Short Text", value: "short_text" },
    { label: "Multiline", value: "multiline" },
    { label: "Rich Text", value: "rich_text" },
    { label: "Dropdown", value: "dropdown" },
    // { label: "Choice", value: "choice" },
    // { label: "Checkbox", value: "checkbox" },
    { label: "Alert", value: "alert" },
    { label: "Number", value: "number" },
  ];

  const permissions = [
    { label: "View Only", value: "view_only" },
    { label: "Editable", value: "editable" },
    { label: "Not Viewable", value: "not_viewable" },
  ];
  const widths = [
    { label: "100%", value: "100" },
    { label: "75%", value: "75" },
    { label: "50%", value: "50" },
    { label: "25%", value: "25" },
  ];

  const unitList = [
    {
      label: "Day",
      value: "day",
    },
    {
      label: "Week",
      value: "week",
    },
    {
      label: "Month",
      value: "month",
    },
  ];

  useEffect(() => {
    if (selectedColumnId) {
      const column = fields.find((f) => f.column_id === selectedColumnId);
      setNewField(column);
      setShowDrawer(true);
    }
  }, [selectedColumnId]);

  const handleAddField = () => {
    setNewField({
      column_id: v4(),
      label: "",
      field_type: "short_text",
      permission: "editable",
      width: "100",
      is_required: false,
      allow_duplicate: true,
      options: [],
    });
    setShowDrawer(true);
  };

  const handleSaveField = () => {
    if (selectedColumnId) {
      const updatedField = fields.map((f) => {
        if (f.column_id === selectedColumnId) {
          return newField;
        }
        return f;
      });
      setFields(updatedField);
      setSelectedColumnId("");
    } else {
      setFields((prev) => [...prev, { ...newField }]);
      setNewField({
        column_id: v4(),
        label: "",
        field_type: "short_text",
        permission: "editable",
        width: "100",
        is_required: false,
        allow_duplicate: true,
        options: [],
      });
    }

    setShowDrawer(false);
  };

  const handleDeleteField = (fieldId) => {
    setFields((prev) => prev.filter((field) => field.column_id !== fieldId));
  };

  const handleAddOption = () => {
    setNewField((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          option_id: v4(),
          value: "",
          color: "",
          fillColor: "",
          period: "",
          unit: "",
        },
      ],
    }));
  };

  const handleDeleteOption = (optionId) => {
    setNewField((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option.option_id !== optionId),
    }));
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedColumnId("");
  };

  const handleSaveGroup = () => {
    const body = {
      client_group_id : v4(),
      client_group_name: groupName,
      user_id: user?.uid,
      company_id: currCompany?.company_id,
      columns: fields,
    };

    dispatch(createClientGroup({ data: body, router }));
  };
  return (
    <div className="new-client-group-container">
      {/* Top Card */}
      <div className="top-card">
        <div className="group-name-input">
          <PlainTextField
            type={"text"}
            placeholder="Your Group Name"
            value={groupName}
            onChange={(val) => setGroupName(val)}
          />
        </div>
        <div className="top-actions">
          <ActionButton type="outlined" label={"Back"} />
          <ActionButton
            type="primary"
            label={"+ Add Field"}
            onClick={handleAddField}
          />

          <ActionButton
            type="primary"
            label={"Save"}
            onClick={handleSaveGroup}
          />
        </div>
      </div>
      {/* Bottom Card */}
      <div className="bottom-card">
        <div className="fields-container">
          {fields.map((field, index) => {
            return (
              <div key={field.column_id} className="field-item">
                <div className="drag-handle">⋮⋮</div>
                <div className="field-input-container">
                  <div
                    className="text-box"
                    onClick={() => setSelectedColumnId(field.column_id)}
                  >
                    {field.label}
                  </div>
                  <div
                    className="delete-overlay"
                    onClick={() => handleDeleteField(field.column_id)}
                  >
                    <FaTrash size={10} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="add-field-button" onClick={handleAddField}>
          + Add Field
        </button>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => {
              handleCloseDrawer();
            }}
          />
          <div className="drawer">
            <div className="drawer-header">
              <h2>Add Field</h2>
              <button
                className="close-button"
                onClick={() => {
                  handleCloseDrawer();
                }}
              >
                ×
              </button>
            </div>

            <div className="drawer-content">
              <div className="form-section">
                <div className="input-group">
                  <label>Name</label>
                  <PlainTextField
                    type={"text"}
                    value={newField.label}
                    disabled
                    placeholder="Enter field name"
                    onChange={(value) =>
                      setNewField((prev) => ({ ...prev, label: value }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Field Type</label>
                  <DropdownField
                    value={newField.field_type}
                    onChange={(value) =>
                      setNewField((prev) => ({ ...prev, field_type: value }))
                    }
                    dropdownList={fieldTypes}
                  />
                </div>

                <div className="input-group">
                  <label>Permission</label>
                  <DropdownField
                    value={newField.permission}
                    onChange={(value) =>
                      setNewField((prev) => ({
                        ...prev,
                        permission: value,
                      }))
                    }
                    dropdownList={permissions}
                  />
                </div>

                <div className="input-group">
                  <label>Width</label>
                  <DropdownField
                    value={newField.width}
                    onChange={(value) =>
                      setNewField((prev) => ({
                        ...prev,
                        width: value,
                      }))
                    }
                    dropdownList={widths}
                  />
                </div>

                <div
                  className="input-group"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row"
                  }}
                >
                  <label>Required</label>
                  <SwitchField
                    checked={newField.is_required}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        is_required: e.target.checked,
                      }))
                    }
                  />
                </div>

                <div
                  className="input-group"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row"
                  }}
                >
                  <label>Allow Duplicate</label>
                  <SwitchField
                    checked={newField.allow_duplicate}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        allow_duplicate: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
              {/* Options Section for Dropdown */}
              {newField.field_type === "dropdown" && (
                <>
                  <div className="divider"></div>
                  <div className="form-section">
                    <h3>Options</h3>
                    <div className="options-container">
                      {newField.options.map((option) => (
                        <div key={option.option_id} className="option-item">
                          <div className="drag-handle">⋮⋮</div>
                          <div className="color-pickers">
                            <div
                              title="font color"
                              className="color-picker primary"
                            ></div>
                            <div
                              title="background color"
                              className="color-picker secondary"
                            ></div>
                          </div>
                          <div className="option-input-container">
                            <PlainTextField
                              value={option.value}
                              onChange={(value) => {
                                const updatedOptions = newField.options.map(
                                  (opt) =>
                                    opt.option_id === option.option_id
                                      ? { ...opt, value: value }
                                      : opt
                                );
                                setNewField((prev) => ({
                                  ...prev,
                                  options: updatedOptions,
                                }));
                              }}
                              placeholder="Option name"
                            />
                            <div
                              className="delete-overlay"
                              onClick={() =>
                                handleDeleteOption(option.option_id)
                              }
                            >
                              <FaTrash size={12} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        className="add-option-button"
                        onClick={handleAddOption}
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="drawer-footer">
              <ActionButton
                type="outlined"
                label={"Close"}
                onClick={() => handleCloseDrawer()}
              />
              <ActionButton
                type="primary"
                label={"Save"}
                onClick={handleSaveField}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
