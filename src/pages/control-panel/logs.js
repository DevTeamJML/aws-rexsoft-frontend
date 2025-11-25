"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useRouter } from "next/router";

import {
  getLogs,
  getMyLogs,
  useSelectLogs,
  useSelectLogsLoading,
  useSelectLogsTotal,
} from "../../../redux/slices/logSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
} from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import { FaSearch } from "react-icons/fa";

const formatValue = (val) => {
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(", ") : "(empty)";
  }
  if (val === null || val === undefined || val === "") {
    return "(empty)";
  }
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

export default function LogsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const logs = useSelectLogs();
  const loading = useSelectLogsLoading();
  const total = useSelectLogsTotal();

  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();

  const permissions = useSelector((s) => s.roleAuth?.userPermissions ?? []);
  const canViewAll = useMemo(
    () =>
      permissions.includes("view_other_logs") ||
      permissions.includes("view_all"),
    [permissions]
  );

  // modal state: which log is open (null = closed)
  const [selectedLog, setSelectedLog] = useState(null);
  const modalRef = useRef(null);

  // filters / paging
  const [mode, setMode] = useState(canViewAll ? "all" : "mine");
  const [section, setSection] = useState("all");
  const [search, setSearch] = useState("");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const allCompanyUsers = useSelectAllCompanyUsers();

  console.log(allCompanyUsers);

  const debounceRef = useRef(null);

  const SECTION_MAP = useMemo(
    () => ({
      Client: "#2f86f6",
      Appointment: "#e74c3c",
      Form: "#27ae60",
    }),
    []
  );

  // click outside handler to close modal
  // const handleClickOutside = useCallback(
  //   (e) => {
  //     if (!modalRef.current) return;
  //     if (!modalRef.current.contains(e.target)) {
  //       setSelectedLog(null);
  //     }
  //   },
  //   [modalRef]
  // );

  useEffect(() => {
    if (selectedLog) {
      // document.addEventListener("mousedown", handleClickOutside);
      // document.addEventListener("keydown", handleEsc);
      // prevent body scroll while modal open
      document.body.style.overflow = "hidden";
    } else {
      // document.removeEventListener("mousedown", handleClickOutside);
      // document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    }

    return () => {
      // document.removeEventListener("mousedown", handleClickOutside);
      // document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [openModal]);

  // fetchLogs (useCallback so effects are stable)
  const fetchLogs = useCallback(
    (opts = {}) => {
      const useOffset = opts.offset ?? offset;
      const useSection =
        opts.section ?? (section === "all" ? undefined : section);
      const useSearch = typeof opts.search === "string" ? opts.search : search;

      const params = {
        limit,
        offset: useOffset,
        section: useSection,
        q: useSearch ? useSearch : undefined,
        company_id: currCompanyId,
        user_id: user?.uid,
      };

      // remove undefineds
      Object.keys(params).forEach(
        (k) => params[k] === undefined && delete params[k]
      );

      if (currCompanyId && user?.uid) {
        if (mode === "mine") {
          dispatch(getMyLogs({ params }));
        } else {
          dispatch(getLogs({ params }));
        }
      }
    },
    [dispatch, offset, section, limit, currCompanyId, user?.uid, mode, search]
  );

  // Debounced effect: run when mode/section/search change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // reset to page 0
      setOffset(0);
      fetchLogs({ offset: 0, section, search });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mode, section, search, fetchLogs]);

  // immediate search handler (used by Enter key)
  const handleGlobalSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setOffset(0);
    fetchLogs({ offset: 0, search });
  }, [fetchLogs, search]);

  // onKeyDown handler for Enter key in search input
  const handleSearchEnter = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      const val = typeof e.target?.value === "string" ? e.target.value : search;
      setOffset(0);
      fetchLogs({ offset: 0, search: val });
    },
    [fetchLogs, search]
  );

  const handleLoadMore = () => {
    if (loading) return;
    const next = offset + limit;
    setOffset(next);
    fetchLogs({ offset: next });
  };

  const localeDate = (d) => {
    try {
      const dt = d ? new Date(d) : new Date();
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dt);
    } catch {
      return String(d);
    }
  };

  const canLoadMore = !loading && logs && logs.length < (total || 0);

  console.log(selectedLog);
  return (
    <div className="logs-page-container" aria-busy={loading ? "true" : "false"}>
      <header className="page-header">
        <h1 className="title">Logs</h1>
        <p className="subtitle">
          View activity logs. Toggle between your logs and company logs (if
          permitted).
        </p>
      </header>

      <div className="controls">
        <div className="modeToggle">
          {canViewAll ? (
            <>
              <button
                type="button"
                className={mode === "mine" ? "modeBtnActive" : "modeBtn"}
                onClick={() => {
                  setMode("mine");
                }}
              >
                My logs
              </button>
              <button
                type="button"
                className={mode === "all" ? "modeBtnActive" : "modeBtn"}
                onClick={() => {
                  setMode("all");
                }}
              >
                Company logs
              </button>
            </>
          ) : (
            <div className="modeLabel">Showing: My logs</div>
          )}
        </div>

        <div className="filters">
          <DropdownField
            value={section}
            dropdownList={["all", ...Object.keys(SECTION_MAP)]}
            onChange={(val) => setSection(val)}
            width={"200px"}
          />

          <div className="search-wrapper" style={{ position: "relative" }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-bar"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
          </div>
        </div>
      </div>

      <div className="legend">
        {Object.entries(SECTION_MAP).map(([key, color]) => (
          <div key={key} className="legendItem">
            <span className="legendSwatch" style={{ background: color }} />
            <span className="legendLabel">{key}</span>
          </div>
        ))}
      </div>

      <div className="cardsWrap" role="list">
        {loading && (!logs || logs.length === 0) ? (
          <div className="loading">Loading...</div>
        ) : logs && logs.length > 0 ? (
          logs.map((log, idx) => {
            const sec = log.section ?? "Unknown";
            const color = SECTION_MAP[sec] ?? "#9b9b9b";
            const key =
              log.log_id ?? log.id ?? `${log.created_at ?? ""}-${idx}`;

            return (
              <article
                key={key}
                className="card"
                role="listitem"
                aria-label={`Log ${log.action ?? ""}`}
                onClick={() => {
                  setSelectedLog(log);
                  setOpenModal(true);
                }}
              >
                <div className="cardHeader">
                  <div className="cardTitle" style={{ color }}>
                    {log.action ?? "action"}
                  </div>
                </div>

                <div className="cardBody">
                  <div className="cardText">
                    {log.text ?? log.message ?? "-"}
                  </div>

                  <div className="cardMeta">
                    <span>{localeDate(log.created_at ?? log.createdAt)}</span>
                  </div>
                </div>

                <div className="corner" style={{ borderRightColor: color }} />
              </article>
            );
          })
        ) : (
          <div className="empty">No logs found.</div>
        )}
      </div>

      <div className="actions">
        <ActionButton
          label="Load more"
          onClick={handleLoadMore}
          disabled={!canLoadMore}
        />
      </div>

      {/* Modal: show metadata when selectedLog is set */}
      {openModal && (
        <div className="logModalOverlay" aria-modal="true" role="dialog">
          <div className="logModal" ref={modalRef}>
            <div className="logModalHeader">
              <h3>{selectedLog.action ?? "Log details"}</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => {
                  setSelectedLog(null);
                  setOpenModal(false);
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="logModalBody">
              <div className="modalMainText">{selectedLog.text ?? "-"}</div>

              <div className="modalMeta">
                <div className="metaRow">
                  <strong>When:</strong>{" "}
                  <span>
                    {localeDate(
                      selectedLog.created_at ?? selectedLog.createdAt
                    )}
                  </span>
                </div>
                <div className="metaRow">
                  <strong>User:</strong>{" "}
                  <span>
                    {(() => {
                      const u = allCompanyUsers?.find(
                        (x) => x.user_id === selectedLog.user_id
                      );
                      return u ? `${u.first_name} ${u.last_name}` : "-";
                    })()}
                  </span>
                </div>
                {selectedLog.metadata?.serial_number && (
                  <div className="metaRow">
                    <strong>Serial Number</strong>{" "}
                    <span>{selectedLog.metadata.serial_number}</span>
                  </div>
                )}
                 
              </div>

              {selectedLog.metadata?.changes?.length > 0 && (
                <div className="modalChanges">
                  <h4>Changes</h4>
                  {selectedLog.metadata.changes.map((ch, i) => (
                    <div key={i} className="changeRow">
                      <div className="changeLabel">{ch.label}</div>
                      <div className="changeValues">
                        <div className="old">
                          Old: <span>{formatValue(ch.old)}</span>
                        </div>
                        <div className="new">
                          New: <span>{formatValue(ch.new)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="logModalFooter">
              <ActionButton
                label="Close"
                onClick={() => {
                  setSelectedLog(null);
                  setOpenModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
