
import axios, { HttpStatusCode } from "axios";
import { Children, createContext, useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import server from "../environment";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})
 

export const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

        const router = useNavigate();

    const handleRegister = async(name, username, password) => {
        try{
            let request = await client.post("/register",{
                name: name,
                username: username,
                password: password
              })

              if(request.status === HttpStatusCode.Created){
                if (request.data && request.data.token) {
                    localStorage.setItem("token", request.data.token);
                    router("/home");
                }
                return request.data.message || "Registration Successful";
              }

        } catch(err) {
             if (err.response && err.response.data && err.response.data.message) {
                 throw new Error(err.response.data.message);
             }
             throw err;  
        }
    };

    const handleLogin = async(username, password) =>{
        try{
            let request = await client.post("/login", {
                 username: username,
                password: password
            });

            if(request.status === HttpStatusCode.Ok){
                localStorage.setItem("token", request.data.token);
                router("/home");
                return "Login Successful";
            }

        } catch(err){
            if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Login failed. Please try again.");
      
        }
    };

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }


     const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }

    const saveMeetingSummary = async (meetingCode, transcript) => {
        try {
            let request = await client.post("/save_meeting_summary", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode,
                transcript: transcript
            });
            return request.data;
        } catch (e) {
            console.error("Error saving meeting summary:", e);
            throw e;
        }
    }


    const data = {
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addToUserHistory, saveMeetingSummary
    };

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};