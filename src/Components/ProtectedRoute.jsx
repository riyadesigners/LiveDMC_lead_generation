import React from 'react'
import { Navigate } from 'react-router-dom'

const isTokenValid = (token) => {
    try{
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    }
    catch{
        return false;
    }
}

const ProtectedRoute = ({children}) => {
   const userData = JSON.parse(localStorage.getItem("riya_user") || "{}");
   const token = userData?.token;

   if(!token || !isTokenValid(token)){
    return <Navigate to="/login" replace />
   }
   return children;
};

export default ProtectedRoute
