import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import UsersView from "./UsersView";
import Forbidden from "./Forbidden";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path: "/register",
    element: <Register />,    
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/users",
    element: <UsersView/>
  },
  {
    path: 'forbidden', 
    element: <Forbidden/>
  }

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
