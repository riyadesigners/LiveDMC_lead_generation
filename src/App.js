import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Signup from "./Pages/Signup";
import Newlead from "./Pages/New-lead";
import Leadlist from "./Pages/Leadlist";
import Invoice from "./Components/Invoice";
import Newuser from "./Pages/Newuser";
import Setting from "./Pages/userSetting";

// import AddStudent from "./Pages/Student/AddStudent";
// import StudentList from "./Pages/Student/StudentList";

import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <div className="App">
      
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
           <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
           <Route path="/New-lead" element={<ProtectedRoute><Layout><Newlead/></Layout></ProtectedRoute>} />
           <Route path="/Leadlist" element={<ProtectedRoute><Layout><Leadlist/></Layout></ProtectedRoute>} />
          <Route path="/new-lead/:leadId" element={<ProtectedRoute><Layout><Newlead/></Layout></ProtectedRoute>} />
          <Route path="/invoice/:id" element={<ProtectedRoute><Layout><Invoice/></Layout></ProtectedRoute>} />
          <Route path="/edit-lead/:editId" element={<ProtectedRoute><Layout><Newlead/></Layout></ProtectedRoute>} />
         <Route path="/Newuser" element={<ProtectedRoute><Layout><Newuser/></Layout></ProtectedRoute>} />
         <Route path="/Setting" element={<ProtectedRoute><Layout><Setting/></Layout></ProtectedRoute>} />
             {/* <Route path="/student/AddStudent" element={<Layout><AddStudent/></Layout>} /> */}
             {/* <Route path="/Student/AddStudent" element={<Layout><AddStudent/></Layout >} />
              <Route path="/Student/AddStudent/:studentId" element={<Layout><AddStudent /></Layout>} />
             <Route path="/student/StudentList" element={<Layout><StudentList/></Layout>} /> */}
          <Route path="/signup" element={<Signup />} />
        </Routes>
       
    </div>
    // <div className="App">
    // <h1 className='hello'>Hello</h1>
    // </div>
  );
}

export default App;
