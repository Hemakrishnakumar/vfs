import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import { useState } from 'react';
import { BASE_URL } from './config/constants';
import toast from 'react-hot-toast';
import './UsersView.css'
import { useAuth } from './context/AuthContext';


const UsersView = () => {
  const navigate = useNavigate();
  const {user} = useAuth();
  const {role} = user;
  const [users, setUsers] = useState([]);  
 
  const fetchUsersData = async () => {
    try {
        const res = await fetch(`${BASE_URL}/users`,{
        credentials: 'include'
     });
     if(res.status === 401) {
        navigate('/login');
     }
     if(res.status === 200) {
        const data = await res.json();
        setUsers(data);
     }    
    }catch(err) {
        console.log(err);
        toast.error('failed to fetch the users');      
    }
  }

  if(user?.role === 'user') {
    navigate('/forbidden');
  }

  useEffect(()=>{
     fetchUsersData();
  }, []);

  const logoutUserHandler = async(id) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if(res.status === 204) {
        toast.success('user logged out successfully');
        fetchUsersData();
      }
      else {
        toast.error('Failed to logout the user')
      }
    } catch (error) {
      toast.error('failed to logout the user');
      console.error(error);
    }
  }
 
  return (
    <div className="users-container">
        <h2>Users</h2>
      {users.length > 0 && (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>State</th>              
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {role === 'manager' ? <td>{ user.isLoggedIn ? 'Logged In': 'Not Logged In'}</td> :                
                <td>                  
                    <button onClick={()=> logoutUserHandler(user.id)} className="logout-btn" disabled={!user.isLoggedIn}>
                      Logout
                    </button>                 
                </td> }
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersView;