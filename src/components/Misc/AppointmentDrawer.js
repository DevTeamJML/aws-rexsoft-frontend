"use client";
import React, { useEffect, useState } from "react";
import MultiSelectDropdownField from "../FormComponents/MultiSelectDropdownField";
import { PlainTextField } from "../FormComponents/PlainTextField";
import { MultilineField } from "../FormComponents/MultilineField";
import { DateField } from "../FormComponents/DateField";
import { ChromePicker } from "react-color";
import AsyncMultiSelect from "../FormComponents/AsyncMultiSelect";
import AsyncMultiSelectSimple from "../FormComponents/AsyncMultiSelect";
import { ApiRoute } from "@/enums/api-route";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
// adjust path if your exports are separate files, e.g.:
// import { PlainTextField } from "../FormComponents/PlainTextField";
// import { MultilineField } from "../FormComponents/MultilineField";
// import { DateField } from "../FormComponents/DateField";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSave: (eventObj, isEdit) => void
 * - initial: event-like object to prefill the form (or null)
 * - memberOptions, clientOptions: arrays for MultiSelect
 */
export default function AppointmentDrawer({
  open,
  onClose,
  onSave,
  initial = null,
  memberOptions = [],
  clientOptions = [],
  canManageAppointment,
}) {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    venue: "",
    description: "",
    color: "",
    members: [],
    clients: [],
  });

  const currCompanyId = useSelectCurrCompanyId();

  useEffect(() => {
    if (initial) {
      // convert Date -> local input string (datetime-local)
      const toLocalInput = (d) => {
        if (!d) return "";
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d - tzOffset).toISOString().slice(0, 16);
      };

      setForm({
        title: initial.title || "",
        start: toLocalInput(initial.start),
        end: toLocalInput(initial.end),
        venue: initial.venue || "",
        description: initial.description || "",
        color: initial.color,
        members: initial.members ? initial.members.map((m) => m.user_id) : [],
        clients: initial.clients
          ? initial.clients.map((c) => {
              return { label: c.client_name, value: c.client_id };
            })
          : [],
      });
    } else {
      setForm({
        title: "",
        start: "",
        end: "",
        venue: "",
        color: "",
        description: "",
        members: [],
        clients: [],
      });
    }
  }, [initial, open]);

  // MultiSelect handlers
  const handleMemberSelect = (value) =>
    setForm((f) => ({
      ...f,
      members: f.members.includes(value)
        ? f.members.filter((m) => m !== value)
        : [...f.members, value],
    }));
  const handleMemberRemove = (value) =>
    setForm((f) => ({ ...f, members: f.members.filter((m) => m !== value) }));

  const handleClientSelect = (value) =>
    setForm((f) => ({
      ...f,
      clients: f.clients.includes(value)
        ? f.clients.filter((c) => c !== value)
        : [...f.clients, value],
    }));
  const handleClientRemove = (value) =>
    setForm((f) => ({ ...f, clients: f.clients.filter((c) => c !== value) }));

  // Convert datetime-local string -> Date
  const fromDateTimeLocal = (value) => (value ? new Date(value) : null);

  function handleSubmit(e) {
    e.preventDefault();
    const start = fromDateTimeLocal(form.start);
    const end = fromDateTimeLocal(form.end);
    if (!form.title || !start || !end || start >= end) {
      alert("Please enter a valid title, start and end time (start < end).");
      return;
    }

    const payload = {
      ...initial,
      title: form.title,
      start,
      end,
      venue: form.venue,
      color: form.color,
      description: form.description,
      members: form.members.slice(),
      clients: form.clients.slice(),
    };

    onSave(payload, isEdit);
    onClose();
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`appointment-drawer open`}>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawerHeader">
          <h3>{isEdit ? "Edit Appointment" : "Create Appointment"}</h3>
          <button className="drawerClose" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawerContent">
          <form onSubmit={handleSubmit} className="drawerForm">
            {/* Title */}
            <PlainTextField
              placeholder="Title"
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
            />

            {/* Start / End as datetime-local using PlainTextField */}

            <DateField
              placeholder="Start"
              type="datetime-local"
              value={form.start}
              onChange={(v) => setForm((f) => ({ ...f, start: v }))}
            />
            <DateField
              placeholder="End"
              type="datetime-local"
              value={form.end}
              onChange={(v) => setForm((f) => ({ ...f, end: v }))}
            />

            {/* Venue */}
            <PlainTextField
              placeholder="Venue"
              value={form.venue}
              onChange={(v) => setForm((f) => ({ ...f, venue: v }))}
            />

            {/* Description multiline */}
            <MultilineField
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              rows={4}
              placeholder="Notes, agenda, etc."
            />

            <div style={{ width: "100%" }}>
              <ChromePicker
                color={form.color}
                onChange={(col) => setForm((f) => ({ ...f, color: col.hex }))}
                styles={{
                  default: {
                    picker: {
                      width: "100%",
                      padding: "4px",
                    },
                    saturation: {
                      width: "100%",
                      paddingBottom: "25%",
                    },
                    hue: {
                      height: "8px",
                    },
                    alpha: {
                      height: "8px",
                    },
                    body: {
                      padding: "4px",
                    },
                  },
                }}
              />
            </div>
            <div className="drawerRow">
              <div className="attendee-block">
                <div className="attendee-head">Members</div>
                <MultiSelectDropdownField
                  selected={form.members}
                  options={memberOptions}
                  placeholder="Add members..."
                  onChange={handleMemberSelect}
                  onRemove={handleMemberRemove}
                  width="100%"
                />
              </div>

              <div className="attendee-block">
                <div className="attendee-head">Clients</div>
                {/* <MultiSelectDropdownField
                  selected={form.clients}
                  options={clientOptions}
                  placeholder="Add clients..."
                  onChange={handleClientSelect}
                  onRemove={handleClientRemove}
                  width="100%"
                /> */}
                <AsyncMultiSelectSimple
                  companyId={currCompanyId}
                  loadUrl={ApiRoute.appointment.searchClientListInAppointment}
                  value={form.clients}
                  onChange={(opts) =>
                    setForm((f) => ({ ...f, clients: opts || [] }))
                  }
                  placeholder="Search clients..."
                  defaultOptions={false}
                />
              </div>
            </div>

            <div className="drawerActions">
              {canManageAppointment ? (
                <button type="submit" className="btn primary">
                  {isEdit ? "Save changes" : "Create appointment"}
                </button>
              ) : null}

              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
