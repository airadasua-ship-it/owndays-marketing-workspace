import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, KanbanSquare, ListTodo, FileEdit, Users, Search, 
  CheckCircle2, Clock, AlertCircle, FileText, Image as ImageIcon,
  Zap, XCircle, Loader2, Trash2, UserPlus, Mail, Calendar as CalendarIcon, 
  Award, Download, Copy, Maximize2, Minimize2, Send, 
  MessageCircle, Video, Film, Play, Eye, ArrowRight,
  FolderOpen, CalendarDays, BarChart3, DownloadCloud, ExternalLink, Image, Grid,
  ChevronLeft, ChevronRight, Trophy, Star, PieChart, Briefcase, Layers, Edit2, History,
  Inbox, CheckSquare, Settings, LogOut, Check, GripVertical, AlertTriangle, Link as LinkIcon
} from 'lucide-react';

// URL ของ Web App ที่เชื่อมกับ Google Sheets ของคุณ
const API_URL = 'https://script.google.com/macros/s/AKfycby6j9tUrUE948IhRFbYBcGyJT2h7AzOPp9ZjyfQdKxK1Fw0ypoNH0jBUAx4b42D4luR/exec';

const STAGES = ['Incoming Requests', 'Open Pool', 'In Progress', 'Reviewing', 'Published'];
const COUNTRIES = ['ALL', 'TH', 'MY', 'KH', 'ADS'];
const STANDARD_SIZES = ['FB Single (1080x1080)', 'FB Album (1080x1350)', 'IG Story (1080x1920)', 'Reels / TikTok (1080x1920)', 'Ads (1200x628)'];
const STANDARD_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'LINE', 'Ads', 'Website'];

// ----------------------------------------------------------------------
// DEFAULT CONFIGURATIONS
// ----------------------------------------------------------------------
const defaultPermissions = {
  SuperAdmin: ['dashboard', 'library', 'calendar', 'brief', 'board', 'video-timeline', 'table', 'team'],
  Manager: ['dashboard', 'library', 'calendar', 'brief', 'board', 'video-timeline', 'table', 'team'],
  Creative: ['library', 'calendar', 'brief', 'board', 'table'],
  Graphic: ['library', 'board'],
  Editor: ['library', 'board', 'video-timeline'],
  Requester: ['brief']
};

const initialTeamMembers = [
  { UserID: 'u_001', Name: 'Airada S.', Email: 'airada.s@owndays.com', Role: 'SuperAdmin', CountryAccess: 'ALL', LINE_ID: 'airada_admin', Status: 'Active' },
];

const getProjectColor = (projectName) => {
  const colors = [
    'bg-blue-600 border-blue-500 text-white', 'bg-rose-600 border-rose-500 text-white', 'bg-emerald-600 border-emerald-500 text-white', 
    'bg-amber-600 border-amber-500 text-white', 'bg-purple-600 border-purple-500 text-white', 'bg-indigo-600 border-indigo-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < projectName?.length || 0; i++) { hash = projectName.charCodeAt(i) + ((hash << 5) - hash); }
  return colors[Math.abs(hash) % colors.length];
};

function SidebarItem({ icon: Icon, label, active, onClick, badge, visible = true }) {
  if (!visible) return null;
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
      <div className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" /><span>{label}</span></div>
      {badge && <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">{badge}</span>}
    </button>
  );
}

export default function App() {
  const [activeUser, setActiveUser] = useState(null); 
  const [permissions, setPermissions] = useState(defaultPermissions);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App States
  const [activeView, setActiveView] = useState('board'); 
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editTaskData, setEditTaskData] = useState(null); 
  const [viewingTask, setViewingTask] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ดึงข้อมูลจริงจาก Google Apps Script
  const fetchAllData = async () => {
    setIsLoadingData(true);
    try {
      // ดึงงาน
      const taskRes = await fetch(`${API_URL}?action=getTasks`);
      const taskJson = await taskRes.json();
      if (taskJson.success && taskJson.data.length > 0) setTasks(taskJson.data);

      // ดึงผู้ใช้งาน
      const userRes = await fetch(`${API_URL}?action=getUsers`);
      const userJson = await userRes.json();
      if (userJson.success && userJson.data.length > 0) {
        // อัปเดต Users แต่ต้องแน่ใจว่า SuperAdmin จะไม่หาย
        const fetchedUsers = userJson.data;
        const hasAdmin = fetchedUsers.some(u => u.Email === 'airada.s@owndays.com');
        setTeamMembers(hasAdmin ? fetchedUsers : [...initialTeamMembers, ...fetchedUsers]);
      }
    } catch (e) {
      console.log('Using local state due to fetch error or empty sheet');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchCountry = selectedCountry === 'ALL' || t.country === selectedCountry;
      const matchSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.project || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCountry && matchSearch;
    });
  }, [tasks, selectedCountry, searchQuery]);

  const hasAccess = (viewName) => {
    if (!activeUser) return false;
    return permissions[activeUser.Role]?.includes(viewName);
  };

  // ----------------------------------------------------------------------
  // 🔐 REAL LOGIN LOGIC
  // ----------------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    // ตรวจสอบอีเมลในระบบ
    const user = teamMembers.find(m => m.Email.toLowerCase() === loginEmail.toLowerCase().trim());
    
    setTimeout(() => { // Simulate short network delay for feel
      if (user) {
        setActiveUser(user);
        // ไปหน้าแรกที่ผู้ใช้นี้มีสิทธิ์
        const userViews = permissions[user.Role] || [];
        if (userViews.includes('board')) setActiveView('board');
        else if (userViews.includes('brief')) setActiveView('brief');
        else setActiveView(userViews[0] || 'dashboard');
      } else {
        setLoginError('ไม่พบอีเมลนี้ในระบบ หากคุณเป็นพนักงานใหม่ กรุณาติดต่อ Manager เพื่อขอ Invite เข้าระบบครับ');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-3xl mx-auto mb-6 shadow-lg shadow-blue-500/20">O</div>
            <h2 className="text-2xl font-black text-white text-center mb-2">OWNDAYS Marketing Hub</h2>
            <p className="text-sm text-slate-400 text-center mb-8">เข้าสู่ระบบเพื่อจัดการแคมเปญและการทำงาน</p>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. airada.s@owndays.com"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 text-sm font-medium transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-4 flex justify-center items-center gap-2"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin"/> : <><CheckCircle2 className="w-4 h-4"/> เข้าสู่ระบบ</>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
               <p className="text-[10px] text-slate-500 mb-3 font-medium">หากเป็นแอดมินหรือผู้ใช้งานครั้งแรก กรุณาเข้าสู่ระบบด้วย:</p>
               <button onClick={() => setLoginEmail('airada.s@owndays.com')} className="text-xs text-blue-400 hover:text-white underline font-bold transition-colors">airada.s@owndays.com</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* 🔴 Sidebar (Dynamic based on Permissions) */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 z-20 shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white mr-3 shadow-lg shadow-blue-500/20">O</div>
          <div><h1 className="font-bold text-white text-sm tracking-wide">OWNDAYS</h1><p className="text-[10px] uppercase tracking-wider text-slate-400">Marketing Hub</p></div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
          {(hasAccess('dashboard') || hasAccess('library') || hasAccess('calendar')) && (
            <>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2">Data & Analytics</p>
              <nav className="space-y-1 mb-6">
                <SidebarItem icon={BarChart3} label="Yearly Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} visible={hasAccess('dashboard')} />
                <SidebarItem icon={FolderOpen} label="Media Library" active={activeView === 'library'} onClick={() => setActiveView('library')} visible={hasAccess('library')} />
                <SidebarItem icon={CalendarDays} label="Calendar Plan" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} visible={hasAccess('calendar')} />
              </nav>
            </>
          )}

          <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2">Workspace</p>
          <nav className="space-y-1 mb-8">
            <SidebarItem icon={FileEdit} label={activeUser.Role === 'Requester' ? "Submit Request" : "Brief Generator"} active={activeView === 'brief'} onClick={() => { setEditTaskData(null); setActiveView('brief'); }} visible={hasAccess('brief')} />
            <SidebarItem icon={KanbanSquare} label="Creative Board" active={activeView === 'board'} onClick={() => setActiveView('board')} visible={hasAccess('board')} />
            <SidebarItem icon={Film} label="Video Pipeline" active={activeView === 'video-timeline'} onClick={() => setActiveView('video-timeline')} visible={hasAccess('video-timeline')} />
            <SidebarItem icon={ListTodo} label="Master Data List" active={activeView === 'table'} onClick={() => setActiveView('table')} visible={hasAccess('table')} />
          </nav>

          {hasAccess('team') && (
            <>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2 mt-4">Management</p>
              <nav className="space-y-1">
                <SidebarItem icon={Settings} label="Team & Permissions" active={activeView === 'team'} onClick={() => setActiveView('team')} />
              </nav>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">{activeUser.Name.charAt(0)}</div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{activeUser.Name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{activeUser.Role}</p>
              </div>
            </div>
            <button onClick={() => { setActiveUser(null); setLoginEmail(''); }} className="p-2 text-slate-500 hover:text-rose-400 transition-colors" title="Logout"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-900">
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0 shadow-md">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-white capitalize">
              {activeView === 'brief' ? (editTaskData ? 'Edit Brief' : (activeUser.Role === 'Requester' ? 'Submit New Request' : 'New Brief Generator')) : activeView.replace('-', ' ')}
            </h2>
            
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => setSelectedCountry(c)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedCountry === c ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search Topic, Project..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 w-48 lg:w-64"/>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            {isLoadingData ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500"/>
                <p className="font-bold tracking-widest uppercase text-xs">Syncing with Server...</p>
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto scrollbar-thin">
                {activeView === 'dashboard' && <YearlyDashboardView tasks={filteredTasks} />}
                {activeView === 'library' && <MediaLibraryView tasks={filteredTasks} />}
                {activeView === 'calendar' && <CalendarPlanView tasks={filteredTasks} setTasks={setTasks} apiUrl={API_URL} />}
                {activeView === 'brief' && <BriefSlideGenerator setTasks={setTasks} teamMembers={teamMembers} editData={editTaskData} setEditData={setEditTaskData} activeUser={activeUser} apiUrl={API_URL} setActiveView={setActiveView} />}
                {activeView === 'board' && <BoardView tasks={filteredTasks} setTasks={setTasks} activeUser={activeUser} onEditBrief={(t) => { setEditTaskData(t); setActiveView('brief'); }} onViewBrief={setViewingTask} apiUrl={API_URL} />}
                {activeView === 'video-timeline' && <VideoTimelineView tasks={filteredTasks} />}
                {activeView === 'table' && <TableView tasks={filteredTasks} onEditTask={(t) => { setEditTaskData(t); setActiveView('brief'); }} />}
                {activeView === 'team' && <TeamAdminView teamMembers={teamMembers} setTeamMembers={setTeamMembers} activeUser={activeUser} permissions={permissions} setPermissions={setPermissions} apiUrl={API_URL} />}
              </div>
            )}
        </div>

        {/* 🟢 MODAL: Graphic Brief Viewer (หน้าต่างดูบรีฟที่ออกแบบใหม่ให้กราฟิกดูง่าย) */}
        {viewingTask && (
          <BriefViewerModal task={viewingTask} onClose={() => setViewingTask(null)} activeUser={activeUser} setTasks={setTasks} apiUrl={API_URL} />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// 1. BRIEF VIEWER MODAL (ออกแบบใหม่สำหรับกราฟิกและอิดิเตอร์โดยเฉพาะ)
// ============================================================================
function BriefViewerModal({ task, onClose, activeUser, setTasks, apiUrl }) {
  const [driveLink, setDriveLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAssignedToMe = task.designer === activeUser.Name;
  const canSubmitWork = isAssignedToMe && (task.status === 'In Progress' || task.status === 'Editing');

  const handleSubmitWork = async () => {
    if(!driveLink.trim()) return alert("กรุณาแปะลิงก์ผลงาน (เช่น Google Drive, Frame.io) เพื่อส่งงานครับ");
    setIsSubmitting(true);
    
    // อัปเดต State หน้าเว็บ
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Reviewing', assetUrl: driveLink } : t));
    
    // ส่ง API ยิงเข้า Sheet
    try {
      await fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'updateStatus', taskId: task.id, newStatus: 'Reviewing', userId: activeUser.Name, assetUrl: driveLink }) 
      });
      alert("✅ ส่งงานเรียบร้อยแล้ว! สถานะถูกเปลี่ยนเป็น Reviewing เพื่อให้ Creative ตรวจสอบ");
      onClose();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งงาน (Mock Mode)");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header แถบด้านบน */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm shadow-blue-500/50">{task.country}</span>
             <h2 className="font-black text-white text-xl">{task.project}</h2>
             {task.lastUpdated && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> แก้ไขล่าสุด: {task.lastUpdated}</span>}
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm"><XCircle className="w-5 h-5"/></button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* 🔴 แผงด้านซ้าย: SPECIFICATIONS (สเปกไฟล์) */}
          <div className="lg:w-[35%] bg-slate-950/50 border-r border-slate-800 p-8 overflow-y-auto scrollbar-thin flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-3"><Layers className="w-4 h-4 text-blue-500"/> งานที่ต้องทำ (Specs)</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {task.placement ? task.placement.split(',').map(p => <span key={p} className="bg-slate-900 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">{p.trim()}</span>) : '-'}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Required Sizes (ไซส์ที่ต้องทำ)</p>
                  <div className="flex flex-col gap-2">
                    {task.size ? task.size.split(',').map(s => <span key={s} className="bg-blue-950/30 text-blue-300 border border-blue-900/50 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm">{s.trim()}</span>) : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-6 pt-6 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target Date</p>
                <p className="text-2xl font-black text-rose-400">{new Date(task.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Assignee</p>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">{task.designer?.charAt(0)}</span>
                  {task.designer}
                </p>
              </div>
            </div>
          </div>

          {/* 🔵 แผงด้านขวา: COPYWRITING (ข้อความในอาร์ตเวิร์ก) */}
          <div className="lg:w-[65%] p-8 lg:p-12 overflow-y-auto scrollbar-thin bg-slate-900 flex flex-col relative">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-slate-800 pb-3"><FileText className="w-4 h-4 text-emerald-500"/> ข้อความในอาร์ตเวิร์ก (Copywriting)</h3>
            
            <div className="flex-1 space-y-10 max-w-4xl">
              {/* Main Headline (ใหญ่สุด) */}
              <div className="relative">
                <span className="absolute -left-6 top-2 text-rose-500 font-black text-2xl">"</span>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">📌 Headline (ข้อความหลัก เน้นใหญ่สุด)</p>
                <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">{task.headline || '-'}</h1>
              </div>

              {/* Subtext (รองลงมา) */}
              <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">📝 Subtext (ข้อความรอง / อธิบายโปรโมชัน)</p>
                <h3 className="text-2xl font-bold text-slate-200 leading-relaxed whitespace-pre-wrap">{task.subtext || '-'}</h3>
              </div>

              {/* Condition (เงื่อนไขตัวเล็กมุมภาพ) */}
              {task.condition && (
                <div className="inline-block border-l-2 border-amber-500 pl-4 py-1">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">⚠️ Conditions (เงื่อนไข / ตัวเล็กมุมภาพ)</p>
                  <p className="text-sm font-medium text-amber-100/70">{task.condition}</p>
                </div>
              )}

              {/* Social Caption */}
              <div className="mt-12 pt-8 border-t border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageCircle className="w-3 h-3"/> Social Media Caption (สำหรับ Post)</p>
                <div className="bg-slate-950 p-5 rounded-xl text-sm text-slate-400 font-mono whitespace-pre-wrap border border-slate-800 shadow-inner">
                  {task.caption || '-'}
                </div>
              </div>
            </div>

            {/* 📤 Submit Work Area (กล่องส่งงาน อยู่ด้านล่างสุด) */}
            {canSubmitWork && (
              <div className="mt-12 bg-blue-950/20 border border-blue-500/30 rounded-2xl p-6 shadow-xl shrink-0 backdrop-blur">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400"/> Submit Final Work</h4>
                    <p className="text-xs text-slate-400 mt-1">อัปโหลดงานเสร็จแล้ว แปะลิงก์ส่งให้ทีมตรวจตรงนี้ได้เลยครับ</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2"/>
                    <input 
                      type="url" 
                      placeholder="วางลิงก์ Google Drive หรือ Frame.io ที่นี่..." 
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-sm text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handleSubmitWork}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 shrink-0"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                    ส่งงาน (Submit)
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. CALENDAR VIEW (Drag & Drop ย้ายวันได้)
// ============================================================================
function CalendarPlanView({ tasks, setTasks, apiUrl }) {
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-07-01'));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const tasksInMonth = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate.getMonth() === currentMonth.getMonth() && taskDate.getFullYear() === currentMonth.getFullYear();
  });

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = async (e, day) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // คำนวณวันที่ใหม่ (แก้ปัญหา Timezone)
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0); 
    const newDateString = newDate.toISOString().split('T')[0]; 

    // อัปเดต State ให้เห็นภาพทันที (Optimistic UI)
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, date: newDateString } : t));

    // เรียก API อัปเดตเข้า Google Sheet ด้วย
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if(taskToUpdate) {
        await fetch(API_URL, { 
          method: 'POST', 
          body: JSON.stringify({ action: 'updateTask', data: { ...taskToUpdate, date: newDateString } }) 
        });
      }
    } catch(e) {
      console.log('API Update Failed in Calendar');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarDays className="text-blue-500 w-6 h-6"/> Content Calendar Plan
          </h2>
          <p className="text-xs text-slate-500 mt-1">คลิกค้างที่การ์ดงานแล้วลาก (Drag & Drop) เพื่อเลื่อนวันที่ได้เลย ข้อมูลจะอัปเดตอัตโนมัติ</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-sm font-black text-white min-w-[120px] text-center">{currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(130px,auto)] bg-slate-900 gap-px border-b border-slate-800">
          {blanks.map(blank => <div key={`blank-${blank}`} className="bg-slate-950/50 p-2 opacity-50"></div>)}
          
          {days.map(day => {
            const dayTasks = tasksInMonth.filter(task => new Date(task.date).getDate() === day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div 
                key={day} 
                className={`bg-slate-950 p-2 border-r border-b border-slate-800 hover:bg-slate-900/50 transition-colors flex flex-col group min-h-[130px] ${isToday ? 'bg-blue-950/20' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 group-hover:text-white'}`}>{day}</span>
                  {dayTasks.length > 0 && <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{dayTasks.length}</span>}
                </div>
                
                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-none pr-1">
                  {dayTasks.map(task => {
                    const colorClass = getProjectColor(task.project);
                    return (
                      <div 
                        key={task.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`text-left px-2 py-1.5 rounded-lg border text-[10px] leading-tight font-medium cursor-grab active:cursor-grabbing transition-colors shadow-sm relative group/task ${colorClass}`}
                      >
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/task:opacity-100"><GripVertical className="w-3 h-3 text-white/50"/></div>
                        
                        <div className="flex items-center justify-between mb-0.5 opacity-80 ml-1">
                          <span className="font-black truncate">{task.project}</span>
                        </div>
                        <p className="line-clamp-2 drop-shadow-sm font-bold ml-1" title={task.topic}>{task.topic}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. TEAM & ADMIN VIEW (ระบบ Invite และ ลบผู้ใช้แบบยืดหยุ่น)
// ----------------------------------------------------------------------
function TeamAdminView({ teamMembers, setTeamMembers, activeUser, permissions, setPermissions, apiUrl }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Graphic');
  const [isProcessing, setIsProcessing] = useState(false);

  const isSuperAdmin = activeUser.Role === 'SuperAdmin';
  const isManager = activeUser.Role === 'Manager';
  const canInvite = isSuperAdmin || isManager;

  // Invite (เพิ่ม) ผู้ใช้งานใหม่
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!canInvite) return;
    setIsProcessing(true);

    const newMember = { UserID: 'u_' + Date.now(), Name: name, Email: email, Role: role, CountryAccess: 'TH', LINE_ID: '', Status: 'Active', TasksCompleted: 0 };
    
    try {
      setTeamMembers([...teamMembers, newMember]); // อัปเดตหน้าเว็บก่อนให้ไว
      await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'createUser', data: newMember }) });
      alert(`Invite ${email} เข้าสู่ระบบสำเร็จ`);
      setShowAddModal(false);
      setName(''); setEmail('');
    } catch(err) {
      alert("Error saving user");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete (ลบ) ผู้ใช้งาน (เฉพาะ SuperAdmin)
  const handleDeleteMember = async (userId, userEmail) => {
    if(userEmail === 'airada.s@owndays.com') return alert('ไม่สามารถลบ SuperAdmin หลักได้ครับ');
    if(!window.confirm(`ยืนยันการลบผู้ใช้งาน ${userEmail} ออกจากระบบ?`)) return;

    try {
      setTeamMembers(prev => prev.filter(m => m.UserID !== userId));
      // ส่ง API ไปสั่งลบแถว (ใน Apps Script ต้องเขียนฟังก์ชันลบตาม Email ด้วย แต่ตอนนี้ Mock บนหน้าเว็บให้เห็นผลก่อน)
      alert(`เตะ ${userEmail} ออกจากระบบเรียบร้อยแล้ว`);
    } catch(err) {
      console.log(err);
    }
  };

  const togglePermission = (roleName, view) => {
    setPermissions(prev => {
      const currentViews = prev[roleName] || [];
      const newViews = currentViews.includes(view) ? currentViews.filter(v => v !== view) : [...currentViews, view];
      return { ...prev, [roleName]: newViews };
    });
  };

  const ALL_VIEWS = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'library', name: 'Media Library' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'brief', name: 'Brief Generator' },
    { id: 'board', name: 'Creative Board' },
    { id: 'table', name: 'Master Data List' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 relative animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white">Team & Permissions</h2>
          <p className="text-xs text-slate-500 mt-1">เชิญคนเข้าทีม, ลบอีเมลเก่า, และกำหนดสิทธิ์การมองเห็นเมนู</p>
        </div>
        {canInvite && (
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
            <UserPlus className="w-4 h-4"/> Invite New User
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.UserID} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between group">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-black text-slate-400">{member.Name.charAt(0)}</div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    {member.Name} 
                    {(member.Role === 'SuperAdmin' || member.Role === 'Manager') && <Award className="w-3.5 h-3.5 text-yellow-500"/>}
                  </h3>
                  <p className="text-[10px] text-slate-500">{member.Email}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50 mt-1.5 inline-block">{member.Role}</span>
                </div>
             </div>
             
             {/* ปุ่มลบผู้ใช้งาน โชว์เฉพาะ SuperAdmin */}
             {isSuperAdmin && member.Email !== 'airada.s@owndays.com' && (
               <button onClick={() => handleDeleteMember(member.UserID, member.Email)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete User">
                 <Trash2 className="w-4 h-4"/>
               </button>
             )}
          </div>
        ))}
      </div>

      {/* ส่วนตั้งค่า Permissions (เห็นเฉพาะ SuperAdmin) แบบติ๊กเลือกอิสระ */}
      {isSuperAdmin && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mt-8">
          <h3 className="text-base font-black text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-amber-500"/> Role Access Control (กำหนดสิทธิ์การมองเห็นเมนู)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-bold">Role (ตำแหน่ง)</th>
                  {ALL_VIEWS.map(v => <th key={v.id} className="p-4 text-center font-bold">{v.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Object.keys(permissions).map(roleName => {
                  if(roleName === 'SuperAdmin') return null; // ซ่อน SuperAdmin
                  return (
                    <tr key={roleName} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-black text-white">{roleName}</td>
                      {ALL_VIEWS.map(v => (
                        <td key={v.id} className="p-4 text-center">
                          <label className="flex items-center justify-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={permissions[roleName].includes(v.id)}
                              onChange={() => togglePermission(roleName, v.id)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-600 cursor-pointer"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddModal && canInvite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative zoom-in-95">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XCircle className="w-5 h-5"/></button>
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500"/> Invite User</h3>
            <p className="text-xs text-slate-500 mb-6">เชิญพนักงานใหม่เข้าสู่ระบบ Marketing Hub</p>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-400 block mb-1">Name</label><input required placeholder="ชื่อพนักงาน" className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500" value={name} onChange={e=>setName(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label><input required type="email" placeholder="example@owndays.com" className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500" value={email} onChange={e=>setEmail(e.target.value)} /></div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Role (ตำแหน่ง)</label>
                <select className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold outline-none focus:border-blue-500" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="Graphic">Graphic</option><option value="Editor">Editor</option><option value="Manager">Manager</option><option value="Creative">Creative</option><option value="Requester">Requester (External)</option>
                </select>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-4 h-4"/>}
                Send Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. BRIEF GENERATOR / EDIT FORM
// ----------------------------------------------------------------------
function BriefSlideGenerator({ setTasks, teamMembers, editData, setEditData, activeUser, setActiveView, apiUrl }) {
  const [briefType, setBriefType] = useState(editData?.isVideoProduction ? 'video' : 'graphic');

  const initSizes = editData ? (editData.size || '').split(',').map(s=>s.trim()).filter(s => STANDARD_SIZES.includes(s)) : [];
  const initPlatforms = editData ? (editData.placement || '').split(',').map(p=>p.trim()).filter(p => STANDARD_PLATFORMS.includes(p)) : [];
  const initOtherSize = editData ? (editData.size || '').split(',').map(s=>s.trim()).filter(s => !STANDARD_SIZES.includes(s) && s !== '').join(', ') : '';

  const isRequester = activeUser.Role === 'Requester';

  const [formData, setFormData] = useState({
    id: editData?.id || null, project: editData?.project || '', topic: editData?.topic || '',
    selectedPlatforms: initPlatforms, selectedSizes: initSizes, otherSize: initOtherSize,
    date: editData?.date || new Date().toISOString().split('T')[0], country: editData?.country || 'TH',
    mainTitle: editData?.headline || '', subTitle: editData?.subtext || '', footerText: editData?.condition || '',
    caption: editData?.caption || '', designer: editData?.designer || 'Unassigned', urgency: editData?.urgency || 'Normal',
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleCheckbox = (listName, item) => setFormData(prev => {
    const isSelected = prev[listName].includes(item);
    return { ...prev, [listName]: isSelected ? prev[listName].filter(i => i !== item) : [...prev[listName], item] };
  });

  const handlePublish = async () => {
    if (!formData.project || !formData.topic) return alert("กรุณากรอก Project และ Topic ให้ครบถ้วน");
    setIsSubmitting(true);
    
    const finalSizes = [...formData.selectedSizes];
    if (formData.otherSize.trim() !== '') finalSizes.push(formData.otherSize.trim());
    const finalSizeString = finalSizes.join(', ');
    const finalPlacementString = formData.selectedPlatforms.join(', ');

    const payload = {
      id: formData.id || 'T-2026-' + Math.floor(1000 + Math.random() * 9000),
      title: formData.topic.slice(0, 30), project: formData.project, topic: formData.topic,
      country: formData.country, date: formData.date, assetType: briefType === 'video' ? 'Video' : 'Statics',
      placement: finalPlacementString, size: finalSizeString, headline: formData.mainTitle, subtext: formData.subTitle,
      condition: formData.footerText, caption: formData.caption, designer: formData.designer,
      status: editData ? editData.status : 'Incoming Requests', urgency: formData.urgency, isVideoProduction: briefType === 'video',
      lastUpdated: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
    };

    try {
      if (formData.id) {
        setTasks(prev => prev.map(t => t.id === formData.id ? { ...t, ...payload } : t));
        await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateTask', data: payload }) });
        alert('อัปเดตบรีฟสำเร็จ!');
      } else {
        setTasks(prev => [payload, ...prev]);
        await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'createTask', data: payload }) });
        alert('สร้างบรีฟสำเร็จ ส่งเข้าคิว Incoming Requests แล้ว');
        setFormData({ ...formData, project: '', topic: '', mainTitle: '', subTitle: '', caption: '' });
      }
      setEditData(null);
      if(activeUser.Role !== 'Requester') setActiveView('board'); 
    } catch(err) {
      alert("Error Mode Offline");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-900 relative">
      <div className={`h-full overflow-y-auto p-6 flex flex-col items-center bg-slate-900/60 transition-all ${isFullscreen ? 'w-full absolute inset-0 z-50 bg-slate-950' : 'w-2/3'}`}>
        
        {editData && (
          <div className="w-full max-w-5xl bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-4 flex items-center justify-between text-amber-400 text-sm font-bold shadow-lg">
            <div className="flex items-center gap-2"><Edit2 className="w-4 h-4"/> โหมดแก้ไขบรีฟ (Editing Mode)</div>
            <div className="flex gap-4 items-center">
              {editData.lastUpdated && <span className="text-xs flex items-center gap-1"><History className="w-3.5 h-3.5"/> แก้ไขล่าสุด: {editData.lastUpdated}</span>}
              <button onClick={() => { setEditData(null); setActiveView('board'); }} className="text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Cancel Edit</button>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl flex items-center justify-between mb-4">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setBriefType('graphic')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${briefType === 'graphic' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>🎨 Graphic Brief</button>
             <button onClick={() => setBriefType('video')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${briefType === 'video' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>🎥 Video Brief</button>
          </div>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2">
             {isFullscreen ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
             {isFullscreen ? 'Exit Presentation' : 'Present Slide'}
          </button>
        </div>

        {/* Slide Preview (ออกแบบเหมือนตอนที่กราฟิกดูเป๊ะๆ) */}
        <div className="w-full max-w-5xl aspect-[16/9] bg-white shadow-2xl border-2 border-slate-400 rounded-2xl overflow-hidden flex flex-col text-slate-900">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0 border-b-4 border-blue-600">
             <div className="flex items-center gap-4">
               <span className="bg-blue-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">{formData.country}</span>
               <h2 className="font-black text-2xl">{formData.project || '[Project Name]'}</h2>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Target Date</p>
               <p className="font-black text-blue-400 text-xl">{new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
             </div>
          </div>

          <div className="flex-1 flex p-0 overflow-hidden">
             {/* ซ้ายสเปก */}
             <div className="w-[35%] bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">📱 แพลตฟอร์ม (Placement)</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedPlatforms.length > 0 ? formData.selectedPlatforms.map(p => <span key={p} className="bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">{p}</span>) : <span className="text-slate-400 text-sm">-</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 border-b border-rose-100 pb-2">📏 ไซส์ (Required Sizes)</p>
                  <div className="flex flex-col gap-2">
                    {formData.selectedSizes.map(s => <span key={s} className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 rounded-lg text-xs font-black">{s}</span>)}
                    {formData.otherSize && <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg text-xs font-black">{formData.otherSize}</span>}
                  </div>
                </div>
             </div>

             {/* ขวาคอนเทนต์ */}
             <div className="w-[65%] p-10 flex flex-col justify-center bg-white relative">
                <span className="absolute -left-4 top-10 text-slate-200 font-serif text-8xl leading-none">"</span>
                
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">📌 Headline (ข้อความหลัก ใหญ่สุด)</p>
                <h1 className="text-5xl font-black text-slate-900 leading-tight mb-8 relative z-10">{formData.mainTitle || '[รอใส่หัวข้อหลัก]'}</h1>
                
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">📝 Subtext (ข้อความรอง)</p>
                <h3 className="text-xl font-bold text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap relative z-10">{formData.subTitle || '[รอใส่รายละเอียดรอง]'}</h3>
                
                <div className="mt-auto">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">⚠️ Conditions (เงื่อนไขเล็กมุมภาพ)</p>
                  <span className="inline-block bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-lg text-sm border border-yellow-200">{formData.footerText || '[ไม่มีเงื่อนไขเพิ่มเติม]'}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="w-full max-w-5xl mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-400 mb-2">Social Copy / Caption</h4>
            <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">{formData.caption || '...'}</p>
        </div>
      </div>

      {!isFullscreen && (
        <div className="w-1/3 h-full bg-slate-950 border-l border-slate-800 overflow-y-auto p-6 scrollbar-thin">
          <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500"/> {editData ? 'Edit Details' : 'New Brief Settings'}
          </h3>

          <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl mb-6 text-xs text-amber-400 font-medium leading-relaxed">
             <strong className="block text-amber-500 font-black mb-1">⚠️ ข้อกำหนดการขอ Artwork</strong>
             เผื่อเวลาล่วงหน้า 1 สัปดาห์เสมอ หากเป็นงาน <span className="text-rose-400 font-black">Urgent</span> ระบบจะล็อกส่งให้ Manager อนุมัติการแทรกคิว
          </div>
          
          <div className="space-y-6">
             <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-2">1. Basic Info</p>
                <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Project</label><input name="project" value={formData.project} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:border-blue-500 outline-none"/></div>
                <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Topic</label><input name="topic" value={formData.topic} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:border-blue-500 outline-none"/></div>
                <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Target Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:border-blue-500 outline-none"/></div>
             </div>

             <div className="space-y-5 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-800 pb-2">2. Platforms & Sizes</p>
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-3">เลือก Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_PLATFORMS.map(p => (
                      <button key={p} onClick={() => toggleCheckbox('selectedPlatforms', p)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${formData.selectedPlatforms.includes(p) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-3">เลือก Standard Sizes</label>
                  <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {STANDARD_SIZES.map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.selectedSizes.includes(s)} onChange={() => toggleCheckbox('selectedSizes', s)} className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600"/>
                        <span className={`text-xs ${formData.selectedSizes.includes(s) ? 'text-blue-400 font-black' : 'text-slate-400 group-hover:text-slate-300'}`}>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-2">ไซส์อื่นๆ (Other Sizes)</label>
                  <input name="otherSize" value={formData.otherSize} onChange={handleInputChange} placeholder="เช่น Cover Page (820x312), IG 4:5" className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white focus:border-blue-500 outline-none"/>
                </div>
             </div>

             <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2">3. Copywriting</p>
                <div>
                  <label className="text-xs text-emerald-400 font-bold block mb-1.5">Main Headline (ข้อความหลัก ใหญ่สุด)</label>
                  <input name="mainTitle" value={formData.mainTitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-emerald-900/50 p-3 rounded-xl text-sm text-emerald-100 font-black focus:border-emerald-500 outline-none"/>
                </div>
                <div><label className="text-xs text-slate-400 font-bold block mb-1.5">Subtext (รายละเอียดรอง)</label><textarea name="subTitle" value={formData.subTitle} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none"/></div>
                <div><label className="text-xs text-amber-400 font-bold block mb-1.5">Conditions (เงื่อนไขเล็กๆ)</label><input name="footerText" value={formData.footerText} onChange={handleInputChange} className="w-full bg-slate-950 border border-amber-900/50 p-2.5 rounded-xl text-xs text-amber-100 focus:border-amber-500 outline-none"/></div>
                <div><label className="text-xs text-slate-400 font-bold block mb-1.5 mt-2">Social Caption</label><textarea name="caption" value={formData.caption} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-slate-400 focus:border-blue-500 outline-none"/></div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 pt-2">
               {!isRequester && (
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Assign To</label>
                   <select name="designer" value={formData.designer} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white font-bold outline-none">
                      <option value="Unassigned">Unassigned (To Pool)</option>
                      {teamMembers.filter(m => m.Role === 'Graphic' || m.Role === 'Editor').map(m => <option key={m.Name} value={m.Name}>{m.Name} ({m.Role})</option>)}
                   </select>
                 </div>
               )}
               <div className={isRequester ? "col-span-2" : ""}>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Urgency</label>
                 <select name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white font-bold outline-none">
                    <option value="Normal">Normal</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option>
                 </select>
               </div>
             </div>
             
             <button onClick={handlePublish} disabled={isSubmitting} className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl flex justify-center items-center shadow-lg shadow-blue-600/20 transition-all gap-2">
               {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : (editData ? <><CheckCircle2 className="w-5 h-5"/> Update Brief Details</> : <><Send className="w-5 h-5"/> Generate & Publish Brief</>)}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. KANBAN BOARD
// ----------------------------------------------------------------------
function BoardView({ tasks, setTasks, activeUser, apiUrl, onViewBrief, onEditBrief }) {
  
  const moveTask = (taskId, direction) => {
    setTasks(currentTasks => currentTasks.map(t => {
      if (t.id === taskId) {
        const currentIndex = STAGES.indexOf(t.status);
        let newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < STAGES.length) {
          const newStatus = STAGES[newIndex];
          fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', taskId: taskId, newStatus: newStatus, userId: activeUser.Name }) }).catch(e=>{});
          return { ...t, status: newStatus };
        }
      }
      return t;
    }));
  };

  const claimTask = (taskId) => {
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, designer: activeUser.Name, status: 'In Progress' } : t));
    fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'claimTask', taskId: taskId, designerId: activeUser.Name }) }).catch(e=>{});
  };

  const releaseTask = (taskId) => {
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, designer: 'Unassigned', status: 'Open Pool' } : t));
  };

  const approveToPool = (taskId, urgency) => {
    if ((urgency === 'Urgent' || urgency === 'Emergency') && activeUser.Role === 'Creative') {
      return alert('ไม่อนุญาต: งานระดับ Urgent/Emergency ต้องได้รับการอนุมัติจาก Manager หรือ SuperAdmin เท่านั้น');
    }
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, status: 'Open Pool' } : t));
    fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', taskId: taskId, newStatus: 'Open Pool', userId: activeUser.Name }) }).catch(e=>{});
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Creative Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">คลิกที่การ์ดเพื่ออ่านบรีฟและส่งงาน (Submit) / ลากเพื่อเปลี่ยนสถานะ</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start snap-x">
        {STAGES.map((stage, sIdx) => {
          const stageTasks = tasks.filter(t => t.status === stage);
          return (
            <div key={stage} className={`bg-slate-950/40 border rounded-3xl w-[340px] shrink-0 flex flex-col max-h-full snap-center ${stage === 'Incoming Requests' ? 'border-amber-900/50' : stage === 'Open Pool' ? 'border-blue-900/50' : 'border-slate-800'}`}>
              
              <div className={`p-5 border-b flex justify-between items-center rounded-t-3xl ${stage === 'Incoming Requests' ? 'bg-amber-950/40 border-amber-900/50' : stage === 'Open Pool' ? 'bg-blue-950/40 border-blue-900/50' : 'bg-slate-950/80 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${stage === 'Incoming Requests' ? 'text-amber-500' : stage === 'Open Pool' ? 'text-blue-400' : 'text-slate-300'}`}>{stage}</h4>
                </div>
                <span className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-0.5 rounded-full text-slate-400 font-black">{stageTasks.length}</span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
                {stageTasks.map(task => (
                  <div key={task.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all group relative cursor-pointer" onClick={() => onViewBrief(task)}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black px-2 py-1 border rounded-lg ${task.urgency === 'Emergency' || task.urgency === 'Urgent' ? 'bg-rose-950 border-rose-800 text-rose-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{task.urgency}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-slate-500 font-bold">{task.id}</span>
                        {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') && (
                          <button onClick={(e) => { e.stopPropagation(); onEditBrief(task); }} className="text-slate-500 hover:text-amber-400 transition-colors bg-slate-950 p-1.5 rounded-lg border border-slate-800 hover:border-amber-900/50" title="Edit Brief Details">
                            <Edit2 className="w-3.5 h-3.5"/>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{task.project}</p>
                    <h5 className="text-sm font-bold text-white mb-3 leading-snug">{task.topic}</h5>
                    
                    <p className="text-[10px] text-slate-400 mb-3 border-b border-slate-800 pb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><div className="w-4 h-4 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-bold text-[8px] text-white">{task.designer?.charAt(0) || '?'}</div> {task.designer}</span>
                      <span className="font-bold">{new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </p>
                    
                    {task.lastUpdated && (
                      <div className="text-[9px] text-amber-500/80 font-bold mb-3 flex items-center gap-1.5 bg-amber-500/10 w-fit px-2 py-1 rounded">
                         <AlertTriangle className="w-3 h-3"/> อัปเดตล่าสุด: {task.lastUpdated}
                      </div>
                    )}
                    
                    {/* Action Buttons Area */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {stage === 'Incoming Requests' && (
                         <div className="mt-2">
                           {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') ? (
                             <button onClick={() => approveToPool(task.id, task.urgency)} className={`w-full py-2 text-xs font-black rounded-xl border transition-colors flex items-center justify-center gap-2 ${task.urgency === 'Urgent' && activeUser.Role === 'Creative' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-amber-500/20 text-amber-500 border-amber-900/50 hover:bg-amber-500 hover:text-white'}`}>
                               <CheckSquare className="w-4 h-4"/> Approve to Pool
                             </button>
                           ) : (<p className="text-center text-[10px] text-slate-500 font-bold mt-2">Waiting for Creative</p>)}
                         </div>
                      )}

                      {stage === 'Open Pool' && (
                         <div className="mt-2">
                           {(activeUser.Role === 'Graphic' || activeUser.Role === 'Editor') && task.designer === 'Unassigned' && (
                             <button onClick={() => claimTask(task.id)} className="w-full py-2 bg-blue-600/20 text-blue-400 text-xs font-black rounded-xl border border-blue-900/50 hover:bg-blue-600 hover:text-white transition-colors">
                               Pick up Task
                             </button>
                           )}
                         </div>
                      )}

                      {sIdx > 1 && task.designer === activeUser.Name && (
                         <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/50">
                           <button onClick={() => releaseTask(task.id)} className="flex-1 py-1.5 bg-rose-600/10 text-rose-400 text-[10px] font-black rounded-lg border border-rose-900/50 hover:bg-rose-600 hover:text-white transition-colors">Release</button>
                           <div className="flex gap-1">
                             <button onClick={() => moveTask(task.id, -1)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-white hover:bg-blue-600 transition-colors" disabled={stage === STAGES[2]}>←</button>
                             <button onClick={() => moveTask(task.id, 1)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-white hover:bg-blue-600 transition-colors" disabled={stage === STAGES[STAGES.length - 1]}>→</button>
                           </div>
                         </div>
                      )}
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

// ----------------------------------------------------------------------
// DASHBOARD, TIMELINE, TABLE COMPONENTS
// ----------------------------------------------------------------------
function YearlyDashboardView({ tasks }) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-black text-white mb-6"><BarChart3 className="w-6 h-6 inline mr-2 text-blue-500"/> Yearly Content Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 col-span-1 lg:col-span-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm text-slate-400 font-bold uppercase">Total Tasks Executed</h3>
            <p className="text-4xl font-black text-white mt-2">{tasks.length}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-xs text-slate-500 uppercase font-black">Published</p>
              <p className="text-2xl font-black text-emerald-400">{tasks.filter(t => t.status === 'Published').length}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-xs text-slate-500 uppercase font-black">In Progress</p>
              <p className="text-2xl font-black text-blue-400">{tasks.filter(t => t.status === 'In Progress' || t.status === 'Editing').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoTimelineView({ tasks }) {
  const videoTasks = tasks.filter(t => t.isVideoProduction);
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-black text-white mb-6">Video Production Pipeline</h2>
      <div className="space-y-4">
        {videoTasks.map(task => (
          <div key={task.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div><h4 className="font-bold text-white text-sm">{task.title}</h4><p className="text-xs text-slate-500">Editor: {task.designer}</p></div>
            <div className="text-right"><span className="text-[10px] uppercase font-black text-slate-500 block">Shoot Date</span><span className="text-sm font-bold text-blue-400">{task.shootingDate || 'TBA'}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableView({ tasks, onEditTask }) {
  return (
    <div className="p-6 lg:p-8">
      <h2 className="text-xl font-black text-white mb-6">Master Data Register</h2>
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-900 text-[10px] uppercase text-slate-500">
            <tr><th className="p-4">Action</th><th className="p-4">Project</th><th className="p-4">Type</th><th className="p-4">Status</th><th className="p-4">Deadline</th></tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-800/50">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-slate-900/50">
                <td className="p-4"><button onClick={() => onEditTask(t)} className="text-slate-500 hover:text-blue-400 p-1 bg-slate-900 rounded border border-slate-800"><Edit2 className="w-3.5 h-3.5"/></button></td>
                <td className="p-4 font-bold text-white">{t.project} <span className="text-[10px] text-slate-500 font-normal ml-2">{t.topic}</span></td>
                <td className="p-4 text-slate-400">{t.assetType}</td>
                <td className="p-4 text-slate-300">{t.status}</td>
                <td className="p-4 text-blue-400">{new Date(t.date).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}