import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./component/Welcome";
import CreatePatient from "./component/Create_Patient";
// import Login_Patient from "./components/Login_Patient";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/create-patient" element={<CreatePatient />} />
        {/* <Route path="/login-patient" element={<Login_Patient />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
