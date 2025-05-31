import { useState, useEffect } from 'react';

import api from '../../api';
import './style.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);


  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/sudo/get_all_users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setUsers(response.data.users);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  // Delete user
  const handleDeleteUser = async (username) => {
    try {
      await api.delete('/sudo/delete_user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        data: { username }
      });
      setUsers(users.filter(user => user.username !== username));
    }
    catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  }

  // Render error if exists, not ideal but good enough
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="list-container">
      <h2>Manage Users</h2>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Id</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.role}</td>
                <td>{user._id}</td>
                <td>
                  {user.role === 'ADMIN' ? (
                    <button className="button" disabled>
                      Delete*
                    </button>
                  ) : (
                    <button
                      className="button"
                      onClick={() => handleDeleteUser(user.username)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <i className="note">*Admin users cannot be deleted</i>
    </div>
  );
};

export default ManageUsers;