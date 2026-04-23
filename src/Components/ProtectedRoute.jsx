// import { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import api from "../api/axiosInstance";

// const ProtectedRoute = ({ children }) => {
//   const [isAuth, setIsAuth] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         await api.get("/check-auth", {
//           withCredentials: true,
//         });
//         setIsAuth(true);
//       } catch {
//         setIsAuth(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   if (isAuth === null) return <div>Loading...</div>;

//   return isAuth ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("riya_user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;