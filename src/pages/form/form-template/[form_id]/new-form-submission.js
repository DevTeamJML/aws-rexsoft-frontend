import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { onValue, ref as dbRef } from "firebase/database";
import { db } from "@/config/firebaseConfig";

import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { useSelectCurrCompanyId } from "../../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../../redux/slices/authSlice";
import {
  getFormTemplateById,
  useSelectCurrTemplate,
} from "../../../../../redux/slices/formTemplateSlice";
import { createFormSubmission } from "../../../../../redux/slices/formSubmissionSlice";

export default function FormSubmissionCreate() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { form_id } = router.query;
  const template = useSelectCurrTemplate();
  const user = useSelectUser();
  const company_id = useSelectCurrCompanyId();

  const [questions, setQuestions] = useState([]);
  const [sortingArray, setSortingArray] = useState(null);

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Load template
  useEffect(() => {
    if (!form_id) return;
    dispatch(getFormTemplateById({ form_template_id: form_id }));
  }, [form_id]);

  // Initialize form data when template loads
  useEffect(() => {
    if (!template?.questions) return;

    const init = {};
    template.questions.forEach((q) => {
      if (q.field_type === "dropdown" || q.field_type === "checkbox") {
        init[q.form_question_id] = []; // array of option_id
      } else if (q.field_type === "choice") {
        init[q.form_question_id] = ""; // option_id
      } else {
        init[q.form_question_id] = ""; // text/date/number/multiline
      }
    });

    setFormData(init);
    setQuestions(template.questions);
  }, [template]);

  // Sorting listener (FormSorting/<templateId>)
  useEffect(() => {
    if (!form_id) return;

    const sortRef = dbRef(db, `FormSorting/${form_id}`);
    const unsub = onValue(sortRef, (snap) => {
      const arr = snap.val();
      setSortingArray(Array.isArray(arr) ? arr : null);
    });

    return () => unsub();
  }, [form_id]);

  // Apply sorting
  const sortedQuestions = useMemo(() => {
    if (!questions) return [];

    if (!sortingArray || sortingArray.length === 0) return questions;

    const idMap = new Map();
    sortingArray.forEach((id, i) => idMap.set(id, i));

    const known = [];
    const unknown = [];

    questions.forEach((q) => {
      if (idMap.has(q.form_question_id)) known.push(q);
      else unknown.push(q);
    });

    known.sort(
      (a, b) => idMap.get(a.form_question_id) - idMap.get(b.form_question_id)
    );

    return [...known, ...unknown];
  }, [questions, sortingArray]);

  // Validation
  const validate = () => {
    const errors = {};

    sortedQuestions.forEach((q) => {
      if (q.permission === "not_viewable") return;

      const value = formData[q.form_question_id];

      if (q.is_required) {
        if (Array.isArray(value) && value.length === 0) {
          errors[q.form_question_id] = "Required";
        } else if (!Array.isArray(value) && `${value}`.trim() === "") {
          errors[q.form_question_id] = "Required";
        }
      }
    });

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // Field input handlers
  const updateField = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  function generateTrackingId(templateName = "") {
    if (!templateName) return "XX000000";

    // Split into words and take first letter of each
    const prefix = templateName
      .trim()
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("");

    // Random 6-digit number (100000–999999)
    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    return `${prefix}${randomNumber}`;
  }

  // Submit handler
  const handleSubmit = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const form_submission_id = v4();

    const answers = sortedQuestions.map((q) => ({
      form_answer_id: v4(),
      form_submission_id,
      form_question_id: q.form_question_id,
      user_id: user?.uid,
      answer: Array.isArray(formData[q.form_question_id])
        ? JSON.stringify(formData[q.form_question_id]) // dropdown/checkbox
        : formData[q.form_question_id], // text/date/number/choice
    }));

    const tracking_id = generateTrackingId(template?.template_name);
    const payload = {
      form_submission_id,
      company_id: company_id,
      form_template_id: form_id,
      form_tracking_id: tracking_id,
      user_id: user?.uid,
      company_id,
      answers,
    };

    dispatch(createFormSubmission({ data: payload, router }));
  };

  return (
    <div className="form-submission-container">
      <div className="form-card">
        <div className="form-header">
          <h1>{template?.template_name}</h1>
        </div>

        {Object.keys(formErrors).length > 0 && (
          <div className="form-errors">Please fix the highlighted fields.</div>
        )}

        <div className="form-grid">
          {sortedQuestions.map((q) => {
            if (q.permission === "not_viewable") return null;

            const width = `${q.width - 4}%`; // consistent with your template UI

            return (
              <div
                key={q.form_question_id}
                className="form-field"
                style={{ width }}
              >
                <label>
                  {q.label}
                  {q.is_required ? <span className="required">*</span> : null}
                </label>

                <RenderField
                  question={q}
                  value={formData[q.form_question_id]}
                  onChange={(val) => updateField(q.form_question_id, val)}
                  disabled={q.permission === "view_only"}
                />

                {formErrors[q.form_question_id] && (
                  <div className="field-error">
                    {formErrors[q.form_question_id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="form-actions">
          <ActionButton
            type="outlined"
            label="Cancel"
            onClick={() => router.back()}
          />
          <ActionButton type="primary" label="Submit" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

function RenderField({ question, value, onChange, disabled }) {
  const opts = Array.isArray(question.options)
    ? question.options
    : JSON.parse(question.options || "[]");

  switch (question.field_type) {
    case "short_text":
      return (
        <PlainTextField
          value={value}
          disable={disabled}
          onChange={(v) => onChange(v)}
        />
      );

    case "multiline":
      return (
        <textarea
          className="input-multiline"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text..."
        />
      );

    case "number":
      return (
        <input
          type="number"
          disabled={disabled}
          value={value}
          className="input-text"
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "date":
      return (
        <input
          type="date"
          disabled={disabled}
          value={value}
          className="input-text"
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "choice":
      return (
        <div className="choice-group">
          {opts.map((o) => (
            <label key={o.option_id} className="choice-option">
              <input
                type="radio"
                name={question.form_question_id}
                disabled={disabled}
                checked={value === o.option_id}
                onChange={() => onChange(o.option_id)}
              />
              {o.value}
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <div className="checkbox-group">
          {opts.map((o) => (
            <label key={o.option_id} className="checkbox-option">
              <input
                type="checkbox"
                disabled={disabled}
                checked={value.includes(o.option_id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...value, o.option_id]);
                  } else {
                    onChange(value.filter((id) => id !== o.option_id));
                  }
                }}
              />
              {o.value}
            </label>
          ))}
        </div>
      );

    case "dropdown":
      return (
        <MultiSelectDropdownField
          selected={value}
          options={opts.map((o) => ({
            label: o.value,
            value: o.option_id,
          }))}
          onChange={(option_id) => onChange([...value, option_id])}
          onRemove={(option_id) =>
            onChange(value.filter((id) => id !== option_id))
          }
        />
      );

    default:
      return <div>Unsupported field type</div>;
  }
}
