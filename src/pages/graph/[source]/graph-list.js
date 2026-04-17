// pages/graph/graph-list.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import { useRouter } from "next/router";
import { useSelectCurrCompanyId } from "../../../../redux/slices/companySlice";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../../redux/slices/confirmModalSlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import {
  getGraphsBySource,
  deleteGraph,
  useSelectGraphs,
} from "../../../../redux/slices/graphSlice";

const GraphList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currCompanyID = useSelectCurrCompanyId();

  const graphs = useSelectGraphs();
  const showModal = useSelectShowModal();
  const { source } = router.query;
  const [targetGraphId, setTargetGraphId] = useState(null);

  useEffect(() => {
    if (currCompanyID) {
      dispatch(
        getGraphsBySource({
          company_id: currCompanyID,
          graph_source: source,
        })
      );
    }
  }, [currCompanyID, source]);

  const loading = false;

  const fixedColumns = getColumnsForPage("graph-list");

  const tableData = (graphs || []).map((graph) => ({
    id: graph.graph_id,
    title: graph.title,
    chart_type: graph.chart_type,
    is_publish: graph.is_publish ? "Published" : "Unpublished",
    created_at: graph.created_at,
  }));

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(`/graph/${source}/${row.id}/update-graph`);
    }

    if (action === "delete") {
      dispatch(setShowModal(true));
      setTargetGraphId(row.id);
    }
  };

  const handleDeleteGraph = () => {
    if (!targetGraphId) return;

    dispatch(
      deleteGraph({
        graph_id: targetGraphId
      })
    );

    setTargetGraphId(null);
    dispatch(setShowModal(false));
  };

  return (
    <div className="page-container">
      <ConfirmModal
        open={showModal}
        description="Are you sure you want to delete this graph?"
        onConfirm={handleDeleteGraph}
        onCancel={() => dispatch(setShowModal(false))}
      />

      <div className="title-container">
        <h1>Graph List</h1>
        <div className="title-actions">
          <ActionButton
            label="New Graph"
            type="primary"
            onClick={() => router.push(`/graph/${source}/new-graph`)}
          />
        </div>
      </div>

      <ReusableTable
        tableId="graph-list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable
        selectable
        onAction={handleAction}
        loading={loading}
        emptyMessage="No graph found"
      />
    </div>
  );
};

GraphList.featureKey = "graph_list"

export default GraphList;
