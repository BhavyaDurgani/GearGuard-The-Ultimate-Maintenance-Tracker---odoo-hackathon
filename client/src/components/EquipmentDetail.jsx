import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function EquipmentDetail({ id, onClose }) {
  const [equipment, setEquipment] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get(`/equipment/${id}`).then(r => setEquipment(r.data)).catch(console.error);
    api.get(`/equipment/${id}/maintenance-requests`).then(r => setRequests(r.data)).catch(console.error);
  }, [id]);

  if (!equipment) return <div>Loading...</div>;

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #ddd', paddingTop: 12 }}>
      <button onClick={onClose} style={{ float: 'right' }}>Close</button>
      <h4>{equipment.name}</h4>
      <div>Serial: {equipment.serial_number}</div>
      <div>Category: {equipment.category}</div>
      <div>Location: {equipment.location}</div>
      <div>Status: {equipment.status}</div>

      <h5 style={{ marginTop: 12 }}>Open Requests ({requests.length})</h5>
      {requests.map(r => (
        <div key={r.id} style={{ padding: 8, border: '1px solid #eee', marginBottom: 8 }}>
          <strong>{r.subject}</strong>
          <div style={{ fontSize: 12 }}>{r.status} • {r.type}</div>
        </div>
      ))}
    </div>
  );
}
