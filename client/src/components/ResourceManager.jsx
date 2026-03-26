import React, { useState, useEffect } from 'react';
import { getMyResources, addResource, updateResource, deleteResource } from '../services/api';

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ resourceType: '', quantity: '', unit: 'units' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      const res = await getMyResources();
      setResources(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load resources');
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await updateResource(editingId, form);
      } else {
        await addResource(form);
      }
      setForm({ resourceType: '', quantity: '', unit: 'units' });
      setEditingId(null);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving resource');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setForm({
      resourceType: resource.resourceType,
      quantity: resource.quantity,
      unit: resource.unit,
    });
    setEditingId(resource._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      fetchResources();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
      <h3>Resource Management</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <select name="resourceType" value={form.resourceType} onChange={handleChange} required>
          <option value="">Select Type</option>
          <option value="food">Food</option>
          <option value="water">Water</option>
          <option value="medical">Medical</option>
          <option value="shelter">Shelter</option>
          <option value="transport">Transport</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="unit"
          placeholder="Unit (kg, liters, etc.)"
          value={form.unit}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {editingId ? 'Update' : 'Add'} Resource
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ resourceType: '', quantity: '', unit: 'units' }); }}>
            Cancel
          </button>
        )}
      </form>

      <ul>
        {resources.map((res) => (
          <li key={res._id} style={{ marginBottom: '10px' }}>
            <strong>{res.resourceType}</strong> – {res.quantity} {res.unit}
            <button onClick={() => handleEdit(res)} style={{ marginLeft: '10px' }}>Edit</button>
            <button onClick={() => handleDelete(res._id)} style={{ marginLeft: '5px' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceManager;