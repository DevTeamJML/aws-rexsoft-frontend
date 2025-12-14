import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { onValue, ref as dbRef } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import moment from "moment";

import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";

import { useSelectUser } from "../../../../../redux/slices/authSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
} from "../../../../../redux/slices/companySlice";

import {
  getFormSubmissionById,
  updateFormSubmission,
  useSelectTargetedFormSubmissionData,
} from "../../../../../redux/slices/formSubmissionSlice";

export default function FormSubmissionCreateEdit() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { form_submission_id } = router.query;
  const submission = useSelectTargetedFormSubmissionData();
  const allCompanyUsers = useSelectAllCompanyUsers();

  const user = useSelectUser();
  const company_id = useSelectCurrCompanyId();

  const [questions, setQuestions] = useState([]);
  const [sortingArray, setSortingArray] = useState(null);
  const [formData, setFormData] = useState({});
  const [originalAnswers, setOriginalAnswers] = useState(null); // ⭐ NEW
  const [formErrors, setFormErrors] = useState({});

  /* ---------------------------------------------------
     LOAD SUBMISSION
  --------------------------------------------------- */
  useEffect(() => {
    if (form_submission_id) {
      dispatch(getFormSubmissionById({ form_submission_id }));
    }
  }, [form_submission_id]);

  /* ---------------------------------------------------
     INITIALIZE ANSWERS + SNAPSHOT ORIGINAL ANSWERS
  --------------------------------------------------- */
  useEffect(() => {
    if (!submission?.questions) return;

    const init = {};
    submission.questions.forEach((q) => {
      if (["dropdown", "checkbox"].includes(q.field_type))
        init[q.form_question_id] = [];
      else init[q.form_question_id] = "";
    });

    if (submission?.form_answers) {
      submission.form_answers.forEach((ans) => {
        const q = submission.questions.find(
          (x) => x.form_question_id === ans.form_question_id
        );
        if (!q) return;

        if (["dropdown", "checkbox"].includes(q.field_type)) {
          try {
            init[q.form_question_id] = JSON.parse(ans.answer || "[]");
          } catch {
            init[q.form_question_id] = [];
          }
        } else {
          init[q.form_question_id] = ans.answer;
        }
      });
    }

    setOriginalAnswers(JSON.parse(JSON.stringify(init)));

    setFormData(init);
    setQuestions(submission.questions);
  }, [submission]);

 
  // Load sorting
  useEffect(() => {
    if (!submission?.template?.form_template_id) return;

    const sortRef = dbRef(
      db,
      `FormSorting/${submission.template.form_template_id}`
    );
    const unsub = onValue(sortRef, (snap) => {
      const arr = snap.val();
      setSortingArray(Array.isArray(arr) ? arr : null);
    });

    return () => unsub();
  }, [submission?.template?.form_template_id]);


  // Apply sorting
  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    if (!sortingArray) return questions;

    const idMap = new Map();
    sortingArray.forEach((id, idx) => idMap.set(id, idx));

    const known = [];
    const unknown = [];
    questions.forEach((q) =>
      (idMap.has(q.form_question_id) ? known : unknown).push(q)
    );

    known.sort(
      (a, b) => idMap.get(a.form_question_id) - idMap.get(b.form_question_id)
    );

    return [...known, ...unknown];
  }, [questions, sortingArray]);


  // validation for form
  const validate = () => {
    const errors = {};

    sortedQuestions.forEach((q) => {
      if (q.permission === "not_viewable") return;

      const value = formData[q.form_question_id];

      const empty =
        (Array.isArray(value) && value.length === 0) ||
        (!Array.isArray(value) && String(value).trim() === "");

      if (q.is_required && empty) {
        errors[q.form_question_id] = "Required";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // update field
  const updateField = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };


  // submit field
  const handleSubmit = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const submission_id = form_submission_id;

    const answers = sortedQuestions.map((q) => ({
      form_answer_id:
        submission?.form_answers?.find(
          (a) => a.form_question_id === q.form_question_id
        )?.form_answer_id || v4(),
      form_submission_id: submission_id,
      form_question_id: q.form_question_id,
      user_id: user.uid,
      answer: Array.isArray(formData[q.form_question_id])
        ? JSON.stringify(formData[q.form_question_id])
        : formData[q.form_question_id],
    }));


    // status
    let newStatus = submission.status;
    let approvedBy = submission.approved_by;
    let approvedAt = submission.approved_at;
    let previousAnswers = null;

    if (submission.status === "Approved") {
      newStatus = "Resubmission";
      approvedBy = null;
      approvedAt = null;
    }

    if (submission.status === "Rejected") {
      newStatus = "Resubmission";
      previousAnswers = JSON.stringify(originalAnswers);
    }

    const payload = {
      form_submission_id: submission_id,
      form_template_id: submission.template.form_template_id,
      company_id: submission.company_id || company_id,
      user_id: user.uid,
      form_tracking_id: submission.form_tracking_id,

      status: newStatus,
      resubmit_at:
        newStatus === "Resubmission"
          ? moment().format("YYYY-MM-DD HH:mm:ss")
          : null,

      approved_by: approvedBy,
      approved_at: approvedAt,

      previous_answers: previousAnswers,

      answers,
    };

    dispatch(updateFormSubmission({ data: payload, router }));
  };


  return (
    <div className="form-submission-container">
      <div className="form-card">
       
       {/* Banner Rejection */}
        {submission?.status === "Rejected" && (
          <div className="reject-banner">
            <h3 className="text-red-600 font-bold">This form was rejected</h3>
            <p>
              <strong>Reason:</strong> {submission.rejected_reason}
            </p>

            <p>
              <strong>Rejected By:</strong>{" "}
              {
                allCompanyUsers.find(
                  (u) => u.user_id === submission.rejected_by
                )?.first_name
              }{" "}
              {
                allCompanyUsers.find(
                  (u) => u.user_id === submission.rejected_by
                )?.last_name
              }
            </p>

            <p>
              <strong>Rejected At:</strong>{" "}
              {moment(submission.rejected_at).format("YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>
        )}

        {/* FORM HEADER */}
        <div className="form-header">
          <h1>{submission?.template?.template_name}</h1>
        </div>

        {Object.keys(formErrors).length > 0 && (
          <div className="form-errors">Please fix the highlighted fields.</div>
        )}

        {/* FORM FIELDS */}
        <div className="form-grid">
          {sortedQuestions.map((q) => {
            if (q.permission === "not_viewable") return null;

            const currentValue = formData[q.form_question_id];
            const prevVal =
              submission?.previous_answers?.[q.form_question_id] ?? null;

            return (
              <div
                key={q.form_question_id}
                className="form-field"
                style={{ width: `${q.width - 4}%` }}
              >
                <label>
                  {q.label}
                  {q.is_required ? <span className="required">*</span> : null}
                </label>

                {/* Current Editable Field */}
                <RenderField
                  question={q}
                  value={currentValue}
                  onChange={(val) => updateField(q.form_question_id, val)}
                  disabled={q.permission === "view_only"}
                />

                {/* Previous Answer (Only for Resubmission flows) */}
                {prevVal !== null && (
                  <div className="previous-answer-inline">
                    <strong>Previous:</strong>{" "}
                    {Array.isArray(prevVal) ? prevVal.join(", ") : prevVal}
                  </div>
                )}

                {/* Field Error */}
                {formErrors[q.form_question_id] && (
                  <div className="field-error">
                    {formErrors[q.form_question_id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <ActionButton
            type="outlined"
            label="Cancel"
            onClick={() => router.back()}
          />
          <ActionButton type="primary" label="Update" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

/* FIELD RENDERER */
function RenderField({ question, value, onChange, disabled }) {
  const opts = Array.isArray(question.options)
    ? question.options
    : JSON.parse(question.options || "[]");

  switch (question.field_type) {
    case "short_text":
      return (
        <PlainTextField value={value} disable={disabled} onChange={onChange} />
      );

    case "multiline":
      return (
        <textarea
          className="input-multiline"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          type="number"
          disabled={disabled}
          className="input-text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "date":
      return (
        <input
          type="date"
          disabled={disabled}
          className="input-text"
          value={value}
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
                  if (e.target.checked) onChange([...value, o.option_id]);
                  else onChange(value.filter((id) => id !== o.option_id));
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
          options={opts.map((o) => ({ label: o.value, value: o.option_id }))}
          onChange={(id) => onChange([...value, id])}
          onRemove={(id) => onChange(value.filter((v) => v !== id))}
        />
      );

    default:
      return <div>Unsupported field</div>;
  }
}
