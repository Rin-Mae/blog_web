import React, { useState } from "react";
import Header from "../../components/adminLayout/AdminHeader";
import Footer from "../../components/adminLayout/AdminFooter";
import Sidebar from "../../components/adminLayout/Sidebar";
import AdminPostsList from "../../components/admin/AdminPostsList";
import { useAuth } from "../../contexts/AuthContext";

function Posts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main style={{ padding: 16 }}>
        <h2 className="text-wrap text-break">Posts</h2>
        <AdminPostsList />
      </main>

      <Footer />
    </>
  );
}

export default Posts;
