import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Edit, 
  Trash2, 
  Search, 
  UserPlus, 
  Filter,
  Mail,
  Lock,
  CheckCircle,
  XCircle 
} from 'react-feather';

const Container = styled.div`
  padding: 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  flex: 1;
  max-width: 400px;

  input {
    border: none;
    outline: none;
    padding: 5px;
    width: 100%;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background: ${props => props.variant === 'danger' ? '#dc3545' : 'var(--primary-color)'};
  color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  margin: 0 ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ color, theme }) => color || theme.colors.text.secondary};

  &:hover {
    color: ${({ hoverColor, theme }) => hoverColor || theme.colors.text.primary};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.modal};
  max-width: 500px;
  width: 90%;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  input, select {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: ${({ theme }) => theme.colors.background.main};
    color: ${({ theme }) => theme.colors.text.primary};
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }
`;

const Badge = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.size.sm};
  background-color: ${({ type, theme }) => {
    switch (type) {
      case 'admin': return theme.colors.status.error;
      case 'vendor': return theme.colors.status.success;
      case 'customer': return theme.colors.status.info;
      case 'suspended': return theme.colors.text.disabled;
      default: return theme.colors.text.disabled;
    }
  }};
  color: ${({ theme }) => theme.colors.primary.text};
`;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit', 'create', or 'delete'
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const url = modalType === 'create' 
        ? '/api/admin/users' 
        : `/api/admin/users/${selectedUser._id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchUsers();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchUsers();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          action
        })
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUsers(new Set());
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <TopBar>
        <SearchBar>
          <Search size={20} color="#666" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>

        <Button onClick={handleCreate}>
          <UserPlus size={16} />
          Add User
        </Button>
      </TopBar>

      {selectedUsers.size > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <Button 
            onClick={() => handleBulkAction('suspend')}
            variant="danger"
            style={{ marginRight: '10px' }}
          >
            Suspend Selected
          </Button>
          <Button onClick={() => handleBulkAction('activate')}>
            Activate Selected
          </Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(new Set(users.map(u => u._id)));
                  } else {
                    setSelectedUsers(new Set());
                  }
                }}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user._id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedUsers);
                    if (e.target.checked) {
                      newSelected.add(user._id);
                    } else {
                      newSelected.delete(user._id);
                    }
                    setSelectedUsers(newSelected);
                  }}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Badge type={user.role}>{user.role}</Badge>
              </td>
              <td>
                {user.status === 'active' ? (
                  <CheckCircle size={16} color="#28a745" />
                ) : (
                  <XCircle size={16} color="#dc3545" />
                )}
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <ActionButton onClick={() => handleEdit(user)} color="#007bff">
                  <Edit size={16} />
                </ActionButton>
                <ActionButton onClick={() => handleDelete(user)} color="#dc3545">
                  <Trash2 size={16} />
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && (
        <>
          <Overlay onClick={() => setShowModal(false)} />
          <Modal>
            {modalType === 'delete' ? (
              <>
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete {selectedUser.name}?</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <Button variant="danger" onClick={handleDeleteConfirm}>
                    Delete
                  </Button>
                  <Button onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3>{modalType === 'create' ? 'Create User' : 'Edit User'}</h3>
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <label>Name</label>
                    <input
                      name="name"
                      defaultValue={selectedUser?.name}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedUser?.email}
                      required
                    />
                  </FormGroup>
                  {modalType === 'create' && (
                    <FormGroup>
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        required
                      />
                    </FormGroup>
                  )}
                  <FormGroup>
                    <label>Role</label>
                    <select 
                      name="role"
                      defaultValue={selectedUser?.role || 'customer'}
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Status</label>
                    <select 
                      name="status"
                      defaultValue={selectedUser?.status || 'active'}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </FormGroup>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <Button type="submit">
                      {modalType === 'create' ? 'Create' : 'Save'}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Modal>
        </>
      )}
    </Container>
  );
}

export default UserManagement; 