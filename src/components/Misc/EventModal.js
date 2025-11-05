import { useMediaQuery } from "@mui/material";
import moment from "moment";
import Image from "next/image";
import React from "react";
import {
  FaCalendarAlt,
  FaEquals,
  FaExclamation,
  FaLink,
  FaList,
  FaLocationArrow,
  FaMapMarked,
  FaMapMarkedAlt,
  FaMapMarker,
  FaMapMarkerAlt,
  FaMicrophoneAlt,
  FaRegClock,
} from "react-icons/fa";
import { ActionButton } from "./ActionButton";
import { useRouter } from "next/router";
import { useSelectUser } from "@/redux/slices/authSlice";

const EventModal = ({
  open,
  onConfirm,
  onCancel,
  selectedEvent,
  attendingEventId = [],
  onUnattend,
}) => {
  if (!open || !selectedEvent) return null;

  const isAttending = attendingEventId.includes(selectedEvent.event_id);
  const now = moment();
  const eventDate = moment(selectedEvent.date);
  const isClosed = !selectedEvent.is_publish; // 0 or false
  const isExpired = now.isAfter(eventDate, "day"); // date passed

  const router = useRouter();
  const user = useSelectUser();

  const isTabSize = useMediaQuery("(max-width:1280px)");
  const day = moment(selectedEvent.date).format("DD");
  const month = moment(selectedEvent.date).format("MMM");
  const monthUpper = month.toUpperCase();
  const time = moment(selectedEvent.time, "HH:mm:ss").format("HH:mm");

  return (
    <div className="event-modal-overlay modal-overlay">
      <div className="modal-content">
        <div className="event-title">
          <p className="">{selectedEvent.event_name}</p>
          {user && user?.role === "admin" && (
            <ActionButton
              label={"Edit"}
              onClick={() => {
                router.push(`/edit-event?id=${selectedEvent.event_id}`);
              }}
              width={"75px"}
            />
          )}
        </div>

        <div className="event-content-wrapper">
          {/* Image on Left */}
          <div className="event-image-container">
            <Image
              className="event-image"
              src={selectedEvent.image_url}
              alt="Event Image"
              style={{ objectFit: "cover" }}
              priority
              fill={true}
            />

            {/* {!isTabSize && (
              <div className="event-overlay-container">
                <div className="event-location-box">
                  <FaMapMarkerAlt color="red" />
                  <span title={selectedEvent.venue}>{selectedEvent.venue}</span>
                </div>
                <div className="event-time-box">
                  <FaRegClock color="beige" />
                  <span title={time}>{time}</span>
                </div>
                <div className="event-date-box" title={selectedEvent.date}>
                  <span className="day">{day}</span>
                  <span className="month">{monthUpper}</span>
                </div>
              </div>
            )} */}
          </div>

          {/* Details on Right */}
          <div className="event-details-container">
            <div className="event-details">
              <>
                <div className="details">
                  <FaCalendarAlt />
                  <span className="details-text" title={selectedEvent.date}>
                    {selectedEvent.date}
                  </span>
                </div>
                <div className="details">
                  <FaRegClock />
                  <span className="details-text" title={selectedEvent.time}>
                    {selectedEvent.time}
                  </span>
                </div>
                <div className="details">
                  <FaMapMarkedAlt />
                  <span className="details-text" title={selectedEvent.venue}>
                    {selectedEvent.venue}
                  </span>
                </div>
                <div className="details">
                  <FaMicrophoneAlt />
                  <span className="remark-text" title={selectedEvent.speaker}>
                    {selectedEvent.speaker}
                  </span>
                </div>
                <div className="details">
                  <FaLink />
                  <a
                    className="details-text"
                    title={selectedEvent.event_url}
                    href={selectedEvent.event_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedEvent.event_url}
                  </a>
                </div>
                <div className="details">
                  <FaEquals />
                  <span
                    className="remark-text"
                    title={selectedEvent.event_url_description}
                  >
                    URL Description :{" "}  
                    {selectedEvent.event_url_description}
                  </span>
                </div>
                <div className="details">
                  <FaList />
                  <span
                    className="remark-text"
                    title={selectedEvent.event_description}
                  >
                    Description :{" "}  
                    {selectedEvent.event_description}
                  </span>
                </div>
              </>
            </div>
          </div>
        </div>

        {/* Buttons at Bottom */}
        <div className="modal-actions">
          <button className="btn cancel-btn" onClick={onCancel}>
            Back
          </button>
          {!isClosed &&
            !isExpired &&
            (isAttending ? (
              <button className="btn unattend-btn" onClick={onUnattend}>
                Unattend
              </button>
            ) : (
              <button
                className="btn confirm-btn"
                onClick={onConfirm}
                style={{ color: "black" }}
              >
                Attend
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
