// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Layout from "../components/Layout"
import InfraPage from "../features/infra/InfraPage";
import DashboardPage from "../features/infra/dashboard/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [ 
      {
        index: true, // default route
        element: <InfraPage/>
      },
      {
        path:"dashboard",
        element: <DashboardPage/>
      }
    ]
  },
]);
