import React from "react";
import {useNavigate} from "react-router-dom";


const Welcome = () => {
    const navigate = useNavigate();

    return(
        <div>
            <div>
                <h1>Welcome to our Clinic</h1>
                <button onClick = {() => navigate("/create-patient")}>Create a Patient</button>
            </div>
            <div>
            <button onClick = {() => navigate("/login-patient")}>Create a Patient</button>
            </div>
        </div>
        
    )
}
export default Welcome;