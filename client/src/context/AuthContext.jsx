import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import PropTypes from 'prop-types';

const BASE_URL = 'http://localhost:4000'
const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
    AuthProvider.propTypes = {
        children: PropTypes.node.isRequired
    };

    const [user, setUser] = useState({});

    const getUser = async () => {
        try {
            const response = await fetch(`${BASE_URL}/user`, {
                credentials: "include",
            });
            const data = await response.json();
            if (data.error) {
                return;
            } else {
                setUser(data);
                // On success, navigate to home or any other protected route                
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        if (user?.name)
            return;
        getUser();
    }, [])

    return <AuthContext.Provider value={{ user, setUser }}>
        {children}
    </AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext);