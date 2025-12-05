import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./contexts/AuthContext";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DeactivatedGate from "./components/DeactivatedGate";
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import CreateAccount from "./pages/public/CreateAccount";
import "./assets/css/style.scss";
import BloggerDashboard from "./pages/bloggers/Dashboard";
import BloggerProfile from "./pages/bloggers/Profile";
import BloggerEdit from "./pages/bloggers/BlogEdit";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminUsersEdit from "./pages/admin/UsersEdit";
import AdminUsersView from "./pages/admin/UsersView";
import AdminPosts from "./pages/admin/Posts";
import AdminPostView from "./pages/admin/PostView";
import AdminProfile from "./pages/admin/AdminProfile";
import BlogList from "./pages/public/BlogList";
import BlogDetails from "./pages/public/BlogDetails";
import SearchResults from "./pages/public/SearchResults";
import ScrollToTop from "./components/ScrollToTop";
import CreateBlog from "./pages/bloggers/BlogCreate";
import BloggerAccountSettings from "./pages/bloggers/BloggerAccountSettings";
import BloggerList from "./pages/bloggers/BlogList";
import BloggerDetails from "./pages/bloggers/BlogDetails";
import BloggerDeactivated from "./pages/bloggers/BloggerDeactivated";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* Global guard to catch any route for deactivated accounts */}
        <DeactivatedGate />
        <Routes>
          {/* Public routes */}
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Public blog details by slug */}
          <Route path="/blog/:slug" element={<BlogDetails />} />

          {/* Guest-only routes (redirect if authenticated) */}
          <Route
            path="/"
            element={
              <GuestRoute>
                <Landing />
              </GuestRoute>
            }
          />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/create-account"
            element={
              <GuestRoute>
                <CreateAccount />
              </GuestRoute>
            }
          />

          {/* Blogger routes (protected) */}

          <Route
            path="/bloggers/deactivated"
            element={
              <ProtectedRoute>
                <BloggerDeactivated />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/bloggers"
            element={
              <ProtectedRoute>
                <BloggerDashboard />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/bloggers/my-blogs/:id"
            element={
              <ProtectedRoute>
                <BloggerDetails />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/bloggers/create"
            element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/bloggers/my-blogs"
            element={
              <ProtectedRoute>
                <BloggerList />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/bloggers/profile"
            element={
              <ProtectedRoute>
                <BloggerProfile />
              </ProtectedRoute>
            }
          />

          {/* chechk  */}
          <Route
            path="/bloggers/my-blogs/edit/:id"
            element={
              <ProtectedRoute>
                <BloggerEdit />
              </ProtectedRoute>
            }
          />

          {/* check */}
          <Route
            path="/bloggers/account-settings"
            element={
              <ProtectedRoute>
                <BloggerAccountSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin routes (protected) */}

          {/* check */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* checjk */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/admin/users/view/:id"
            element={
              <ProtectedRoute>
                <AdminUsersView />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute>
                <AdminUsersEdit />
              </ProtectedRoute>
            }
          />

          {/* check  */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          {/* check */}
          <Route
            path="/admin/posts"
            element={
              <ProtectedRoute>
                <AdminPosts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/posts/:id"
            element={
              <ProtectedRoute>
                <AdminPostView />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
