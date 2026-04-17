import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";
import useFeature from "@/hooks/useFeature";
import { ref, set } from "firebase/database";
import { db } from "@/config/firebaseConfig";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();

  const handleClick = async () => {
    try {
      await set(ref(db, "featureFlags"), {
        client_group_list: { enabled: true },
        client_list: { enabled: true },
        appointment: { enabled: false },

        kpi_list: { enabled: false },
        kpi_dashboard: { enabled: false },

        graph_published: { enabled: false },
        graph_list: { enabled: false },

        form_template_list: { enabled: false },
        apply_form_list: { enabled: false },
        form_submission_list: { enabled: false },
        form_approval_list: { enabled: false },
      });
   
    } catch (e) {
      console.error(e);
    }
  };

  // map route → feature
  const routeFeatureMap = {
    "/client/client-group-list": "client_group_list",
    "/client/client-list": "client_list",
    "/appointment/calendar": "appointment",
    "/kpi/kpi-list": "kpi_list",
    "/kpi/kpi-dashboard": "kpi_dashboard",
    "/graph/graph-publish": "graph_published",
    "/graph/[source]/graph-list": "graph_list",
    "/form/form-template/form-template-list": "form_template_list",
    "/form/form-submission/apply-form-list": "apply_form_list",
    "/form/form-submission/form-submission-list": "form_submission_list",
    "/form/form-approval/form-approval-list": "form_approval_list",
  };

  const featureKey = routeFeatureMap[router.pathname];
  const isEnabled = useFeature(featureKey);
  const isMaintenance = featureKey && isEnabled === false;

  return (
    <div className="layout">
      {/* <button onClick={handleClick}>Write Firebase</button> */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className={`main-container ${isCollapsed ? "collapse-sidebar-main-container" : ""}`}
      >
        {isMaintenance ? (
          <div className="maintenance-page">
            <h2>🚧 Under Maintenance</h2>
            <p>This feature is temporarily unavailable.</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
