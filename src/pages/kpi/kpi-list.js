import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import { useRouter } from "next/router";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../redux/slices/confirmModalSlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import {
  getKpisBySource,
  deleteKpi,
  useSelectKpis,
} from "../../../redux/slices/kpiSlice";

const KpiList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currCompanyID = useSelectCurrCompanyId();

  const kpis = useSelectKpis();

  const showModal = useSelectShowModal();

  const [targetKpiId, setTargetKpiId] = useState(null);

  useEffect(() => {
    if (currCompanyID) {
      dispatch(
        getKpisBySource({
          company_id: currCompanyID
        })
      );
    }
  }, [currCompanyID]);

  const loading = false;

  const fixedColumns = getColumnsForPage("kpi-list");

  const tableData = (kpis || []).map((kpi) => ({
    id: kpi.kpi_group_id,
    kpi_group_name: kpi.kpi_group_name,
    created_at : kpi.created_at,
    created_by : kpi.created_by,
    is_publish: kpi.is_publish ? "Published" : "Unpublished",
    created_at: kpi.created_at,
  }));

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(`/kpi/${row.id}/update-kpi`);
    }

    if (action === "delete") {
      dispatch(setShowModal(true));
      setTargetKpiId(row.id);
    }
  };

  const handleDeleteKpi = () => {
    if (!targetKpiId) return;

    dispatch(
      deleteKpi({
        kpi_group_id: targetKpiId
      })
    );

    setTargetKpiId(null);
    dispatch(setShowModal(false));
  };

  return (
    <div className="page-container">
      <ConfirmModal
        open={showModal}
        description="Are you sure you want to delete this KPI?"
        onConfirm={handleDeleteKpi}
        onCancel={() => dispatch(setShowModal(false))}
      />

      <div className="title-container">
        <h1>KPI List</h1>
        <div className="title-actions">
          <ActionButton
            label="New KPI"
            type="primary"
            onClick={() => router.push(`/kpi/new-kpi`)}
          />
        </div>
      </div>

      <ReusableTable
        tableId="kpi-list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable
        selectable
        onAction={handleAction}
        loading={loading}
        emptyMessage="No KPI found"
      />
    </div>
  );
};

export default KpiList;
