import toast from "react-hot-toast";

const BASE_URL = "http://localhost:4000";

export const handleGoogleLogin = async (data) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/google`, {
            method: 'POST',
            body: JSON.stringify({ idToken: data.credential }),
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        const res = await response.json()
        return res;
    } catch (err) {
        console.log(err);
        return;
    };

}