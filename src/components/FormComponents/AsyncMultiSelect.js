// components/AsyncMultiSelectSimple.jsx
import React, { useMemo, useRef, useEffect } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { API } from "@/service/api";
import { FaTimesCircle } from "react-icons/fa";

/**
 * Props:
 * - companyId: string
 * - loadUrl: "/appointment/searchClientListInAppointment"
 * - value, onChange, defaultOptions etc.
 */
export default function AsyncMultiSelectSimple({
  companyId,
  value,
  onChange,
  loadUrl,
  placeholder = "Search...",
  pageSize = 25,
  cacheOptions = true,
  defaultOptions = false,
  minInputLength = 1,
  debounceMs = 220,
  ...props
}) {
  const controllerRef = useRef(null);

  // abort on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const fetchOptions = async (input = "") => {
    // Cancel previous pending request
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch (e) {}
    }

    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    try {
      const res = await API.get(loadUrl, {
        params: {
          company_id: companyId,
          searchText: input,
          perPage: pageSize,
        },
        signal,
      });

      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data.items || res.data || [];

      return items?.map((it) => ({
        value: it.client_id,
        label: it.client_name,
        raw: it,
      }));
    } catch (err) {
      // axios cancellation detection
      const isCanceled =
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.message?.toLowerCase?.() === "canceled";

      if (isCanceled) return [];
      console.error("AsyncMultiSelectSimple axios error:", err);
      return [];
    }
  };

  // IMPORTANT: debounce wrapper that returns a Promise for react-select
  const loadOptions = useMemo(() => {
    // debounced runner receives (inputValue, resolve)
    const debouncedRunner = debounce(async (inputValue, resolve) => {
      try {
        const opts = await fetchOptions(inputValue);
        resolve(opts);
      } catch (e) {
        // on error resolve empty so react-select stops loading
        resolve([]);
      }
    }, debounceMs);

    return (inputValue) =>
      new Promise((resolve) => {
        // handle minInputLength and defaultOptions synchronously
        const trimmed = (inputValue || "").trim();
        if (!trimmed || trimmed.length < minInputLength) {
          if (defaultOptions) {
            // fetch default (company-only)
            fetchOptions("")
              .then((opts) => resolve(opts))
              .catch(() => resolve([]));
          } else {
            resolve([]);
          }
          return;
        }

        // call debounced runner (it will call resolve when finished)
        debouncedRunner(inputValue, resolve);
      });
    // add dependencies so debounced runner is recreated when relevant values change
  }, [
    companyId,
    loadUrl,
    pageSize,
    defaultOptions,
    minInputLength,
    debounceMs,
  ]);

  return (
    <AsyncSelect
      className="custom-select"
      classNamePrefix="custom-select"
      isMulti
      cacheOptions={cacheOptions}
      defaultOptions={defaultOptions}
      loadOptions={loadOptions}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      styles={{
        menu: (base) => ({
          ...base,
          zIndex: 9999,
          maxHeight: "320px",
        }),
      }}
      components={{
        MultiValueRemove: (props) => (
          <div {...props.innerProps} className="my-remove-icon">
            <FaTimesCircle size={15} />
          </div>
        ),
      }}
      {...props}
    />
  );
}
