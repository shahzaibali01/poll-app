import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const links = [
    { to: "/", label: "Polls" },
    ...(user
      ? [
          { to: "/create", label: "Create Poll" },
          { to: "/profile", label: "Profile" },
        ]
      : [{ to: "/login", label: "Login" },
          { to: "/signup", label: "Signup" },]),
  ];

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? "text-blue-600 font-semibold" : "text-gray-800";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600">PollApp</div>
        {isMobile ? (
          <button onClick={() => setOpen(true)} className="text-xl">
            <MenuOutlined />
          </button>
        ) : (
          <div className="flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-blue-500 transition ${isActive(link.to)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <Drawer
        title="PollApp"
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex flex-col space-y-4 p-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="text-lg text-gray-800 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Drawer>

     
    </>
  );
}
