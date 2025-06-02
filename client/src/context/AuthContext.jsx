import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";

const BASE_URL = 'http://localhost:4000'
const AuthContext = createContext(null);

export default function AuthProvider ({children}) {
    const [user, setUser] = useState(null);

    const getUser = async () => {
        try {
            const response = await fetch(`${BASE_URL}/user`, {
                credentials: "include",
            });
            const data = await response.json();
            if (data.error) {
                // If there's an error, set the serverError message
                setServerError(data.error);
            } else {
                console.log({data});
                setUser(data);
                // On success, navigate to home or any other protected route                
            }
        } catch (error) {
            console.error("Error:", error);            
        }
    };    

    useEffect(()=>{
        getUser();
    }, [])

    return <AuthContext.Provider value={{user}}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);