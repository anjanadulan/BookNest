import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Trash2, Edit, Plus, X, Lock, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form Fields State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('CUSTOMER');

  const USER_API = 'http://localhost:8085/api/users';

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(USER_API);
      if (!res.ok) throw new Error('Could not retrieve system users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setErrorMsg('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('CUSTOMER');
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword(user.password || '');
    setUserRole(user.role);
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userToDelete) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Safety constraint: Prevent admins from deleting themselves
    if (userToDelete.id === currentUser.id) {
      setErrorMsg('You cannot delete your own administrator account!');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${userToDelete.name} (${userToDelete.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`${USER_API}/${userToDelete.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccessMsg(`User ${userToDelete.name} was successfully removed.`);
        fetchUsers();
      } else {
        throw new Error('Server returned error on delete');
      }
    } catch (err) {
      setErrorMsg('Failed to delete user: ' + err.message);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Safety checks
    if (editingUser && editingUser.id === currentUser.id && userRole !== 'ADMIN') {
      setErrorMsg('Safety Lock: You cannot demote yourself from the ADMIN role.');
      return;
    }

    const payload = {
      name: userName,
      email: userEmail,
      password: userPassword,
      role: userRole
    };

    if (editingUser) {
      payload.id = editingUser.id;
    }

    try {
      const res = await fetch(USER_API, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(editingUser ? 'User profile updated successfully!' : 'New user account created successfully!');
        setIsFormOpen(false);
        fetchUsers();
      } else {
        const errText = await res.text();
        throw new Error(errText || 'Server save operation failed');
      }
    } catch (err) {
      setErrorMsg('Failed to save user: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>User Accounts Registry</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Audit all registered customer profiles and system administrator logins.</p>
        </div>
        <button onClick={handleOpenAddUser} className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add New User
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          padding: '12px 14px',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#34d399',
          padding: '12px 14px',
          borderRadius: '6px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Table Display */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div className="skeleton" style={{ height: '180px', borderRadius: '8px' }} />
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No user records found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>User ID</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email Address</th>
                <th style={{ padding: '10px' }}>Access Role</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>#{u.id}</td>
                  <td style={{ padding: '12px 10px', color: '#fff' }}>{u.name}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      backgroundColor: u.role === 'ADMIN' ? 'rgba(167, 139, 250, 0.12)' : 'rgba(177, 199, 212, 0.12)',
                      color: u.role === 'ADMIN' ? 'var(--color-secondary)' : 'var(--color-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '50px',
                      border: u.role === 'ADMIN' ? '1px solid rgba(167, 139, 250, 0.2)' : '1px solid rgba(177, 199, 212, 0.2)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleOpenEditUser(u)} 
                        className="btn-secondary"
                        style={{ padding: '6px 10px', borderRadius: 'var(--border-radius-md)' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u)} 
                        className="btn-danger"
                        style={{ padding: '6px 10px', borderRadius: 'var(--border-radius-md)' }}
                        disabled={u.id === currentUser.id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit User Form Modal Dialog */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(94, 28, 35, 0.85)', // Burgundy backdrop
          backdropFilter: 'blur(8px)',
          zIndex: 1006,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            padding: '30px',
            position: 'relative',
            borderRadius: '12px'
          }}>
            <button onClick={() => setIsFormOpen(false)} style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%'
            }}>
              <X size={16} onClick={() => setIsFormOpen(false)} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
              {editingUser ? 'Edit User Profile' : 'Create User Account'}
            </h2>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Full name</label>
                <input 
                  type="text" 
                  required 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  placeholder="e.g. Marie Curie" 
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '10px 12px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email address</label>
                <input 
                  type="email" 
                  required 
                  value={userEmail} 
                  onChange={(e) => setUserEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '10px 12px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Account Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
                <input 
                  type="text" 
                  required 
                  value={userPassword} 
                  onChange={(e) => setUserPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '10px 12px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Access Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>System Role</label>
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value)}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Dialog Footer Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary" style={{ padding: '10px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 16px', fontWeight: 600 }}>
                  Save Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
