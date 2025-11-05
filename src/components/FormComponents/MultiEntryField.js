import { formatNumber, formatUrl, unformatNumber } from "@/utils/format";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useState, useRef, Fragment, useEffect } from "react";
import { DateField } from "./DateField";
import { PlainTextField } from "./PlainTextField";
import { TimeField } from "./TimeField";
import { v4 } from "uuid";

export const MultiEntryField = ({
  type,
  label,
  list,
  setList,
  onPushMethod,
  onChange,
  onDelete,
  width,
  required,
}) => {
  const DeleteIcon = dynamic(
    () => import("@mui/icons-material/DeleteOutlined"),
    {
      ssr: false,
    }
  );
  const AddIcon = dynamic(() => import("@mui/icons-material/AddOutlined"), {
    ssr: false,
  });
  const DragIcon = dynamic(
    () => import("@mui/icons-material/DragIndicatorOutlined"),
    {
      ssr: false,
    }
  );

  const [isEditing, setIsEditing] = useState({});
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const router = useRouter();
  const { id } = router.query;

  const hasInitialized = useRef(null);

  useEffect(() => {
    if (list.length > 0 && Object.keys(isEditing).length === 0) {
      const initialEditingState = {};

      list.forEach((_, index) => {
        initialEditingState[index] = { editing: true };
      });

      setIsEditing(initialEditingState);
    }
  }, [list]);

  useEffect(() => {
    if (
      !hasInitialized.current &&
      id &&
      type === "link" &&
      list.some((item) => item.value && item.value.trim() !== "")
    ) {
      const newEditingState = {};

      list.forEach((item, index) => {
        newEditingState[index] = {
          editing: !item.value,
        };
      });

      setIsEditing(newEditingState);
      hasInitialized.current = true;
    }
  }, [id, type, isEditing]);

  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter"  || e.keyCode === 13 || e.keyCode === 66) {
      e.preventDefault();
      setIsEditing((prev) => ({
        ...prev,
        [index]: { editing: false },
      }));
    }
  };

  const handleEditClick = (index) => {
    setIsEditing((prev) => ({
      ...prev,
      [index]: { editing: true },
    }));
  };

  // Draggable functions
  const handleDragStart = (index) => {
    dragItem.current = index;
    setDraggingIndex(index);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    const copiedItems = [...list];
    const draggedItemContent = copiedItems.splice(dragItem.current, 1)[0];
    copiedItems.splice(dragOverItem.current, 0, draggedItemContent);
    setList(copiedItems);
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const renderAddButton = () => {
    return (
      <div
        className="multi-entry-add-box"
        onClick={() => {
          switch (type) {
            case "kpi":
              onPushMethod(
                setList,
                {
                  name: "",
                  current_kpi: "",
                  target_kpi: "",
                },
                type
              );
              break;
            case "schedule":
              onPushMethod(
                setList,
                {
                  schedule_id: v4(),
                  schedule_date: "",
                  schedule_time: "",
                  schedule_description: "",
                  schedule_pic: "",
                },
                type
              );
              break;
            case "note":
              onPushMethod(setList, { value: "" }, type);
            default:
              onPushMethod(setList, { name: "", value: "" }, type);
          }
        }}
      >
        <AddIcon className="multi-entry-add-icon" fontSize="10px" />
        <span>
          {type === "link" && "Link"}
          {type === "expenses" && "Expenses"}
          {type === "cta" && "CTA"}
          {type === "kpi" && "KPI"}
          {type === "notes" && "Notes"}
          {type === "adnotes" && "Ad Notes"}
          {type === "schedule" && "Post"}
        </span>
      </div>
    );
  };

  const renderMultiEntryLink = (index, value) => {
    return isEditing[index]?.editing !== false ? (
      <input
        className="field-input"
        placeholder="Link"
        type="text"
        value={value}
        onChange={(e) => onChange(setList, index, "value", e.target.value)}
        onKeyDown={(e) => {
          handleKeyDown(e, index);
        }}
      />
    ) : (
      <div className="field-input">
        <div
          className="anchor-box"
          onClick={() => window.open(formatUrl(value))}
        >
          <input className="anchor-text" type="text" value={value} readOnly />
        </div>

        {
          <div className="link-edit-modal">
            <div
              onClick={() => {
                handleEditClick(index);
              }}
              className="link-edit-btn"
            >
              Edit Link
            </div>
          </div>
        }
      </div>
    );
  };

  const renderMultiEntryExpenses = (index, value) => {
    const formattedNumber = formatNumber(value);
    return (
      <input
        className="field-input"
        placeholder="Expenses"
        type="text"
        value={formattedNumber}
        onChange={(e) => {
          const raw = unformatNumber(e.target.value);
          if (!/^\d*(\.?\d{0,2})?$/.test(raw)) return;
          onChange(setList, index, "value", raw);
        }}
        onKeyDown={(e) => {
          handleKeyDown(e, index);
        }}
        onWheel={handleWheel}
      />
    );
  };

  const renderMultiEntryCta = (index, value) => {
    return (
      <input
        className="field-input"
        placeholder="CTA Click"
        type="text"
        value={value}
        onChange={(e) => onChange(setList, index, "value", e.target.value)}
        onKeyDown={(e) => {
          handleKeyDown(e, index);
        }}
      />
    );
  };

  const renderMultiEntryKpi = (index, currentKpi, kpiTarget) => {
    const formattedCurrentKpi = formatNumber(currentKpi);
    const formattedTargetKpi = formatNumber(kpiTarget);
    return (
      <div className="multi-entry-kpi-container">
        <input
          className="field-input"
          placeholder="Current KPI"
          type="text"
          value={formattedCurrentKpi}
          onChange={(e) => {
            const raw = unformatNumber(e.target.value);
            if (!/^\d*(\.?\d{0,2})?$/.test(raw)) return;
            onChange(setList, index, "current_kpi", raw);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e, index);
          }}
        />
        <span>/</span>
        <input
          className="field-input"
          placeholder="KPI Target"
          type="text"
          value={formattedTargetKpi}
          onChange={(e) => {
            const raw = unformatNumber(e.target.value);
            if (!/^\d*(\.?\d{0,2})?$/.test(raw)) return;
            onChange(setList, index, "kpi_target", raw);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e, index);
          }}
        />
      </div>
    );
  };

  const renderMultiEntryNotes = (index, value) => {
    return (
      <input
        className="field-input input-w-100"
        placeholder="Notes"
        type="text"
        value={value}
        onChange={(e) => onChange(setList, index, "value", e.target.value)}
        onKeyDown={(e) => {
          handleKeyDown(e, index);
        }}
      />
    );
  };

  const renderMultiEntryAdNotes = (index, value) => {
    return (
      <input
        className="field-input"
        placeholder="Ad Notes"
        type="text"
        value={value}
        onChange={(e) => onChange(setList, index, "value", e.target.value)}
        onKeyDown={(e) => {
          handleKeyDown(e, index);
        }}
      />
    );
  };

  const renderMultiEntrySchedule = (
    index,
    schedule_date,
    schedule_time,
    schedule_description,
    schedule_pic
  ) => {
    return (
      <div className="multi-entry-schedule-container">
        <span style={{ minWidth: "20px" }}>{index + 1}. </span>
        <DateField
          placeholder={"Date"}
          width={"24%"}
          value={schedule_date}
          onChange={(val) => {
            onChange(setList, index, "schedule_date", val);
          }}
        />
        <TimeField
          placeholder={"Time"}
          width={"24%"}
          value={schedule_time}
          onChange={(val) => {
            onChange(setList, index, "schedule_time", val);
          }}
        />
        <PlainTextField
          placeholder={"Description"}
          width={"24%"}
          required={false}
          type={"text"}
          value={schedule_description}
          onChange={(val) => {
            onChange(setList, index, "schedule_description", val);
          }}
        />
        <PlainTextField
          placeholder={"PIC"}
          width={"24%"}
          required={false}
          type={"text"}
          value={schedule_pic}
          onChange={(val) => {
            onChange(setList, index, "schedule_pic", val);
          }}
        />
        {/* <input
          className="field-input"
          placeholder="Date"
          type="text"
          value={schedule_date}
          onChange={(e) => {
            onChange(setList, index, "schedule_date", e.target.value);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e, index);
          }}
        />
        <input
          className="field-input"
          placeholder="Time"
          type="text"
          value={schedule_time}
          onChange={(e) => {
            onChange(setList, index, "schedule_time", e.target.value);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e, index);
          }}
        />
        <input
          className="field-input"
          placeholder="Description"
          type="text"
          value={schedule_description}
          onChange={(e) => {
            onChange(setList, index, "schedule_description", e.target.value);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e, index);
          }}
        />
        <input
          className="field-input"
          placeholder="PIC"
          type="text"
          value={schedule_pic}
          onChange={(e) => {
            onChange(setList, index, "schedule_pic", e.target.value);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e, index);
          }}
        /> */}
      </div>
    );
  };

  return (
    <div
      className="multi-entry-field-container"
      style={{ width, position: "relative" }}
    >
      <label className="input-label multientry-title">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
        {renderAddButton()}
      </label>
      <div className="multi-entry-field-inner-container">
        <div className="multi-entry-field">
          {list && list.length
            ? list.map((item, index) => {
                const name = item.name || "";
                const value = item.value || "";
                const currentKpi = item.current_kpi || "";
                const kpiTarget = item.kpi_target || "";
                const schedule_time = item.schedule_time || "";
                const schedule_date = item.schedule_date || "";
                const schedule_description = item.schedule_description || "";
                const schedule_pic = item.schedule_pic || "";

                return (
                  <div
                    key={index}
                    className={`multi-entry-field-input-box 
                ${draggingIndex === index ? "drag-active" : ""}
                ${
                  dragOverIndex === index && draggingIndex !== index
                    ? "drag-hover"
                    : ""
                }
              `}
                  >
                    {/* label */}
                    {type !== "notes" && type !== "schedule" ? (
                      <input
                        className="field-name-input"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => {
                          onChange(setList, index, "name", e.target.value);
                        }}
                      />
                    ) : null}

                    {/* input */}
                    {type === "link"
                      ? renderMultiEntryLink(index, value)
                      : null}
                    {type === "expenses"
                      ? renderMultiEntryExpenses(index, value)
                      : null}
                    {type === "cta" ? renderMultiEntryCta(index, value) : null}
                    {type === "kpi"
                      ? renderMultiEntryKpi(index, currentKpi, kpiTarget)
                      : null}
                    {type === "notes"
                      ? renderMultiEntryNotes(index, value)
                      : null}
                    {type === "adnotes"
                      ? renderMultiEntryAdNotes(index, value)
                      : null}

                    {type === "schedule"
                      ? renderMultiEntrySchedule(
                          index,
                          schedule_date,
                          schedule_time,
                          schedule_description,
                          schedule_pic
                        )
                      : null}
                    {/* actions */}
                    <div
                      className="multi-entry-delete-box"
                      onClick={() => {
                        onDelete(setList, index);
                      }}
                    >
                      <DeleteIcon sx={{ color: "red", fontSize: 25 }} />
                    </div>
                    {type !== "schedule" ? (
                      <div
                        className={`multi-entry-drag-box`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={() => handleDragEnd()}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <DragIcon sx={{ fontSize: 25 }} />
                      </div>
                    ) : null}
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
};
