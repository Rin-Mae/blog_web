import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SummaryCards from "../../components/adminDashboard/SummaryCards";
import TrafficTrends from "../../components/adminDashboard/TrafficTrends";
import Leaderboards from "../../components/adminDashboard/Leaderboards";
import ActivityMonitoring from "../../components/adminDashboard/ActivityMonitoring";
import Header from "../../components/adminLayout/AdminHeader";
import Footer from "../../components/adminLayout/AdminFooter";
import Sidebar from "../../components/adminLayout/Sidebar";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="py-5">
        <div className="container">
          <SummaryCards />
          <TrafficTrends />
          <Leaderboards />
          <ActivityMonitoring />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Dashboard;
