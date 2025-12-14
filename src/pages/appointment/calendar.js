"use client";
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AppointmentDrawer from "@/components/Misc/AppointmentDrawer";
import moment from "moment";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  updateAppointment,
  useSelectAppointments,
} from "../../../redux/slices/appointmentSlice";
import { useDispatch } from "react-redux";
import { useSelectUser } from "../../../redux/slices/authSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../../redux/slices/companySlice";
import { v4 } from "uuid";
import { useSelectUserPermissions } from "../../../redux/slices/roleAuthSlice";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

function namesFromIds(type, ids = [], lookup = []) {
  if (!ids || !ids.length) return [];
  if (type === "member") {
    const map = new Map(lookup.map((l) => [String(l.user_id), l.first_name]));
    return ids.map((id) => map.get(String(id.user_id)) || id.user_id);
  }

  if (type === "client") {
    return ids.map((id) => id.client_name);
  }
}

export default function AppointmentPage() {
  const allUsers = useSelectAllCompanyUsers();
  const memberOptions = allUsers.map((m) => ({
    value: m.user_id,
    label: m.first_name + " " + m.last_name,
  }));

  const dispatch = useDispatch();
  const user = useSelectUser();
  const currCompanyId = useSelectCurrCompanyId();
  const appointments = useSelectAppointments();
  const isAdmin = useSelectIsAdmin();
  const userPermissions = useSelectUserPermissions();
  const canManageAppointment =
    isAdmin || userPermissions.includes("manage_appointment");

  // events store start/end as moment-formatted strings: "YYYY-MM-DD HH:mm:ss"
  const [events, setEvents] = useState([
    // {
    //   id: 1,
    //   title: "Initial Meeting",
    //   start: moment().format("YYYY-MM-DD HH:mm:ss"),
    //   end: moment().add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
    //   color: "#60A5FA",
    //   members: ["m1", "m2", "m3"],
    //   clients: ["c1"],
    //   venue: "Main Office",
    //   description: "Kickoff meeting",
    // },
  ]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setEvents(appointments);
    }
  }, [appointments]);

  useEffect(() => {
    if (currCompanyId && user) {
      dispatch(
        getAppointment({
          isAdmin: isAdmin,
          company_id: currCompanyId,
          user_id: user?.uid,
        })
      );
    }

    if (currCompanyId) {
      // dispatch(getAllClients)
    }
  }, [currCompanyId, user]);

  // drawer UI state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitial, setDrawerInitial] = useState(null);

  // convert stored events -> calendar-friendly events with Date objects
  const calendarEvents = events.map((ev) => ({
    ...ev,
    // if the stored value is already a Date-like string, parse with moment and convert to Date
    start: moment(ev.start, "YYYY-MM-DD HH:mm:ss").toDate(),
    end: moment(ev.end, "YYYY-MM-DD HH:mm:ss").toDate(),
  }));

  // create button opens drawer for new appointment
  const openCreate = () => {
    setDrawerInitial(null);
    setDrawerOpen(true);
  };

  const openEdit = (ev) => {
    if (ev) {
      setDrawerInitial(ev);
      setDrawerOpen(true);
    }
  };

  // Save handler called by drawer
  // payload may contain Date objects for start/end or strings; normalize to moment format strings before storing
  const handleSaveFromDrawer = (payload, isEdit) => {
    const normalize = (val) => {
      if (!val) return null;
      // if it's a Date object
      if (val instanceof Date) return moment(val).format("YYYY-MM-DD HH:mm:ss");
      // if it's a moment
      if (moment.isMoment(val)) return val.format("YYYY-MM-DD HH:mm:ss");
      // if it's a string (try parse)
      const m = moment(val);
      return m.isValid() ? m.format("YYYY-MM-DD HH:mm:ss") : val;
    };

    if (isEdit) {
      const stored = {
        ...payload,

        members: payload.members.map((id) => {
          return {
            user_id: id,
            appointment_id: payload.appointment_id,
          };
        }),
        clients: payload.clients.map((c) => {
          return {
            client_id: c.value,
            appointment_id: payload.appointment_id,
          };
        }),
        clientsPayload: payload.clients.map((c) => {
          return {
            client_id: c.value,
            client_name: c.label,
          };
        }),
        start: normalize(payload.start),
        end: normalize(payload.end),
      };
      dispatch(updateAppointment({ ...stored }));
    } else {
      const appointment_id = v4();
      const stored = {
        ...payload,
        members: payload.members.map((id) => {
          return {
            user_id: id,
            appointment_id: appointment_id,
          };
        }),
        clients: payload.clients.map((c) => {
          return {
            client_id: c.value,
            appointment_id: appointment_id,
          };
        }),
        clientsPayload: payload.clients.map((c) => {
          return {
            client_id: c.value,
            client_name: c.label,
          };
        }),
        start: normalize(payload.start),
        end: normalize(payload.end),
      };
      dispatch(
        createAppointment({
          ...stored,
          appointment_id: appointment_id,
          status: "",
          user_id: user?.uid,
          company_id: currCompanyId,
        })
      );
    }
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || "#3B82F6";
    const style = {
      backgroundColor,
      borderRadius: "6px",
      color: "white",
      border: "none",
      padding: "2px 6px",
    };
    return { style };
  };

  // onEventDrop/onEventResize receive Date objects for start/end; map back to stored format
  const onEventDrop = ({ event, start, end }) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id
          ? {
              ...ev,
              start: moment(start).format("YYYY-MM-DD HH:mm:ss"),
              end: moment(end).format("YYYY-MM-DD HH:mm:ss"),
            }
          : ev
      )
    );
  };

  const onEventResize = ({ event, start, end }) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id
          ? {
              ...ev,
              start: moment(start).format("YYYY-MM-DD HH:mm:ss"),
              end: moment(end).format("YYYY-MM-DD HH:mm:ss"),
            }
          : ev
      )
    );
  };

  const removeEvent = (id) => {
    // setEvents((prev) => prev.filter((e) => e.id !== id));
    // if drawer editing same event, close it
    if (drawerInitial && drawerInitial.id === id) {
      setDrawerOpen(false);
      setDrawerInitial(null);
    }
    dispatch(deleteAppointment({ appointment_id: id }));
  };

  // const handleSelectSlot = ({ start, end }) => {
  //   console.log()
  //   setDrawerInitial({
  //     start,
  //     end,
  //   });
  //   setDrawerOpen(true);
  // };

  // sorting helper uses moment
  const sortedEventsForSidebar = events
    .slice()
    .sort(
      (a, b) =>
        moment(a.start, "YYYY-MM-DD HH:mm:ss").valueOf() -
        moment(b.start, "YYYY-MM-DD HH:mm:ss").valueOf()
    );

  return (
    <div className="appointment-page">
      <div className="container">
        <aside className="sidebar">
          <div className="sidebarHeader">
            <h3>Upcoming</h3>
            {canManageAppointment ? (
              <div className="sidebarActions">
                <button className="btn small" onClick={openCreate}>
                  + Add appointment
                </button>
              </div>
            ) : null}
          </div>
          <div className="upcoming">
            <ul>
              {sortedEventsForSidebar.slice(0, 20).map((ev) => (
                <li key={ev.id} className="upcoming-item">
                  <div className="upcoming-left">
                    <div className="title">{ev.title}</div>
                    <div className="meta">
                      {mounted
                        ? moment(ev.start, "YYYY-MM-DD HH:mm:ss").format(
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        : ""}
                    </div>
                    {ev.venue && <div className="venue">{ev.venue}</div>}
                    <div className="mini-attendees">
                      {namesFromIds("member", ev.members, allUsers).map((n) => (
                        <span key={n} className="chip">
                          {n}
                        </span>
                      ))}
                      {namesFromIds("client", ev.clients, []).map((n) => (
                        <span key={n} className="chip client">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {canManageAppointment ? (
                    <div className="upcoming-actions">
                      <button
                        onClick={() => {
                          // open edit: pass calendar-style event (with Date objects) so drawer's prefill works
                          const calendarEv = {
                            ...ev,
                            start: moment(
                              ev.start,
                              "YYYY-MM-DD HH:mm:ss"
                            ).toDate(),
                            end: moment(ev.end, "YYYY-MM-DD HH:mm:ss").toDate(),
                          };
                          openEdit(calendarEv);
                        }}
                        className="link"
                      >
                        View
                      </button>
                      <button
                        onClick={() => removeEvent(ev.appointment_id)}
                        className="link danger"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="calendar-area">
          <div className="calendarHeader">
            <div />
          </div>

          <DndProvider backend={HTML5Backend}>
            <DnDCalendar
              selectable
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              views={["month", "week", "day", "agenda"]}
              style={{ height: 700, fontSize: "12px" }}
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              onSelectEvent={(ev) => {
                openEdit(ev);
              }}
              // onSelectSlot={handleSelectSlot}
              resizable
              eventPropGetter={eventStyleGetter}
            />
          </DndProvider>
        </main>
      </div>

      <AppointmentDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerInitial(null);
        }}
        onSave={handleSaveFromDrawer}
        initial={drawerInitial}
        memberOptions={memberOptions}
        canManageAppointment={canManageAppointment}
      />
    </div>
  );
}
