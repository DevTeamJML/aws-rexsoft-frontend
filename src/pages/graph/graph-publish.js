"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getPublishedGraph,
  getPublishedGraphById,
  useSelectPublishedGraphs,
} from "../../../redux/slices/graphSlice";
import {
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";

const INITIAL_COUNT = 4;
const LOAD_MORE_COUNT = 2;

export default function PublishedGraph() {
  const dispatch = useDispatch();
  const currCompanyId = useSelectCurrCompanyId();

  const publishedGraphs = useSelectPublishedGraphs();

  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRanges, setDateRanges] = useState({});

  const isAdmin = useSelectIsAdmin();
  const user = useSelectUser();

  const DATE_RANGES = [
    { value: "today", label: "Today" },
    { value: "7d", label: "Last 7 days" },
    { value: "1m", label: "Last 1 month" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last 1 year" },
    { value: "all", label: "All time" },
  ];

  useEffect(() => {
    if (!publishedGraphs.length) return;

    setDateRanges((prev) => {
      const next = { ...prev };
      publishedGraphs.forEach((g) => {
        if (prev[g.graph_id] && prev[g.graph_id] === g.dateFilter?.range) {
          delete next[g.graph_id];
        }
      });
      return next;
    });
  }, [publishedGraphs]);

  useEffect(() => {
    if (!currCompanyId) return;

    setOffset(LOAD_MORE_COUNT);
    dispatch(
      getPublishedGraph({
        company_id: currCompanyId,
        limit: INITIAL_COUNT,
        offset: 0,
        isAdmin: isAdmin,
        user_id: user?.uid,
      }),
    );
  }, [currCompanyId]);

  const handleLoadMore = () => {
    if (!currCompanyId) return;

    const nextOffset = offset + LOAD_MORE_COUNT;
    setOffset(nextOffset);
    setIsLoading(true);

    dispatch(
      getPublishedGraph({
        company_id: currCompanyId,
        limit: LOAD_MORE_COUNT,
        offset: nextOffset,
        isAdmin: isAdmin,
        user_id: user?.uid,
      }),
    );
    setIsLoading(false);
  };

  const handleDateRangeSelection = (graph_id, range) => {
    setDateRanges((prev) => ({
      ...prev,
      [graph_id]: range,
    }));

    dispatch(
      getPublishedGraphById({
        graph_id: graph_id,
        company_id: currCompanyId,
        dateRange: range,
      }),
    );
  };

  return (
    <div className="published-graph-container">
      <h4>Published Graph</h4>

      <div className="graph-body">
        {publishedGraphs.map((g) => (
          <div key={g.graph_id} className="graph">
            <div className="date-filter">
              {DATE_RANGES.map(({ value, label }) => (
                <button
                  key={value}
                  className={
                    (dateRanges[g.graph_id] ?? g.dateFilter?.range) === value
                      ? "active"
                      : ""
                  }
                  onClick={() => handleDateRangeSelection(g.graph_id, value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <h4 className="graph-title">{g.title}</h4>

            <ResponsiveContainer width="100%" height={250}>
              {g.chart_type === "line" && (
                <LineChart data={g.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  {g.series ? (
                    Object.keys(g.visualSettings?.series || {}).map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={
                          g.visualSettings.series[key]?.color || "#4F46E5"
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    ))
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke={g.visualSettings?.single?.color || "#4F46E5"}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              )}

              {g.chart_type === "bar" && (
                <BarChart data={g.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  {g.series ? (
                    Object.keys(g.visualSettings?.series || {}).map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={g.visualSettings.series[key]?.color || "#4F46E5"}
                      />
                    ))
                  ) : (
                    <Bar
                      dataKey="y"
                      fill={g.visualSettings?.single?.color || "#4F46E5"}
                    />
                  )}
                </BarChart>
              )}

              {g.chart_type === "area" && (
                <AreaChart data={g.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  {g.series ? (
                    Object.keys(g.visualSettings?.series || {}).map((key) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={
                          g.visualSettings.series[key]?.color || "#4F46E5"
                        }
                        fill={g.visualSettings.series[key]?.color || "#4F46E5"}
                        fillOpacity={
                          g.visualSettings.series[key]?.fillOpacity ?? 0.3
                        }
                      />
                    ))
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke={g.visualSettings?.single?.color || "#4F46E5"}
                      fill={g.visualSettings?.single?.color || "#4F46E5"}
                      fillOpacity={g.visualSettings?.single?.fillOpacity ?? 0.3}
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* LOAD MORE */}
      <div className="load-more-wrapper">
        <button
          className="load-more-btn"
          onClick={handleLoadMore}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
