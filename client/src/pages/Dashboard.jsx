import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import KanbanBoard from '../components/KanbanBoard';
import EquipmentDetail from '../components/EquipmentDetail';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    api.get('/requests').then(r => setRequests(r.data)).catch(() => {});
    api.get('/equipment').then(r => setEquipment(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>GearGuard</h1>
        <div>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h3>Kanban</h3>
          <KanbanBoard requests={requests} />
        </div>

        <aside style={{ width: 360 }}>
          <h3>Equipment</h3>
          <div style={{ maxHeight: 600, overflow: 'auto' }}>
            {equipment.map(eq => (
              <div key={eq.id} style={{ padding: 8, border: '1px solid #ddd', marginBottom: 8, cursor: 'pointer' }} onClick={() => setSelectedEquipment(eq.id)}>
                <strong>{eq.name}</strong>
                <div style={{ fontSize: 12 }}>{eq.serial_number}</div>
              </div>
            ))}
          </div>

          {selectedEquipment && <EquipmentDetail id={selectedEquipment} onClose={() => setSelectedEquipment(null)} />}
        </aside>
      </div>
    </div>
  );
}
