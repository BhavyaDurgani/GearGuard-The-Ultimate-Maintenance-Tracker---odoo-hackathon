import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../api/axios';

const columns = [
  { id: 'new', title: 'New' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'repaired', title: 'Repaired' },
  { id: 'scrap', title: 'Scrap' }
];

export default function KanbanBoard({ requests }) {
  const grouped = columns.reduce((acc, col) => ({ ...acc, [col.id]: requests.filter(r => r.status === col.id) }), {});

  async function onDragEnd(result) {
    if (!result.destination) return;
    const reqId = result.draggableId;
    const newStatus = result.destination.droppableId;
    try {
      await api.patch(`/requests/${reqId}/move-status`, { newStatus });
      // simple approach: reload page to refresh data
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Could not move request');
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: 12 }}>
        {columns.map(col => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{ background: '#f6f6f6', padding: 8, width: 300, minHeight: 400 }}>
                <h4>{col.title}</h4>
                {grouped[col.id].map((req, idx) => (
                  <Draggable key={req.id} draggableId={req.id} index={idx}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ padding: 8, background: '#fff', marginBottom: 8 }}>
                        <strong>{req.subject}</strong>
                        <div style={{ fontSize: 12 }}>{req.type} • {req.equipment_id ? 'Eq: ' + req.equipment_id : ''}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
