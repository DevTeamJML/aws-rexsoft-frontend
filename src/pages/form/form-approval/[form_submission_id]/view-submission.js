import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

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
import { updateFormSubmissionApproval } from "../../../../../redux/slices/formApprovalSlice";
import moment from "moment";

export default function ViewFormSubmission() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { form_submission_id } = router.query;
  const submission = useSelectTargetedFormSubmissionData();

  const user = useSelectUser();
  const company_id = useSelectCurrCompanyId();
  const allCompanyUsers = useSelectAllCompanyUsers();

  const [formData, setFormData] = useState({});
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectedReason, setRejectedReason] = useState("");

  useEffect(() => {
    if (form_submission_id)
      dispatch(getFormSubmissionById({ form_submission_id }));
  }, [form_submission_id]);

  /* Read only format */
  useEffect(() => {
    if (!submission?.questions) return;

    const init = {};
    submission.questions.forEach((q) => (init[q.form_question_id] = ""));

    if (submission?.form_answers) {
      submission.form_answers.forEach((ans) => {
        const q = submission.questions.find(
          (qq) => qq.form_question_id === ans.form_question_id
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

    setFormData(init);
  }, [submission]);

  // Approval
  const handleApprove = () => {
    const payload = {
      form_submission_id,
      status: "Approved",
      approved_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      approved_by: user?.uid,
      company_id,
    };

    dispatch(updateFormSubmissionApproval({ data: payload, router }));
  };

  // Reject
  const handleRejectSubmit = () => {
    if (!rejectedReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }

    const payload = {
      form_submission_id,
      status: "Rejected",
      rejected_reason: rejectedReason,
      rejected_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      rejected_by: user?.uid,
      company_id,
    };

    dispatch(updateFormSubmissionApproval({ data: payload, router }));
  };

  const questions = submission?.questions || [];

  return (
    <div className="form-submission-container">
      <div className="form-card">
        {submission?.status === "Rejected" ? (
          <div className="reject-banner">
            <h3 className="text-red-600 font-bold">This form was rejected</h3>
            <p>
              <strong>Reason:</strong> {submission.rejected_reason}
            </p>
            <p>
              <strong>Rejected By:</strong>{" "}
              {allCompanyUsers.find((u) => u.user_id === submission.rejected_by)
                ? `${
                    allCompanyUsers.find(
                      (u) => u.user_id === submission.rejected_by
                    ).first_name
                  } ${
                    allCompanyUsers.find(
                      (u) => u.user_id === submission.rejected_by
                    ).last_name
                  }`
                : "-"}
            </p>
            <p>
              <strong>Rejected At:</strong>{" "}
              {moment(submission.rejected_at).format("YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>
        ) : null}
        <div className="form-header mb-3">
          <h1>Review Submission — {submission?.template?.template_name}</h1>
        </div>


        {/* Field render */}
        <div className="form-grid">
          {questions.map((q) => {
            const curr = formData[q.form_question_id];
            const prev =
              submission?.previous_answers && submission?.previous_answers[q.form_question_id]
                ? submission?.previous_answers[q.form_question_id]
                : null;

            return (
              <div
                key={q.form_question_id}
                className="form-field"
                style={{ width: `${q.width - 4}%` }}
              >
                <label>{q.label}</label>

                {/* CURRENT VALUE */}
                <ReadonlyField question={q} value={curr} />

                {/* PREVIOUS ANSWER (IF EXISTS) */}
                {prev !== null && (
                  <div className="previous-answer-inline mt-1">
                    <strong>Previous:</strong>{" "}
                    {Array.isArray(prev) ? prev.join(", ") : prev}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* REJECT BANNER */}
        {showRejectBox && (
          <div className="reject-box mt-4">
            <label className="font-bold">Rejection Reason *</label>
            <textarea
              className="input-multiline"
              placeholder="Enter reason for rejection..."
              rows={4}
              value={rejectedReason}
              onChange={(e) => setRejectedReason(e.target.value)}
            />

            <div className="reject-actions">
              <ActionButton
                type="primary"
                label="Submit Rejection"
                onClick={handleRejectSubmit}
              />

              <ActionButton
                type="outlined"
                label="Cancel"
                onClick={() => setShowRejectBox(false)}
              />
            </div>
          </div>
        )}

       {/* Actions when not rejecting */}
        {!showRejectBox && (
          <div className="form-actions mt-4">
            <ActionButton
              type="outlined"
              label="Back"
              onClick={() => router.back()}
            />

            {submission?.status !== "Approved" &&
            submission?.status !== "Rejected" ? (
              <Fragment>
                <ActionButton
                  type="danger"
                  label="Reject"
                  onClick={() => setShowRejectBox(true)}
                />
                <ActionButton
                  type="primary"
                  label="Approve"
                  onClick={handleApprove}
                />{" "}
              </Fragment>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function ReadonlyField({ question, value }) {
  const opts = Array.isArray(question.options)
    ? question.options
    : JSON.parse(question.options || "[]");

  // ---------- TEXT FIELDS ----------
  if (
    [
      "short_text",
      "multiline",
      "number",
      "date",
      "choice-single",
      "text",
    ].includes(question.field_type)
  ) {
    return (
      <input
        className="input-text bg-gray-200"
        disabled
        value={value || ""}
        readOnly
      />
    );
  }

  // ---------- MULTI SELECT ----------
  if (question.field_type === "dropdown") {
    const labels = (value || [])
      .map((id) => opts.find((o) => o.option_id === id)?.value)
      .filter(Boolean);

    return (
      <div className="bg-gray-200 p-2 rounded text-sm">
        {labels.length ? labels.join(", ") : "-"}
      </div>
    );
  }

  // ---------- CHECKBOX ----------
  if (question.field_type === "checkbox") {
    return (
      <div className="checkbox-group">
        {opts.map((o) => (
          <div key={o.option_id}>
            <input
              type="checkbox"
              disabled
              checked={Array.isArray(value) && value.includes(o.option_id)}
            />{" "}
            {o.value}
          </div>
        ))}
      </div>
    );
  }

  // ---------- CHOICE (RADIO) ----------
  if (question.field_type === "choice") {
    return (
      <div className="choice-group">
        {opts.map((o) => (
          <div key={o.option_id}>
            <input type="radio" disabled checked={value === o.option_id} />{" "}
            {o.value}
          </div>
        ))}
      </div>
    );
  }

  return <div>-</div>;
}
