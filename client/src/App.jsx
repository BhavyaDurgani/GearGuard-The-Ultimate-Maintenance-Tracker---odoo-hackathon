import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// API Configuration
const API_URL = 'http://localhost:4000/api';

const api = {
  async request(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('token');
          window.location.href = '/login';
        }
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  get(endpoint) {
    return this.request(endpoint);
  },
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('technician');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password, name, role });
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setPassword('');
      } else {
        const data = await api.post('/auth/login', { email, password });
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)'}}>
      <div style={{background:'white',padding:48,borderRadius:20,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:64,marginBottom:16}}>⚙️</div>
          <h1 style={{fontSize:32,fontWeight:800,color:'#0f172a',marginBottom:8}}>GearGuard</h1>
          <p style={{color:'#64748b',fontSize:15}}>Equipment Maintenance Management</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:20}}>
          {isRegister && (
            <>
              <div>
                <label style={{display:'block',fontWeight:600,fontSize:14,color:'#1e293b',marginBottom:8}}>Full Name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe" required
                  style={{width:'100%',padding:'14px 16px',border:'2px solid #e2e8f0',borderRadius:10,fontSize:15}} />
              </div>
              
              <div>
                <label style={{display:'block',fontWeight:600,fontSize:14,color:'#1e293b',marginBottom:8}}>Role</label>
                <select value={role} onChange={e=>setRole(e.target.value)}
                  style={{width:'100%',padding:'14px 16px',border:'2px solid #e2e8f0',borderRadius:10,fontSize:15}}>
                  <option value="technician">Technician</option>
                  <option value="manager">Manager</option>
                  <option value="requester">Employee/Requester</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}
          
          <div>
            <label style={{display:'block',fontWeight:600,fontSize:14,color:'#1e293b',marginBottom:8}}>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your.email@company.com" required
              style={{width:'100%',padding:'14px 16px',border:'2px solid #e2e8f0',borderRadius:10,fontSize:15}} />
          </div>
          
          <div>
            <label style={{display:'block',fontWeight:600,fontSize:14,color:'#1e293b',marginBottom:8}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required
              style={{width:'100%',padding:'14px 16px',border:'2px solid #e2e8f0',borderRadius:10,fontSize:15}} />
          </div>
          
          {error && (
            <div style={{padding:12,background:'#fef2f2',color:'#dc2626',borderRadius:8,fontSize:14}}>
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading}
            style={{padding:'14px 24px',background:'#0f172a',color:'white',border:'none',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer'}}>
            {loading ? '🔄 Please wait...' : (isRegister ? 'Create Account' : 'Sign In →')}
          </button>
          
          <button type="button" onClick={()=>setIsRegister(!isRegister)}
            style={{padding:'10px',background:'transparent',color:'#0f172a',border:'none',cursor:'pointer',fontSize:14}}>
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentRequests, setEquipmentRequests] = useState([]);
  
  // Request form data
  const [formData, setFormData] = useState({
    subject: '',
    type: 'corrective',
    equipment_id: '',
    team_id: '',
    description: '',
    scheduled_date: ''
  });

  // Equipment form data
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    serial_number: '',
    category: '',
    department: '',
    location: '',
    maintenance_team_id: '',
    purchase_date: '',
    warranty_until: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equipmentData, requestsData, teamsData] = await Promise.all([
        api.get('/equipment'),
        api.get('/requests'),
        api.get('/teams')
      ]);
      setEquipment(equipmentData);
      setRequests(requestsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const moveRequest = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/move-status`, { newStatus: status });
      
      if (status === 'scrap') {
        const request = requests.find(r => r.id === id);
        if (request && request.equipment_id) {
          await api.patch(`/equipment/${request.equipment_id}/scrap`);
        }
      }
      
      await loadData();
    } catch (error) {
      alert('Failed to update request: ' + error.message);
    }
  };

  const createRequest = async () => {
    if (!formData.subject || !formData.equipment_id) {
      alert('Please fill required fields');
      return;
    }
    
    try {
      const eq = equipment.find(e => e.id === formData.equipment_id);
      const requestData = {
        ...formData,
        team_id: eq?.maintenance_team_id || formData.team_id
      };
      
      await api.post('/requests', requestData);
      setShowModal(false);
      setFormData({subject:'',type:'corrective',equipment_id:'',team_id:'',description:'',scheduled_date:''});
      await loadData();
    } catch (error) {
      alert('Failed to create request: ' + error.message);
    }
  };

  const createEquipment = async () => {
    if (!equipmentFormData.name || !equipmentFormData.maintenance_team_id) {
      alert('Please fill required fields (Name and Maintenance Team)');
      return;
    }
    
    try {
      await api.post('/equipment', equipmentFormData);
      setShowEquipmentModal(false);
      setEquipmentFormData({
        name: '',
        serial_number: '',
        category: '',
        department: '',
        location: '',
        maintenance_team_id: '',
        purchase_date: '',
        warranty_until: ''
      });
      alert('Equipment created successfully!');
      await loadData();
    } catch (error) {
      alert('Failed to create equipment: ' + error.message);
    }
  };

  const viewEquipmentMaintenance = async (equipmentId) => {
    try {
      const data = await api.get(`/equipment/${equipmentId}/maintenance-requests`);
      setEquipmentRequests(data);
      setSelectedEquipment(equipmentId);
    } catch (error) {
      alert('Failed to load equipment requests: ' + error.message);
    }
  };

  const colors = {
    new: {bg:'#3b82f6', light:'#eff6ff', border:'#93c5fd'},
    in_progress: {bg:'#f59e0b', light:'#fffbeb', border:'#fcd34d'},
    repaired: {bg:'#10b981', light:'#f0fdf4', border:'#86efac'},
    scrap: {bg:'#ef4444', light:'#fef2f2', border:'#fca5a5'}
  };

  const isOverdue = (scheduledDate, status) => {
    if (!scheduledDate || status === 'repaired' || status === 'scrap') return false;
    return new Date(scheduledDate) < new Date();
  };

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (formData.equipment_id) {
      const eq = equipment.find(e => e.id === formData.equipment_id);
      if (eq && eq.maintenance_team_id) {
        setFormData(prev => ({ ...prev, team_id: eq.maintenance_team_id }));
      }
    }
  }, [formData.equipment_id, equipment]);

  const canCreateRequest = user && ['manager', 'admin', 'requester'].includes(user.role);
  const canAddEquipment = user && ['manager', 'admin'].includes(user.role);

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <header style={{background:'white',padding:'18px 36px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e2e8f0'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:36}}>⚙️</span>
          <div>
            <div style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>GearGuard</div>
            <div style={{fontSize:12,color:'#64748b',fontWeight:500}}>
              {user ? `${user.name} (${user.role})` : 'Maintenance System'}
            </div>
          </div>
        </div>
        
        <div style={{display:'flex',gap:6}}>
          {[['kanban','📋','Kanban'],['calendar','📅','Calendar'],['equipment','🔧','Equipment'],['teams','👥','Teams']].map(([v,icon,label]) => (
            <button key={v} onClick={()=>setView(v)}
              style={{padding:'10px 18px',background:view===v?'#0f172a':'white',color:view===v?'white':'#475569',border:view===v?'none':'1px solid #e2e8f0',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:14,display:'flex',alignItems:'center',gap:8}}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        <button onClick={()=>{sessionStorage.clear();navigate('/login');}}
          style={{padding:'10px 20px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:14}}>
          🚪 Logout
        </button>
      </header>

      <main style={{padding:'28px 36px',maxWidth:1600,margin:'0 auto'}}>
        {view === 'kanban' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <div>
                <h2 style={{fontSize:28,fontWeight:800,color:'#0f172a',marginBottom:4}}>Maintenance Board</h2>
                <p style={{fontSize:14,color:'#64748b'}}>Manage and track all maintenance requests</p>
              </div>
              {canCreateRequest && (
                <button onClick={()=>setShowModal(true)}
                  style={{padding:'12px 24px',background:'#0f172a',color:'white',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:18}}>+</span> New Request
                </button>
              )}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
              {['new','in_progress','repaired','scrap'].map(status => {
                const items = requests.filter(r=>r.status===status);
                const c = colors[status];
                
                return (
                  <div key={status} style={{background:'white',borderRadius:12,overflow:'hidden',border:'1px solid #e2e8f0'}}>
                    <div style={{padding:'16px 20px',background:c.light,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`3px solid ${c.bg}`}}>
                      <span style={{fontWeight:700,fontSize:13,color:'#1e293b',textTransform:'uppercase',letterSpacing:'0.5px'}}>{status.replace('_',' ')}</span>
                      <span style={{minWidth:32,height:32,borderRadius:8,background:c.bg,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800}}>{items.length}</span>
                    </div>

                    <div style={{padding:'16px 12px',display:'flex',flexDirection:'column',gap:12,maxHeight:'calc(100vh - 280px)',overflowY:'auto'}}>
                      {items.length === 0 ? (
                        <div style={{textAlign:'center',color:'#94a3b8',padding:32,fontSize:14}}>No requests</div>
                      ) : items.map(req => {
                        const eq = equipment.find(e=>e.id===req.equipment_id);
                        const team = teams.find(t=>t.id===req.team_id);
                        const overdue = isOverdue(req.scheduled_date, req.status);
                        
                        return (
                          <div key={req.id} style={{background:'white',border:`1px solid ${overdue ? '#ef4444' : c.border}`,borderLeft:`4px solid ${overdue ? '#ef4444' : c.bg}`,borderRadius:10,padding:16,cursor:'pointer',transition:'all 0.2s'}}
                            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';}}
                            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                            
                            {overdue && (
                              <div style={{background:'#fef2f2',color:'#dc2626',padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700,marginBottom:8,display:'inline-block'}}>
                                ⚠️ OVERDUE
                              </div>
                            )}
                            
                            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10,color:'#1e293b'}}>{req.subject}</h4>
                            
                            <div style={{marginBottom:10}}>
                              <span style={{display:'inline-block',padding:'5px 10px',borderRadius:6,fontSize:11,background:req.type==='corrective'?'#fef2f2':'#eff6ff',color:req.type==='corrective'?'#dc2626':'#2563eb',fontWeight:700,border:`1px solid ${req.type==='corrective'?'#fecaca':'#bfdbfe'}`}}>
                                {req.type==='corrective'?'🔧 CORRECTIVE':'🗓️ PREVENTIVE'}
                              </span>
                            </div>

                            {eq && (
                              <div style={{marginBottom:8,padding:8,background:'#f8fafc',borderRadius:6}}>
                                <div style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>{eq.name}</div>
                                <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{eq.serial_number}</div>
                              </div>
                            )}

                            {team && <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>👥 {team.name}</div>}
                            {req.scheduled_date && <div style={{fontSize:12,color:'#64748b'}}>📅 {new Date(req.scheduled_date).toLocaleDateString()}</div>}

                            <div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap'}}>
                              {status==='new' && (
                                <button onClick={(e)=>{e.stopPropagation();moveRequest(req.id,'in_progress');}} style={{padding:'6px 12px',background:'#3b82f6',color:'white',border:'none',borderRadius:6,fontSize:11,cursor:'pointer',fontWeight:700}}>▶ START</button>
                              )}
                              {(status==='new' || status==='in_progress') && (
                                <button onClick={(e)=>{e.stopPropagation();moveRequest(req.id,'repaired');}} style={{padding:'6px 12px',background:'#10b981',color:'white',border:'none',borderRadius:6,fontSize:11,cursor:'pointer',fontWeight:700}}>✓ COMPLETE</button>
                              )}
                              {status!=='scrap' && (
                                <button onClick={(e)=>{e.stopPropagation();if(confirm('Mark equipment as scrap? This will mark the equipment as unusable.'))moveRequest(req.id,'scrap');}} style={{padding:'6px 12px',background:'#ef4444',color:'white',border:'none',borderRadius:6,fontSize:11,cursor:'pointer',fontWeight:700}}>🗑 SCRAP</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'equipment' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <div>
                <h2 style={{fontSize:28,fontWeight:800,color:'#0f172a'}}>🔧 Equipment Assets</h2>
                <p style={{fontSize:14,color:'#64748b',marginTop:4}}>Manage all machines and equipment</p>
              </div>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <input 
                  type="text" 
                  placeholder="🔍 Search equipment..." 
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                  style={{padding:'12px 20px',border:'2px solid #e2e8f0',borderRadius:10,fontSize:14,width:300}}
                />
                {canAddEquipment && (
                  <button onClick={()=>setShowEquipmentModal(true)}
                    style={{padding:'12px 24px',background:'#0f172a',color:'white',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',gap:8,whiteSpace:'nowrap'}}>
                    <span style={{fontSize:18}}>+</span> Add Equipment
                  </button>
                )}
              </div>
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
              {filteredEquipment.map(eq => {
                const eqReqs = requests.filter(r=>r.equipment_id===eq.id);
                const open = eqReqs.filter(r=>r.status==='new'||r.status==='in_progress');
                const isScrap = eq.status === 'scrapped';
                
                return (
                  <div key={eq.id} style={{background:'white',borderRadius:12,padding:24,border:isScrap?'2px solid #ef4444':'1px solid #e2e8f0',transition:'all 0.2s',opacity:isScrap?0.6:1}}
                    onMouseEnter={e=>{if(!isScrap){e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';}}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                    
                    {isScrap && (
                      <div style={{background:'#fef2f2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:16,fontSize:13,fontWeight:700,textAlign:'center'}}>
                        ⚠️ SCRAPPED / UNUSABLE
                      </div>
                    )}
                    
                    <h3 style={{fontSize:18,fontWeight:800,marginBottom:6,color:'#0f172a'}}>{eq.name}</h3>
                    <div style={{fontSize:13,color:'#94a3b8',marginBottom:16,fontWeight:600}}>SN: {eq.serial_number}</div>
                    
                    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
                      <div style={{fontSize:14,color:'#475569',display:'flex',alignItems:'center',gap:8}}>
                        <span>📍</span> {eq.location}
                      </div>
                      <div style={{fontSize:14,color:'#475569',display:'flex',alignItems:'center',gap:8}}>
                        <span>📦</span> {eq.category}
                      </div>
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,padding:16,background:'#f8fafc',borderRadius:10,marginBottom:18,border:'1px solid #e2e8f0'}}>
                      <div>
                        <div style={{fontSize:12,color:'#64748b',fontWeight:600,marginBottom:4}}>Open Requests</div>
                        <div style={{fontSize:28,fontWeight:800,color:open.length>0?'#f59e0b':'#10b981'}}>{open.length}</div>
                      </div>
                      <div>
                        <div style={{fontSize:12,color:'#64748b',fontWeight:600,marginBottom:4}}>Total Requests</div>
                        <div style={{fontSize:28,fontWeight:800,color:'#0f172a'}}>{eqReqs.length}</div>
                      </div>
                    </div>

                    <button onClick={()=>viewEquipmentMaintenance(eq.id)} style={{width:'100%',padding:12,background:'#0f172a',color:'white',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:14,position:'relative'}}>
                      🔧 Maintenance History
                      {open.length > 0 && (
                        <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'#ef4444',color:'white',borderRadius:12,padding:'4px 10px',fontSize:12,fontWeight:800}}>
                          {open.length}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'teams' && (
          <div>
            <h2 style={{fontSize:28,fontWeight:800,marginBottom:24,color:'#0f172a'}}>👥 Maintenance Teams</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(400px,1fr))',gap:20}}>
              {teams.map(team => {
                const teamReqs = requests.filter(r=>r.team_id===team.id);
                const active = teamReqs.filter(r=>r.status==='new'||r.status==='in_progress');
                const teamEq = equipment.filter(e=>e.maintenance_team_id===team.id);
                
                return (
                  <div key={team.id} style={{background:'white',borderRadius:12,padding:28,border:'1px solid #e2e8f0'}}>
                    <h3 style={{fontSize:20,fontWeight:800,marginBottom:8,color:'#0f172a'}}>👥 {team.name}</h3>
                    <p style={{fontSize:14,color:'#64748b',marginBottom:24}}>{team.description}</p>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
                      <div style={{padding:20,background:'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)',borderRadius:10,textAlign:'center',border:'1px solid #fde68a'}}>
                        <div style={{fontSize:36,fontWeight:800,color:'#f59e0b',marginBottom:4}}>{active.length}</div>
                        <div style={{fontSize:12,color:'#92400e',fontWeight:700}}>ACTIVE TASKS</div>
                      </div>
                      <div style={{padding:20,background:'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',borderRadius:10,textAlign:'center',border:'1px solid #bfdbfe'}}>
                        <div style={{fontSize:36,fontWeight:800,color:'#3b82f6',marginBottom:4}}>{teamEq.length}</div>
                        <div style={{fontSize:12,color:'#1e40af',fontWeight:700}}>EQUIPMENT</div>
                      </div>
                    </div>

                    <div>
                      <div style={{fontWeight:700,marginBottom:12,color:'#0f172a'}}>Recent Activity</div>
                      {active.length===0 ? (
                        <div style={{textAlign:'center',color:'#94a3b8',padding:20,background:'#f8fafc',borderRadius:8,fontSize:14}}>No active requests</div>
                      ) : active.slice(0,3).map(req => (
                        <div key={req.id} style={{padding:12,background:'#f8fafc',borderRadius:8,marginBottom:8,border:'1px solid #e2e8f0'}}>
                          <div style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>{req.subject}</div>
                          <div style={{fontSize:12,color:colors[req.status].bg,marginTop:4,fontWeight:600}}>{req.status.toUpperCase().replace('_',' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div>
            <h2 style={{fontSize:28,fontWeight:800,marginBottom:24,color:'#0f172a'}}>📅 Preventive Maintenance Calendar</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
              {requests.filter(r=>r.type==='preventive'&&r.scheduled_date).sort((a,b)=>new Date(a.scheduled_date)-new Date(b.scheduled_date)).map(req => {
                const eq = equipment.find(e=>e.id===req.equipment_id);
                const isPast = new Date(req.scheduled_date) < new Date();
                const overdue = isPast && req.status !== 'repaired' && req.status !== 'scrap';
                
                return (
                  <div key={req.id} style={{padding:20,background:overdue?'#fef2f2':'#eff6ff',borderRadius:10,border:`2px solid ${overdue?'#fca5a5':'#93c5fd'}`}}>
                    <div style={{fontSize:16,fontWeight:800,marginBottom:10,color:overdue?'#dc2626':'#2563eb'}}>
                      {new Date(req.scheduled_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:6,color:'#1e293b'}}>{req.subject}</div>
                    {eq && <div style={{fontSize:13,color:'#64748b'}}>{eq.name}</div>}
                    <div style={{marginTop:12,display:'inline-block',padding:'5px 12px',borderRadius:6,background:colors[req.status].bg,color:'white',fontSize:11,fontWeight:700}}>
                      {req.status.replace('_',' ').toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Request Modal */}
      {showModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(15,23,42,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={()=>setShowModal(false)}>
          <div style={{background:'white',borderRadius:16,width:'100%',maxWidth:600,maxHeight:'90vh',overflowY:'auto',padding:32}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>🔧 Create Maintenance Request</h2>
              <button onClick={()=>setShowModal(false)} style={{fontSize:28,background:'none',border:'none',cursor:'pointer',color:'#94a3b8',lineHeight:1}}>×</button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Request Type *</label>
                <select value={formData.type} onChange={e=>setFormData({...formData,type:e.target.value})}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14,background:'white'}}>
                  <option value="corrective">🔧 Corrective (Breakdown/Repair)</option>
                  <option value="preventive">🗓️ Preventive (Scheduled)</option>
                </select>
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Subject *</label>
                <input type="text" value={formData.subject} onChange={e=>setFormData({...formData,subject:e.target.value})} placeholder="Brief description of the issue"
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Equipment * (Team auto-fills)</label>
                <select value={formData.equipment_id} onChange={e=>setFormData({...formData,equipment_id:e.target.value})}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14,background:'white'}}>
                  <option value="">Select equipment...</option>
                  {equipment.filter(e=>e.status==='active').map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Team (Auto-filled from equipment)</label>
                <select value={formData.team_id} onChange={e=>setFormData({...formData,team_id:e.target.value})}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14,background:'#f8fafc'}} disabled>
                  <option value="">Select team...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {formData.type === 'preventive' && (
                <div>
                  <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Scheduled Date</label>
                  <input type="date" value={formData.scheduled_date} onChange={e=>setFormData({...formData,scheduled_date:e.target.value})}
                    style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
                </div>
              )}

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Description</label>
                <textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} placeholder="Detailed description..." rows={4}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14,fontFamily:'inherit',resize:'vertical'}} />
              </div>

              <div style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:8}}>
                <button onClick={()=>setShowModal(false)} style={{padding:'12px 24px',background:'#f1f5f9',color:'#475569',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>
                  Cancel
                </button>
                <button onClick={createRequest} style={{padding:'12px 24px',background:'#0f172a',color:'white',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>
                  Create Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(15,23,42,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={()=>setShowEquipmentModal(false)}>
          <div style={{background:'white',borderRadius:16,width:'100%',maxWidth:700,maxHeight:'90vh',overflowY:'auto',padding:32}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>➕ Add New Equipment</h2>
              <button onClick={()=>setShowEquipmentModal(false)} style={{fontSize:28,background:'none',border:'none',cursor:'pointer',color:'#94a3b8',lineHeight:1}}>×</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div style={{gridColumn:'1 / -1'}}>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Equipment Name *</label>
                <input type="text" value={equipmentFormData.name} onChange={e=>setEquipmentFormData({...equipmentFormData,name:e.target.value})} 
                  placeholder="e.g., CNC Machine 01, Lathe, Printer"
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Serial Number</label>
                <input type="text" value={equipmentFormData.serial_number} onChange={e=>setEquipmentFormData({...equipmentFormData,serial_number:e.target.value})} 
                  placeholder="SN-12345"
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Category</label>
                <input type="text" value={equipmentFormData.category} onChange={e=>setEquipmentFormData({...equipmentFormData,category:e.target.value})} 
                  placeholder="e.g., Machinery, IT, HVAC"
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Department</label>
                <input type="text" value={equipmentFormData.department} onChange={e=>setEquipmentFormData({...equipmentFormData,department:e.target.value})} 
                  placeholder="e.g., Production, Office"
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Location</label>
                <input type="text" value={equipmentFormData.location} onChange={e=>setEquipmentFormData({...equipmentFormData,location:e.target.value})} 
                  placeholder="e.g., Plant 1, Floor 2"
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div style={{gridColumn:'1 / -1'}}>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Maintenance Team *</label>
                <select value={equipmentFormData.maintenance_team_id} onChange={e=>setEquipmentFormData({...equipmentFormData,maintenance_team_id:e.target.value})}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14,background:'white'}}>
                  <option value="">Select maintenance team...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Purchase Date</label>
                <input type="date" value={equipmentFormData.purchase_date} onChange={e=>setEquipmentFormData({...equipmentFormData,purchase_date:e.target.value})}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>

              <div>
                <label style={{display:'block',fontWeight:700,fontSize:14,color:'#1e293b',marginBottom:8}}>Warranty Until</label>
                <input type="date" value={equipmentFormData.warranty_until} onChange={e=>setEquipmentFormData({...equipmentFormData,warranty_until:e.target.value})}
                  style={{width:'100%',padding:12,border:'2px solid #e2e8f0',borderRadius:8,fontSize:14}} />
              </div>
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:24,paddingTop:24,borderTop:'1px solid #e2e8f0'}}>
              <button onClick={()=>setShowEquipmentModal(false)} style={{padding:'12px 24px',background:'#f1f5f9',color:'#475569',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>
                Cancel
              </button>
              <button onClick={createEquipment} style={{padding:'12px 24px',background:'#0f172a',color:'white',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Maintenance History Modal */}
      {selectedEquipment && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(15,23,42,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={()=>setSelectedEquipment(null)}>
          <div style={{background:'white',borderRadius:16,width:'100%',maxWidth:700,maxHeight:'90vh',overflowY:'auto',padding:32}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>
                🔧 Maintenance History
                <span style={{marginLeft:12,background:'#f0f9ff',color:'#0369a1',padding:'6px 12px',borderRadius:8,fontSize:16}}>
                  {equipmentRequests.filter(r=>r.status==='new'||r.status==='in_progress').length} Open
                </span>
              </h2>
              <button onClick={()=>setSelectedEquipment(null)} style={{fontSize:28,background:'none',border:'none',cursor:'pointer',color:'#94a3b8',lineHeight:1}}>×</button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {equipmentRequests.length === 0 ? (
                <div style={{textAlign:'center',color:'#94a3b8',padding:40,fontSize:14}}>No maintenance requests found</div>
              ) : equipmentRequests.map(req => {
                const c = colors[req.status];
                const overdue = isOverdue(req.scheduled_date, req.status);
                
                return (
                  <div key={req.id} style={{padding:16,background:c.light,border:`2px solid ${overdue?'#ef4444':c.border}`,borderRadius:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:8}}>
                      <div>
                        <h4 style={{fontSize:16,fontWeight:700,color:'#1e293b',marginBottom:4}}>{req.subject}</h4>
                        <div style={{fontSize:12,color:'#64748b'}}>
                          {req.type === 'corrective' ? '🔧 Corrective' : '🗓️ Preventive'}
                          {req.scheduled_date && ` • ${new Date(req.scheduled_date).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div style={{padding:'4px 10px',background:c.bg,color:'white',borderRadius:6,fontSize:11,fontWeight:700}}>
                        {req.status.toUpperCase().replace('_',' ')}
                      </div>
                    </div>
                    {req.description && (
                      <p style={{fontSize:13,color:'#475569',marginTop:8}}>{req.description}</p>
                    )}
                    {overdue && (
                      <div style={{marginTop:8,padding:'6px 10px',background:'#fef2f2',color:'#dc2626',borderRadius:6,fontSize:11,fontWeight:700}}>
                        ⚠️ OVERDUE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        input:focus, select:focus, textarea:focus { 
          outline:none; 
          border-color:#3b82f6 !important; 
          box-shadow:0 0 0 3px rgba(59,130,246,0.1); 
        }
        button:hover { opacity:0.9; }
        button:active { transform:scale(0.98); }
        button:disabled { opacity:0.5; cursor:not-allowed; }
        ::-webkit-scrollbar { width:10px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:5px; }
        ::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  return sessionStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}