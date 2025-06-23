import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "react-hot-toast";
import PollList from "./pages/PollList";
import PollDetail from "./pages/PollDetail";
import Navbar from "./component/Navbar";
import PollForm from "./pages/PollForm";


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return user ? children : <Navigate to="/login" />;
}
console.log("asdf");

export default function App() {
  return (
    <>
    <BrowserRouter>
      <Toaster position="top-center" />
    <Navbar/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/create" element={<PrivateRoute><PollForm /></PrivateRoute>} />
         <Route path="/edit/:pollId" element={<PrivateRoute><PollForm /></PrivateRoute>} />
        <Route path="/" element={<PollList />} />
        <Route path="/poll/:id" element={<PollDetail />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
