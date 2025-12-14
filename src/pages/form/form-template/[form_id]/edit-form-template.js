import { DropdownField } from "@/components/FormComponents/DropdownField";
import { InputColor } from "@/components/FormComponents/InputColor";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import SwitchField from "@/components/FormComponents/SwitchField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGripVertical, FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { useSelectCurrCompany } from "../../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../../redux/slices/authSlice";
// Updated imports for edit flow: get by id, update, and selector for loaded template
import {
  getFormTemplateById,
  updateFormTemplate,
  createFormTemplate,
  useSelectFormTemplate,
  useSelectCurrTemplate,
} from "../../../../../redux/slices/formTemplateSlice";
import { db } from "@/config/firebaseConfig";
import { onValue, ref } from "firebase/database";

// Firebase imports for realtime sorting listener

// Main Component — renamed to form-template context
export default function NewFormTemplatePage({ params }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const currCompany = useSelectCurrCompany();

  // read form_id from route (URL [form_id])
  const { form_id } = router.query; // will be undefined on first render sometimes

  // renamed state keys to match form-template naming
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [formTemplateName, setFormTemplateName] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  // selector for the loaded template from redux (assumes slice provides this hook)
  const formTemplate = useSelectCurrTemplate();

  const [questions, setQuestions] = useState([
    {
      form_question_id: v4(),
      label: "First Question",
      field_type: "short_text",
      permission: "editable",
      width: "100",
      is_required: false,
      allow_duplicate: true,
      is_system: true,
      options: [],
    },
  ]);

  const [newQuestion, setNewQuestion] = useState({
    form_question_id: v4(),
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
    { label: "Date", value: "date" },
    { label: "Multiline", value: "multiline" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Checkbox", value: "checkbox" },
    { label: "Choice", value: "choice" },
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
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

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

    const newQuestions = [...questions];
    const [movedItem] = newQuestions.splice(draggedItem, 1);
    newQuestions.splice(targetIndex, 0, movedItem);

    setQuestions(newQuestions);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    if (selectedQuestionId) {
      const q = questions.find((f) => f.form_question_id === selectedQuestionId);
      setNewQuestion(q);
      setShowDrawer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestionId]);

  // Ensure options exist for dropdown/alert
  useEffect(() => {
    if (
      newQuestion.field_type === "dropdown" ||
      newQuestion.field_type === "checkbox" ||
      newQuestion.field_type === "choice"
    ) {
      setNewQuestion((prev) => ({
        ...prev,
        options:
          prev.options && prev.options.length > 0
            ? prev.options
            : [
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newQuestion.field_type]);

  const [showDrawer, setShowDrawer] = useState(false);

  const handleAddQuestion = () => {
    setNewQuestion({
      form_question_id: v4(),
      label: "",
      field_type: "short_text",
      permission: "editable",
      width: "100",
      is_required: false,
      allow_duplicate: true,
      options: [],
    });
    setSelectedQuestionId("");
    setShowDrawer(true);
  };

  const handleSaveQuestion = () => {
    if (selectedQuestionId) {
      const updated = questions.map((q) =>
        q.form_question_id === selectedQuestionId ? newQuestion : q
      );
      setQuestions(updated);
      setSelectedQuestionId("");
    } else {
      setQuestions((prev) => [...prev, { ...newQuestion }]);
      setNewQuestion({
        form_question_id: v4(),
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

  const handleDeleteQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.form_question_id !== questionId));
  };

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [
        ...(prev.options || []),
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
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.option_id !== optionId),
    }));
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedQuestionId("");
  };

  // Load form template when form_id exists
  useEffect(() => {
    if (form_id) {
      dispatch(getFormTemplateById({ form_template_id: form_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form_id]);

  // When formTemplate is loaded from redux, hydrate local state
  useEffect(() => {
    if (formTemplate && Object.keys(formTemplate).length > 0) {
      setFormTemplateName(formTemplate.template_name || "");
      setIsPublished(Boolean(formTemplate.is_publish));
      // ensure questions array exists and has correct shape
      const loadedQuestions = Array.isArray(formTemplate.questions)
        ? formTemplate.questions.map((q) => ({
            ...q,
            // ensure option arrays exist
            options: Array.isArray(q.options) ? q.options : [],
          }))
        : [];
      setQuestions(loadedQuestions.length > 0 ? loadedQuestions : questions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formTemplate]);

  // Realtime listener for saved sort order (FormSorting/<formId>)
  useEffect(() => {
    if (!form_id) return;

    const sortRef = ref(db, `FormSorting/${form_id}`);

    const unsubscribe = onValue(
      sortRef,
      (snap) => {
        const sortOrder = snap.val();

        // helper to read ids from question objects
        const getId = (q) =>
          q?.form_question_id ?? q?.id ?? q?.question_id ?? q?.key;

        // if no saved sortOrder, just keep current questions (or fallback to formTemplate.questions)
        if (!Array.isArray(sortOrder) || sortOrder.length === 0) {
          // if we have loaded formTemplate.questions prefer that, otherwise keep local questions
          const fallback =
            Array.isArray(formTemplate?.questions) && formTemplate.questions.length > 0
              ? formTemplate.questions
              : questions;
          setQuestions(Array.isArray(fallback) ? fallback : []);
          return;
        }

        // create map id -> index
        const indexMap = new Map();
        sortOrder.forEach((id, idx) => indexMap.set(id, idx));

        const originalQuestions = Array.isArray(formTemplate?.questions)
          ? formTemplate.questions
          : Array.isArray(questions)
          ? questions
          : [];

        const known = [];
        const unknown = [];

        for (let i = 0; i < originalQuestions.length; i++) {
          const q = originalQuestions[i];
          const id = getId(q);
          if (id && indexMap.has(id)) known.push(q);
          else unknown.push(q);
        }

        known.sort((a, b) => {
          const ai = indexMap.get(getId(a));
          const bi = indexMap.get(getId(b));
          return ai - bi;
        });

        const finalOrder = [...known, ...unknown];

        setQuestions(finalOrder);
      },
      (err) => {
        console.error("FormSorting listener error:", err);
        // fallback to template questions
        const fallback =
          Array.isArray(formTemplate?.questions) && formTemplate.questions.length > 0
            ? formTemplate.questions
            : questions;
        setQuestions(Array.isArray(fallback) ? fallback : []);
      }
    );

    return () => unsubscribe();
    // intentionally include form_id, formTemplate and questions so listener updates when template loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form_id, formTemplate?.questions, /* don't include questions setter to avoid loop */]);

  // Save form template (renamed keys) — update if editing, create if new
  const handleSaveFormTemplate = () => {
    const body = {
      form_template_id: formTemplate?.form_template_id || form_id || v4(),
      template_name: formTemplateName,
      user_id: user?.uid,
      is_publish: isPublished,
      company_id: currCompany?.company_id,
      questions: questions,
    };

    if (form_id || (formTemplate && formTemplate.form_template_id)) {
      // update existing
      dispatch(updateFormTemplate({ data: body, router }));
    } else {
      // fallback: create new if no id present
      dispatch(createFormTemplate({ data: body, router }));
    }
  };

  // preview — reflect draft or editing question immediately
  const previewQuestions = React.useMemo(() => {
    if (!showDrawer) return questions;
    if (selectedQuestionId) {
      return questions.map((q) =>
        q.form_question_id === selectedQuestionId ? newQuestion : q
      );
    }
    return [...questions, { ...newQuestion, _isDraft: true }];
  }, [questions, showDrawer, selectedQuestionId, newQuestion]);

  return (
    <div className="form-template-container">
      {/* Top Card */}
      <div className="top-card">
        <div className="group-name-input">
          <PlainTextField
            type={"text"}
            placeholder="Form Template Name"
            value={formTemplateName}
            onChange={(val) => setFormTemplateName(val)}
          />
          <div
            className="publish-toggle"
            role="group"
            aria-label="Publish toggle"
          >
            <label style={{ marginRight: 8, fontSize: 13, color: "#444" }}>
              Publish
            </label>
            <SwitchField
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </div>
        </div>

        <div className="top-actions">
          <ActionButton
            type="outlined"
            label={"Back"}
            onClick={() => {
              router.push("/form/form-template/form-template-list");
            }}
          />
          <ActionButton
            type="primary"
            label={"+ Add Question"}
            onClick={handleAddQuestion}
          />
          <ActionButton
            type="primary"
            label={"Save Template"}
            onClick={handleSaveFormTemplate}
          />
        </div>
      </div>

      {/* Main / Preview */}
      <div className="bottom-card">
        <div className="fields-container">
          {/* Render preview as form-like UI */}
          {previewQuestions.map((q, index) => {
            const isDragging = index === draggedItem;
            const isDragOver = index === dragOverIndex;
            return (
              <div
                key={q.form_question_id}
                className={`field-item ${isDragging ? "dragging" : ""} ${
                  isDragOver ? "drag-over" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => {
                  if (!q._isDraft) {
                    setSelectedQuestionId(q.form_question_id);
                    setShowDrawer(true);
                  } else {
                    // open draft in editor
                    setSelectedQuestionId("");
                    setNewQuestion(q);
                    setShowDrawer(true);
                  }
                }}
                style={{ width: `${q.width ? q.width - 4 : 96}%` }}
              >
                <div className="drag-handle" title="Drag to reorder">
                  ⋮⋮
                </div>
                <div className="field-input-container">
                  <div className="text-box">
                    {q.label || (q._isDraft ? "(Draft question)" : "Untitled")}
                  </div>

                  {/* Form-like sample control based on type */}
                  <div className="preview-control">
                    {q.field_type === "short_text" && (
                      <input
                        className="reusable-input"
                        placeholder="Short answer"
                        disabled
                      />
                    )}
                    {q.field_type === "multiline" && (
                      <textarea
                        className="reusable-input"
                        placeholder="Long answer"
                        disabled
                      />
                    )}
                    {q.field_type === "date" && (
                      <input className="reusable-input" type="date" disabled />
                    )}
                    {q.field_type === "number" && (
                      <input
                        className="reusable-input"
                        type="number"
                        placeholder="0"
                        disabled
                      />
                    )}
                    {q.field_type === "dropdown" && (
                      <select className="reusable-input" disabled>
                        {(q.options || []).length > 0 ? (
                          q.options.map((opt) => (
                            <option key={opt.option_id} value={opt.value}>
                              {opt.value || "Option"}
                            </option>
                          ))
                        ) : (
                          <option>Option</option>
                        )}
                      </select>
                    )}
                    {q.field_type === "checkbox" && (
                      <div className="checkbox-group" aria-disabled="true">
                        {(q.options || []).length > 0 ? (
                          q.options.map((opt) => (
                            <label
                              key={opt.option_id}
                              className="preview-checkbox-label"
                            >
                              <input
                                type="checkbox"
                                disabled
                                aria-label={opt.value || "Option"}
                              />
                              <span className="preview-checkbox-text">
                                {opt.value || "Option"}
                              </span>
                            </label>
                          ))
                        ) : (
                          <label className="preview-checkbox-label">
                            <input type="checkbox" disabled />
                            <span className="preview-checkbox-text">
                              Option
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                    {q.field_type === "choice" && (
                      <div
                        className="radio-group"
                        role="radiogroup"
                        aria-disabled="true"
                      >
                        {(q.options || []).length > 0 ? (
                          q.options.map((opt) => (
                            <label
                              key={opt.option_id}
                              className="preview-radio-label"
                            >
                              <input
                                type="radio"
                                name={`radio-${q.form_question_id}`}
                                disabled
                                aria-label={opt.value || "Option"}
                              />
                              <span className="preview-radio-text">
                                {opt.value || "Option"}
                              </span>
                            </label>
                          ))
                        ) : (
                          <label className="preview-radio-label">
                            <input
                              type="radio"
                              name={`radio-${q.form_question_id}`}
                              disabled
                            />
                            <span className="preview-radio-text">Option</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {!q.is_system && !q._isDraft ? (
                    <div
                      className="delete-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(q.form_question_id);
                      }}
                    >
                      <FaTrash size={10} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <button className="add-field-button" onClick={handleAddQuestion}>
          + Add Question
        </button>
      </div>

      {/* Drawer (kept same as your original) */}
      {showDrawer && (
        <>
          <div className="drawer-overlay" onClick={handleCloseDrawer} />
          <div className="drawer">
            <div className="drawer-header">
              <h2>{selectedQuestionId ? "Edit Question" : "Add Question"}</h2>
              <button className="close-button" onClick={handleCloseDrawer}>
                ×
              </button>
            </div>

            <div className="drawer-content">
              <div className="form-section">
                <div className="input-group">
                  <label>Name</label>
                  <PlainTextField
                    disable={newQuestion.is_system}
                    type={"text"}
                    value={newQuestion.label}
                    placeholder="Enter question text"
                    onChange={(value) =>
                      setNewQuestion((prev) => ({ ...prev, label: value }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Field Type</label>
                  <DropdownField
                    value={newQuestion.field_type}
                    onChange={(value) =>
                      setNewQuestion((prev) => ({ ...prev, field_type: value }))
                    }
                    dropdownList={fieldTypes}
                  />
                </div>

                <div className="input-group">
                  <label>Permission</label>
                  <DropdownField
                    value={newQuestion.permission}
                    onChange={(value) =>
                      setNewQuestion((prev) => ({ ...prev, permission: value }))
                    }
                    dropdownList={permissions}
                  />
                </div>

                <div className="input-group">
                  <label>Width</label>
                  <DropdownField
                    value={newQuestion.width}
                    onChange={(value) =>
                      setNewQuestion((prev) => ({ ...prev, width: value }))
                    }
                    dropdownList={widths}
                  />
                </div>

                <div className="input-group row-layout">
                  <label>Required</label>
                  <SwitchField
                    checked={newQuestion.is_required}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        is_required: e.target.checked,
                      }))
                    }
                  />
                </div>

                <div className="input-group row-layout">
                  <label>Allow Duplicate</label>
                  <SwitchField
                    checked={newQuestion.allow_duplicate}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        allow_duplicate: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Options for dropdown / alert */}
              {(newQuestion.field_type === "dropdown" ||
                newQuestion.field_type === "checkbox" ||
                newQuestion.field_type === "choice") && (
                <>
                  <div className="divider" />
                  <div className="form-section">
                    <h3>Options</h3>
                    <div className="options-container">
                      {newQuestion?.options?.map((option) => (
                        <div key={option.option_id} className="option-item">
                          <div className="drag-handle">⋮⋮</div>
                          <div className="color-pickers">
                            <InputColor
                              placeholder={"Text Color"}
                              value={option.color}
                              onChange={(value) => {
                                const updatedOptions =
                                  newQuestion?.options?.map((opt) =>
                                    opt.option_id === option.option_id
                                      ? { ...opt, color: value }
                                      : opt
                                  );
                                setNewQuestion((prev) => ({
                                  ...prev,
                                  options: updatedOptions,
                                }));
                              }}
                            />
                            <InputColor
                              placeholder={"Background Color"}
                              value={option.fillColor}
                              onChange={(value) => {
                                const updatedOptions =
                                  newQuestion?.options?.map((opt) =>
                                    opt.option_id === option.option_id
                                      ? { ...opt, fillColor: value }
                                      : opt
                                  );
                                setNewQuestion((prev) => ({
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
                                const updatedOptions =
                                  newQuestion?.options?.map((opt) =>
                                    opt.option_id === option.option_id
                                      ? { ...opt, value }
                                      : opt
                                  );
                                setNewQuestion((prev) => ({
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
                onClick={handleCloseDrawer}
              />
              <ActionButton
                type="primary"
                label={"Save"}
                onClick={handleSaveQuestion}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
