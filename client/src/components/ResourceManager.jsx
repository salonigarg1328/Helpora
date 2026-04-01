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
    <div>
      <h3 className="section-title panel-title">Resource Management</h3>
      {error && <p className="feedback feedback-error">{error}</p>}

      <form onSubmit={handleSubmit} className="form-grid section-gap-bottom">
        <div className="field">
          <label>Resource Type</label>
          <select className="select" name="resourceType" value={form.resourceType} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medical">Medical</option>
            <option value="shelter">Shelter</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field">
          <label>Quantity</label>
          <input
            className="input"
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label>Unit</label>
          <input
            className="input"
            type="text"
            name="unit"
            placeholder="kg, liters, kits"
            value={form.unit}
            onChange={handleChange}
          />
        </div>
        <div className="inline-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {editingId ? 'Update' : 'Add'} Resource
          </button>
          {editingId && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ resourceType: '', quantity: '', unit: 'units' });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {resources.length === 0 ? (
        <p>No resources added yet.</p>
      ) : (
        <ul className="report-list">
          {resources.map((res) => (
            <li key={res._id} className="report-card">
              <p><strong>{res.resourceType}</strong></p>
              <p>{res.quantity} {res.unit}</p>
              <div className="inline-actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(res)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(res._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourceManager;