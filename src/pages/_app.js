import Layout from "@/components/PageLayout/Layout";
import "@/styles/globals.scss";
import "@/styles/login.scss";
import "@/styles/sidebar.scss";
import "@/styles/layout.scss";
import "@/styles/reusable-table.scss";

// Misc
import "@/styles/Misc/action-button.scss";
import "@/styles/Misc/toast.scss";
import "@/styles/Misc/confirm-modal.scss";
import "@/styles/Misc/simple-import-table.scss";
import "@/styles/Misc/filter-drawer.scss";
import "@/styles/Misc/column-order-drawer.scss";
import "@/styles/Misc/export-modal.scss";
import "@/styles/Misc/client-logs-drawer.scss";
import "@/styles/Misc/reset-password-modal.scss";
import "@/styles/Misc/appointment-drawer.scss";
import "@/styles/Misc/rte-preview-modal.scss";

// Form
import "@/styles/Form/new-form-template.scss";
import "@/styles/Form/new-form-submission.scss";

// Appointment
import "@/styles/Appointment/calendar.scss";

// Invitation
import "@/styles/Invitation/invitation.scss";

// KPI
import "@/styles/Kpi/new-kpi.scss";
import "@/styles/Kpi/kpi-dashboard.scss";
import "@/styles/Kpi/Dashboard/kpi-group-card.scss";
import "@/styles/Kpi/Dashboard/kpi-hover-details.scss";
import "@/styles/Kpi/Dashboard/kpi-mini-chart.scss";
import "@/styles/Kpi/Dashboard/kpi-tile.scss";
import "@/styles/Kpi/Dashboard/member-avatars.scss";

// Graph
import "@/styles/Graph/graph-list.scss";
import "@/styles/Graph/new-graph.scss";

import "@/styles/Graph/graph-publish.scss";
// Client
import "@/styles/Client/client-list.scss";
import "@/styles/Client/client-group-list.scss";
import "@/styles/Client/new-client-group.scss";
import "@/styles/Client/new-client.scss";
import "@/styles/Client/import-client.scss";

// Control panel
import "@/styles/ControlPanel/create-company.scss";
import "@/styles/ControlPanel/user-list.scss";
import "@/styles/ControlPanel/role-list.scss";
import "@/styles/ControlPanel/new-role.scss";
import "@/styles/ControlPanel/new-invite-user.scss";
import "@/styles/ControlPanel/logs.scss";
import "@/styles/ControlPanel/create-user.scss";

// Components
import "@/styles/FormComponents/date-field.scss";
import "@/styles/FormComponents/time-field.scss";
import "@/styles/FormComponents/dropdown-field.scss";
import "@/styles/FormComponents/multi-entry-field.scss";
import "@/styles/FormComponents/text-field.scss";
import "@/styles/FormComponents/link-field.scss";
import "@/styles/FormComponents/multiline-field.scss";
import "@/styles/FormComponents/multiple-checkbox-field.scss";
import "@/styles/FormComponents/multi-select-dropdown-field.scss";
import "@/styles/FormComponents/min-max-field.scss";
import "@/styles/FormComponents/date-range-field.scss";
import "@/styles/FormComponents/search-dropdown-field.scss";
import "@/styles/FormComponents/upload-image-field.scss";
import "@/styles/FormComponents/switch.scss";
import "@/styles/FormComponents/input-color.scss";
import "@/styles/FormComponents/rich-text-field.scss";
import "@/styles/FormComponents/multiple-choice-field.scss";

import { useRouter } from "next/router";
import { ToastProvider } from "@/components/Misc/Toast";
import { Provider } from "react-redux";
import store from "../../redux/store";
import { AuthProvider } from "@/components/Provider/AuthProvider";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const noSidebarRoutes = ["/", "/forgot-password", "/invitation"]; // add more if needed

  // Special check for 404 page
  const is404 = Component.name === "Error" || pageProps.statusCode === 404;

  const shouldShowSidebar =
    !noSidebarRoutes.includes(router.pathname) && !is404;

  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          {shouldShowSidebar ? (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          ) : (
            <Component {...pageProps} />
          )}
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}
