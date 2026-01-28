import { DropdownField } from "@/components/FormComponents/DropdownField";
import { InputColor } from "@/components/FormComponents/InputColor";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import SwitchField from "@/components/FormComponents/SwitchField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../../../redux/slices/authSlice";
import {
  createClientGroup,
  getSelectedClientGroup,
  updateClientGroup,
  useSelectCurrGroup,
} from "../../../../../redux/slices/clientGroupSlice";
import { useSelectCurrCompany } from "../../../../../redux/slices/companySlice";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { FaGripVertical, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { db } from "@/config/firebaseConfig";
import { onValue, ref } from "firebase/database";

// Main Component
export default function EditClientGroupPage({ params }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const currCompany = useSelectCurrCompany();
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const currGroup = useSelectCurrGroup();

  const { client_group_id } = router.query;

  const [fields, setFields] = useState([
    {
      column_id: v4(),
      label: "Client Name",
      field_type: "short_text",
      multi_select_dropdown: false,
      permission: "editable",
      width: "100",
      is_required: false,
      allow_duplicate: true,
      is_system: true,
      options: [],
    },
  ]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [newField, setNewField] = useState({
    label: "",
    field_type: "short_text",
    multi_select_dropdown: false,
    permission: "editable",
    width: "100",
    is_required: false,
    allow_duplicate: true,
    options: [],
  });

  const fieldTypes = [
    { label: "Short Text", value: "short_text" },
    { label: "Date", value: "date" },
    { label: "Multiline", value: "multiline" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Alert", value: "alert" },
    { label: "Number", value: "number" },
    { label: "Rich Text", value: "rich_text" },
    { label: "Multiple Choice", value: "choice" },
    { label: "Checkbox", value: "checkbox" },
    { label: "Link", value: "link" },
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
    if (client_group_id) {
      dispatch(getSelectedClientGroup({ client_group_id: client_group_id }));
    }
  }, [client_group_id]);

  useEffect(() => {
    if (!currGroup) return;
    const groupId = currGroup.client_group_id;
    setGroupName(currGroup.client_group_name);

    const sortRef = ref(db, `ColumnSorting/${groupId}`);

    const unsubscribe = onValue(
      sortRef,
      (snap) => {
        const sortOrder = snap.val();

        const getId = (col) => col?.id ?? col?.column_id ?? col?.key;

        // if no saved sortOrder, just use original columns
        if (!Array.isArray(sortOrder) || sortOrder.length === 0) {
          setFields(Array.isArray(currGroup.columns) ? currGroup.columns : []);
          return;
        }

        // make map: id -> index in sortOrder (for fast lookup)
        const indexMap = new Map();
        sortOrder.forEach((id, idx) => indexMap.set(id, idx));

        // split columns into two groups:
        // 1) known — those whose id exists in indexMap (and will be sorted by index)
        // 2) unknown — those not in indexMap (kept in original relative order and appended)
        const originalCols = Array.isArray(currGroup.columns)
          ? currGroup.columns
          : [];

        const known = [];
        const unknown = [];

        for (let i = 0; i < originalCols.length; i++) {
          const col = originalCols[i];
          const id = getId(col);
          if (id && indexMap.has(id)) known.push(col);
          else unknown.push(col);
        }

        known.sort((a, b) => {
          const ai = indexMap.get(getId(a));
          const bi = indexMap.get(getId(b));
          return ai - bi;
        });

        const finalOrder = [...known, ...unknown];

        setFields(finalOrder);
      },
      (err) => {
        console.error("ColumnSorting listener error:", err);
        setFields(Array.isArray(currGroup.columns) ? currGroup.columns : []);
      },
    );

    return () => unsubscribe();
  }, [
    currGroup?.client_group_id,
    currGroup?.client_group_name,
    currGroup?.columns,
  ]);

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === targetIndex) return;

    const newFields = [...fields];
    const [movedItem] = newFields.splice(draggedItem, 1);
    newFields.splice(targetIndex, 0, movedItem);

    setFields(newFields);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    if (selectedColumnId) {
      const column = fields.find((f) => f.column_id === selectedColumnId);
      setNewField(column);
      setShowDrawer(true);
    }
  }, [selectedColumnId]);

  useEffect(() => {
    if (newField.field_type === "dropdown" || newField.field_type === "alert" || newField.field_type === "choice" || newField.field_type === "checkbox") {
      setNewField((prev) => ({
        ...prev,
        options: prev.options || [
          {
            option_id: v4(),
            value: "",
            color: "#000000",
            fillColor: "#ffffff",
            period: "",
            unit: "",
          },
        ],
      }));
    }
  }, [newField.field_type]);

  const handleAddField = () => {
    setNewField({
      column_id: v4(),
      label: "",
      field_type: "short_text",
      multi_select_dropdown: false,
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
        multi_select_dropdown: false,
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
          color: "#000000",
          fillColor: "#ffffff",
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
      ...currGroup,
      client_group_name: groupName,
      user_id: user?.uid,
      company_id: currCompany?.company_id,
      columns: fields,
    };

    dispatch(updateClientGroup({ data: body, router }));
  };

  return (
    <Fragment>
   
      {showDrawer ? <div className="backdrop"></div> : null}
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
            <ActionButton
              type="outlined"
              label={"Back"}
              onClick={() => {
                router.push("/client/client-group-list");
              }}
            />
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
              const isDragging = index === draggedItem;
              const isDragOver = index === dragOverIndex;
              const width = field.width;
              return (
                <div
                  key={field.column_id}
                  style={{ width: `${width - 4}%` }}
                  className={`field-item ${isDragging ? "dragging" : ""} ${
                    isDragOver ? "drag-over" : ""
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* <div className="drag-handle" title="Drag to reorder">
                  ⋮⋮
                </div> */}
                  <div className="drag-handle">
                    <FaGripVertical />
                  </div>
                  <div className="field-input-container">
                    <div
                      className="text-box"
                      onClick={() => setSelectedColumnId(field.column_id)}
                    >
                      {field.label}
                    </div>
                    {!field.is_system ? (
                      <div
                        className="delete-overlay"
                        onClick={() => handleDeleteField(field.column_id)}
                      >
                        <FaTrash size={10} />
                      </div>
                    ) : null}
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
            <div className="drawer-overlay" onClick={handleCloseDrawer} />
            <div className="drawer">
              <div className="drawer-header">
                <h2>Add Field</h2>
                <button className="close-button" onClick={handleCloseDrawer}>
                  ×
                </button>
              </div>

              <div className="drawer-content">
                <div className="form-section">
                  <div className="input-group">
                    <label>Name</label>
                    <PlainTextField
                      disable={newField.is_system}
                      type={"text"}
                      value={newField.label}
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

                  {newField.field_type === "dropdown" && (
                    <div className="input-group row-layout">
                      <label>Multi Select</label>
                      <SwitchField
                        checked={newField.multi_select_dropdown}
                        onChange={(e) =>
                          setNewField((prev) => ({
                            ...prev,
                            multi_select_dropdown: e.target.checked,
                          }))
                        }
                      />
                    </div>
                  )}

                  <div className="input-group row-layout">
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

                  <div className="input-group row-layout">
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
                {(newField.field_type === "dropdown" || newField.field_type === "choice" 
                  || newField.field_type === "checkbox"
                ) && (
                  <>
                    <div className="divider"></div>
                    <div className="form-section">
                      <h3>Options</h3>
                      <div className="options-container">
                        {newField.options.map((option) => (
                          <div key={option.option_id} className="option-item">
                            <div className="drag-handle">⋮⋮</div>
                            <div className="color-pickers">
                              <InputColor
                                placeholder={"Text Color"}
                                value={option.color}
                                onChange={(value) => {
                                  const updatedOptions = newField.options.map(
                                    (opt) =>
                                      opt.option_id === option.option_id
                                        ? { ...opt, color: value }
                                        : opt,
                                  );
                                  setNewField((prev) => ({
                                    ...prev,
                                    options: updatedOptions,
                                  }));
                                }}
                              />
                              <InputColor
                                placeholder={"Background Color"}
                                value={option.fillColor}
                                onChange={(value) => {
                                  const updatedOptions = newField.options.map(
                                    (opt) =>
                                      opt.option_id === option.option_id
                                        ? { ...opt, fillColor: value }
                                        : opt,
                                  );
                                  setNewField((prev) => ({
                                    ...prev,
                                    options: updatedOptions,
                                  }));
                                }}
                              />
                            </div>
                            <div className="option-input-container">
                              <PlainTextField
                                value={option.value}
                                onChange={(value) => {
                                  const updatedOptions = newField.options.map(
                                    (opt) =>
                                      opt.option_id === option.option_id
                                        ? { ...opt, value: value }
                                        : opt,
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

                {newField.field_type === "alert" && (
                  <>
                    <div className="divider"></div>
                    <div className="form-section">
                      <h3>Options</h3>
                      <div className="options-container">
                        {newField.options.map((option) => (
                          <div key={option.option_id} className="option-item">
                            <div className="drag-handle">⋮⋮</div>
                            <div className="color-pickers">
                              <InputColor
                                placeholder={"Background Color"}
                                value={option.fillColor}
                                onChange={(value) => {
                                  const updatedOptions = newField.options.map(
                                    (opt) =>
                                      opt.option_id === option.option_id
                                        ? { ...opt, fillColor: value }
                                        : opt,
                                  );
                                  setNewField((prev) => ({
                                    ...prev,
                                    options: updatedOptions,
                                  }));
                                }}
                              />
                            </div>
                            <div className="option-input-container alert">
                              <PlainTextField
                                value={option.value}
                                onChange={(value) => {
                                  const updatedOptions = newField.options.map(
                                    (opt) =>
                                      opt.option_id === option.option_id
                                        ? { ...opt, value: value }
                                        : opt,
                                  );
                                  setNewField((prev) => ({
                                    ...prev,
                                    options: updatedOptions,
                                  }));
                                }}
                                placeholder="Value"
                              />
                              <DropdownField
                                value={option.unit}
                                onChange={(value) => {
                                  const updatedOptions = newField.options.map(
                                    (opt) =>
                                      opt.option_id === option.option_id
                                        ? { ...opt, unit: value }
                                        : opt,
                                  );
                                  setNewField((prev) => ({
                                    ...prev,
                                    options: updatedOptions,
                                  }));
                                }}
                                dropdownList={unitList}
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
                  onClick={handleCloseDrawer}
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
    </Fragment>
  );
}
