import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, KanbanSquare, ListTodo, FileEdit, Users, Settings, Bell, Search, Plus, Filter, MoreVertical,
  CheckCircle2, Clock, AlertCircle, FileText, BarChart3, Paperclip, CheckSquare, Target, Image as ImageIcon,
  AlertTriangle, Zap, XCircle, ShieldCheck, Layout, Loader2
} from 'lucide-react';

// URL ของ Google Apps Script Web App ที่ได้จากการ Deploy
const API_URL = 'https://script.google.com/macros/s/AKfycby6j9tUrUE948IhRFbYBcGyJT2h7AzOPp9ZjyfQdKxK1Fw0ypoNH0jBUAx4b42D4luR/exec';

const currentUser = {
  id: 'u_001',
  name: 'Airada S.',
  email: 'airada.s@owndays.com',
  role: 'SuperAdmin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Airada&backgroundColor=1e293b',
};

const STAGES = ['Requested', 'Unassigned', 'In Design', 'Reviewing', 'Editing', 'Approved', 'Published'];

const ASSET_SIZES = {
  'Social Media': [
    { label: 'IG / FB Square', ratio: '1:1', res: '1080x1080 px' },
    { label: 'IG Portrait', ratio: '4:5', res: '1080x1350 px' },
    { label: 'Story / Reels / TikTok', ratio: '9:16', res: '1080x1920 px' },
  ],
  'Web & Display Ads': [
    { label: 'Hero Banner (Desktop)', ratio: 'Widescreen', res: '1920x800 px' },
    { label: 'Hero Banner (Mobile)', ratio: 'Square-ish', res: '800x800 px' },
  ],
  'Video Production': [
    { label: 'YouTube / TVC', ratio: '16:9', res: '1920x1080 px' },
    { label: 'Vertical Short Video', ratio: '9:16', res: '1080x1920 px' },
  ]
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  // ดึงข้อมูลจาก Google Sheets เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}?action=getTasks`);
        const result = await response.json();
        if (result.success && result.data) {
          // แปลงชื่อ Key ให้ตรงกับที่ Frontend ใช้
          const formattedTasks = result.data.map(row => ({
            id: row.TaskID,
            title: row.Title,
            country: row.Country,
            status: row.Status,
            assignee: row.Assignee || 'Unassigned',
            deadline: row.Deadline,
            urgency: row.Urgency,
            quality: row.QualityScore || 0
          }));
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return selectedCountry === 'ALL' ? tasks : tasks.filter(t => t.country === selectedCountry);
  }, [tasks, selectedCountry]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white mr-3 shadow-lg shadow-blue-500/20">O</div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">OWNDAYS</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Marketing Space</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Workspace</p>
          <nav className="space-y-1 mb-8">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <SidebarItem icon={KanbanSquare} label="Graphic Queue" active={activeView === 'board'} onClick={() => setActiveView('board')} />
            <SidebarItem icon={ListTodo} label="Master List" active={activeView === 'table'} onClick={() => setActiveView('table')} />
            <SidebarItem icon={FileEdit} label="New Brief" active={activeView === 'brief'} onClick={() => setActiveView('brief')} />
          </nav>

          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Administration</p>
          <nav className="space-y-1">
            <SidebarItem icon={BarChart3} label="Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
            <SidebarItem icon={Users} label="Team & Roles" active={activeView === 'team'} onClick={() => setActiveView('team')} />
            <SidebarItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800" alt="Profile" />
            <div className="truncate">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 font-medium truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-slate-800 capitalize hidden md:block">
              {activeView.replace('-', ' ')}
            </h2>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            
            <div className="flex items-center gap-1 bg-slate-100/50 border border-slate-200 rounded-lg p-1">
              {['ALL', 'TH', 'MY', 'KH'].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedCountry === c ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search campaigns..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-500 outline-none font-medium"/>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={() => setActiveView('brief')} className="bg-black text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative scroll-smooth bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="font-bold animate-pulse">Syncing with Google Sheets...</p>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView tasks={filteredTasks} />}
              {activeView === 'board' && <BoardView tasks={filteredTasks} setTasks={setTasks} />}
              {activeView === 'table' && <TableView tasks={filteredTasks} />}
              {activeView === 'brief' && <NotionBriefBuilder setActiveView={setActiveView} setTasks={setTasks} />}
              {activeView === 'team' && <TeamAdminView />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon className="w-4 h-4" />{label}
    </button>
  );
}

function DashboardView({ tasks }) {
  const stats = [
    { label: 'Total Active', value: tasks.filter(t => t.status !== 'Published').length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { label: 'Urgent', value: tasks.filter(t => t.urgency === 'Urgent' || t.urgency === 'Emergency').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    { label: 'Needs Review', value: tasks.filter(t => t.status === 'Reviewing').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'Published').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Good afternoon, Airada.</h1>
          <p className="text-slate-300 max-w-lg">Workspace is synced. You have <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded">{stats[1].value}</span> urgent requests requiring your attention today.</p>
        </div>
        <Zap className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}><stat.icon className="w-7 h-7" /></div>
            <div>
              <p className="text-3xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardView({ tasks, setTasks }) {
  // ฟังก์ชันย้ายสถานะและอัปเดต Google Sheets
  const moveTask = async (taskId, direction) => {
    let newStatus = '';
    
    // 1. อัปเดต UI ทันที (Optimistic UI) ให้ดูไว
    setTasks(currentTasks => currentTasks.map(t => {
      if (t.id === taskId) {
        const currentIndex = STAGES.indexOf(t.status);
        let newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < STAGES.length) {
          newStatus = STAGES[newIndex];
          return { ...t, status: newStatus };
        }
      }
      return t;
    }));

    // 2. ส่งข้อมูลไปอัปเดตบน Google Sheets เบื้องหลัง
    if (newStatus) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateStatus',
            taskId: taskId,
            newStatus: newStatus,
            userId: currentUser.id
          })
        });
      } catch (error) {
        console.error("Failed to update status on server:", error);
      }
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'Emergency': return 'bg-red-500 text-white animate-pulse border-red-600 shadow-sm shadow-red-200';
      case 'Urgent': return 'bg-orange-500 text-white border-orange-600 shadow-sm';
      case 'High': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in">
      <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">Graphic Queue</h2></div>
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start snap-x">
        {STAGES.map(stage => {
          const stageTasks = tasks.filter(t => t.status === stage);
          return (
            <div key={stage} className="bg-slate-200/50 rounded-2xl w-80 shrink-0 flex flex-col border border-slate-200/60 max-h-full snap-center">
              <div className="p-4 border-b border-slate-200/60 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">{stage}</h3>
                <span className="bg-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm text-slate-600">{stageTasks.length}</span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {stageTasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded shadow-sm">{task.country}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${getUrgencyColor(task.urgency)}`}>{task.urgency}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{task.id}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-4">{task.title}</h4>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Clock className="w-3.5 h-3.5" /> {task.deadline}</div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, -1); }} className="p-1 text-slate-400 hover:text-blue-600 rounded bg-slate-50 border" disabled={stage === STAGES[0]}>←</button>
                        <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 1); }} className="p-1 text-slate-400 hover:text-blue-600 rounded bg-slate-50 border" disabled={stage === STAGES[STAGES.length-1]}>→</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableView({ tasks }) {
  return (
    <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center"><h2 className="text-xl font-bold">Master List</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-bold">
              <th className="p-4 pl-6">ID</th><th className="p-4">Campaign</th><th className="p-4">Country</th><th className="p-4">Stage</th><th className="p-4">Assignee</th><th className="p-4 pr-6">Deadline</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 pl-6 text-slate-500 font-bold">{task.id}</td>
                <td className="p-4 font-bold text-slate-800">{task.title}</td>
                <td className="p-4"><span className="text-[10px] font-black bg-slate-800 text-white px-2 py-1 rounded shadow-sm">{task.country}</span></td>
                <td className="p-4 font-bold text-slate-600">{task.status}</td>
                <td className="p-4 font-medium text-slate-600">{task.assignee}</td>
                <td className="p-4 font-bold text-slate-600">{task.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotionBriefBuilder({ setActiveView, setTasks }) {
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [headline, setHeadline] = useState('');
  const [deadline, setDeadline] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [country, setCountry] = useState('Thailand (TH)');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checks = {
    title: title.length > 5,
    objective: objective.length > 10,
    headline: headline.length > 2,
    sizes: selectedSizes.length > 0,
    deadline: deadline !== '',
  };

  const isComplete = Object.values(checks).every(Boolean);
  const isEmergency = urgency === 'Emergency' || urgency === 'Urgent';

  const toggleSize = (sizeLabel) => setSelectedSizes(prev => prev.includes(sizeLabel) ? prev.filter(s => s !== sizeLabel) : [...prev, sizeLabel]);

  // ฟังก์ชันส่งข้อมูลบรีฟใหม่ไปยัง Google Sheets API
  const handleSubmit = async () => {
    if(!isComplete || isSubmitting) return;
    setIsSubmitting(true);
    
    const newTaskData = {
      title: title,
      country: country.substring(country.indexOf('(')+1, country.indexOf(')')),
      deadline: deadline,
      urgency: urgency,
      objective: objective,
      headline: headline,
      selectedSizes: selectedSizes,
      quality: 95
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'createTask', data: newTaskData })
      });
      const result = await response.json();
      
      if(result.success) {
        // เพิ่ม Task ใหม่เข้า UI อัตโนมัติด้วย ID ที่ได้จาก Server
        setTasks(prev => [{ ...newTaskData, id: result.taskId, status: 'Requested', assignee: 'Unassigned' }, ...prev]);
        setActiveView('board');
      } else {
        alert("Submission failed. Please check backend connection.");
      }
    } catch (error) {
      console.error("Submission Error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 h-full animate-in slide-in-from-right-8 duration-300 pb-8">
      {/* LEFT: Editor */}
      <div className="flex-1 min-w-0 lg:min-w-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto p-8 lg:p-12 relative">
        <input type="text" placeholder="Untitled Campaign Request..." className="w-full text-4xl font-black text-slate-800 border-none outline-none placeholder:text-slate-200 mb-8 bg-transparent" onChange={e => setTitle(e.target.value)} />
        <div className="space-y-10">
          <div className="group relative">
            <h3 className="text-lg font-bold text-slate-800 mb-2 truncate max-w-full flex items-center gap-2"><Target className="w-5 h-5 text-slate-400 shrink-0" /> Campaign Objective</h3>
            <textarea placeholder="What is the goal of this content?..." className="w-full resize-none text-slate-600 outline-none text-base bg-transparent min-h-[80px] p-2 hover:bg-slate-50 focus:bg-slate-50 rounded-lg transition-colors border border-transparent focus:border-slate-200" onChange={e => setObjective(e.target.value)} />
          </div>
          <div className="group relative border-t border-slate-100 pt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 truncate max-w-full flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400 shrink-0" /> Copywriting</h3>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Headline</label>
              <input type="text" placeholder="Main big text on the artwork..." onChange={e => setHeadline(e.target.value)} className="w-full text-lg font-bold outline-none border-b border-dashed border-slate-300 focus:border-black pb-1 bg-transparent truncate" />
            </div>
          </div>
          <div className="group relative border-t border-slate-100 pt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 truncate max-w-full flex items-center gap-2"><Layout className="w-5 h-5 text-slate-400 shrink-0" /> Asset Sizes</h3>
            <div className="space-y-4">
              {Object.entries(ASSET_SIZES).map(([cat, items]) => (
                <div key={cat}><h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{cat}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <button key={item.label} type="button" onClick={() => toggleSize(item.label)} className={`px-3 py-2 rounded-lg border text-sm font-bold ${selectedSizes.includes(item.label) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-700'}`}>{item.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Validation Panel */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
           <h4 className="font-bold text-slate-800 mb-5 text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400"/> Settings</h4>
           <div className="space-y-4">
             <div><label className="text-xs font-bold text-slate-500 mb-1 block">Country</label><select onChange={e=>setCountry(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-bold"><option>Thailand (TH)</option><option>Malaysia (MY)</option></select></div>
             <div><label className="text-xs font-bold text-slate-500 mb-1 block">Deadline</label><input type="date" onChange={e => setDeadline(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-bold" /></div>
             <div><label className="text-xs font-bold text-slate-500 mb-1 block">Priority</label><select onChange={e => setUrgency(e.target.value)} className={`w-full p-2 border rounded-lg text-sm font-bold ${isEmergency ? 'bg-red-50 text-red-700 border-red-300' : ''}`}><option value="Normal">Normal</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option></select></div>
           </div>
        </div>

        <div className={`rounded-2xl shadow-sm border transition-all duration-300 flex flex-col p-6 ${isComplete ? 'bg-white border-emerald-200' : 'bg-white border-slate-200'}`}>
           {!isComplete ? (
             <>
               <p className="text-xs font-black text-red-600 mb-3 uppercase tracking-wide">Submission Blocked</p>
               <ul className="space-y-2 mb-6">
                 {Object.entries(checks).map(([key, passed]) => (
                   <li key={key} className={`flex items-center gap-2 text-xs font-bold ${passed ? 'text-emerald-600' : 'text-slate-500'}`}>{passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 text-slate-300" />} {key.toUpperCase()}</li>
                 ))}
               </ul>
               <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl border border-slate-200">Complete Form to Submit</button>
             </>
           ) : (
             <button onClick={handleSubmit} disabled={isSubmitting} className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 ${isEmergency ? 'bg-red-600' : 'bg-blue-600'}`}>
               {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Zap className="w-4 h-4"/>} {isSubmitting ? 'Syncing...' : 'Submit Brief'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
}

function TeamAdminView() { return <div className="p-8 text-center text-slate-400 font-bold">Team Module (Connected via Spreadsheet)</div>; }