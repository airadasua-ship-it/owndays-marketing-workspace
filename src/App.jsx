import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, KanbanSquare, ListTodo, FileEdit, Users, Search, 
  CheckCircle2, Clock, AlertCircle, FileText, Image as ImageIcon,
  Zap, XCircle, Loader2, Trash2, UserPlus, Mail, Calendar as CalendarIcon, 
  Award, Download, Copy, Maximize2, Minimize2, Send, 
  MessageCircle, Video, Film, Play, Eye, ArrowRight,
  FolderOpen, CalendarDays, BarChart3, DownloadCloud, ExternalLink, Image, Grid,
  ChevronLeft, ChevronRight, Trophy, Star, PieChart, Briefcase, Layers, Edit2, History,
  Inbox, CheckSquare, Settings, LogOut, Check, GripVertical, AlertTriangle
} from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycby6j9tUrUE948IhRFbYBcGyJT2h7AzOPp9ZjyfQdKxK1Fw0ypoNH0jBUAx4b42D4luR/exec';

const STAGES = ['Incoming Requests', 'Open Pool', 'In Progress', 'Reviewing', 'Published'];
const COUNTRIES = ['ALL', 'TH', 'MY', 'KH', 'ADS'];
const STANDARD_SIZES = ['FB Single (1080x1080)', 'FB Album (1080x1350)', 'IG Story (1080x1920)', 'Reels / TikTok (1080x1920)', 'Ads (1200x628)'];
const STANDARD_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'LINE', 'Ads', 'Website'];

// ----------------------------------------------------------------------
// DEFAULT DATA SETTINGS
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
  // ลบ Mock users อื่นๆ ออกตามบรีฟ เพื่อให้แอดมินเชิญเอง แต่ใส่ไว้ 1-2 คนเพื่อการทดสอบ
  { UserID: 'u_02', Name: 'Graphic Team', Email: 'graphic@owndays.com', Role: 'Graphic', CountryAccess: 'TH', LINE_ID: 'graphic_1', Status: 'Active' },
  { UserID: 'u_03', Name: 'Creative Team', Email: 'creative@owndays.com', Role: 'Creative', CountryAccess: 'TH', LINE_ID: 'creative_1', Status: 'Active' },
];

const initialMockTasks = [
  { id: 'T-2026-001', title: 'Hello Kitty Exclusive Launch', project: 'Hello Kitty', topic: 'Official Launch', country: 'TH', date: '2026-07-10', pillar: 'Product', assetType: 'Statics', placement: 'Facebook, Instagram', size: 'FB Single (1080x1080), IG Story (1080x1920)', headline: 'Hello Kitty Exclusive', subtext: 'Get special gift box set', condition: 'T&C Apply', caption: 'Preorder now!', designer: 'Unassigned', status: 'Incoming Requests', urgency: 'Urgent', quality: 98 },
  { id: 'T-2026-002', title: 'Star Wars Prelaunch KV', project: 'Star Wars', topic: 'Final call', country: 'TH', date: '2026-07-15', pillar: 'Product', assetType: 'Statics', placement: 'Facebook', size: 'FB Single (1080x1080)', headline: 'MAY THE FORCE BE WITH YOUR EYES', subtext: 'Final day', condition: 'Limited stock.', caption: 'May the force be with you!', designer: 'Unassigned', status: 'Open Pool', urgency: 'Normal', quality: 95 },
  { id: 'T-2026-003', title: 'Siam Square One Closure', project: 'Siam Square One', topic: 'Permanently Closed', country: 'TH', date: '2026-07-20', pillar: 'Store Related', assetType: 'Statics', placement: 'Facebook, Instagram', size: 'FB Single (1080x1080)', headline: 'Permanently Closed', subtext: 'Branch will close.', condition: 'Visit Siam Center.', caption: 'Closed notice.', designer: 'Graphic Team', status: 'In Progress', urgency: 'Normal', quality: 90 },
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
  const [activeUser, setActiveUser] = useState(null); // เริ่มต้นด้วยหน้า Login
  const [permissions, setPermissions] = useState(defaultPermissions);
  
  const [activeView, setActiveView] = useState('board'); 
  const [tasks, setTasks] = useState(initialMockTasks);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editTaskData, setEditTaskData] = useState(null); 
  const [viewingTask, setViewingTask] = useState(null); // สำหรับ Graphic View Brief

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
  // LOGIN SCREEN
  // ----------------------------------------------------------------------
  if (!activeUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-3xl mx-auto mb-6 shadow-lg shadow-blue-500/20">O</div>
          <h2 className="text-2xl font-black text-white text-center mb-2">OWNDAYS Marketing Hub</h2>
          <p className="text-sm text-slate-400 text-center mb-8">Please login to continue</p>
          
          <div className="space-y-3">
            {teamMembers.map(member => (
              <button 
                key={member.UserID} 
                onClick={() => { setActiveUser(member); setActiveView(permissions[member.Role][0]); }}
                className="w-full flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">{member.Name.charAt(0)}</div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{member.Name}</p>
                    <p className="text-[10px] text-slate-500">{member.Email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-2 py-1 rounded">{member.Role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // MAIN APP SHELL
  // ----------------------------------------------------------------------
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
                <SidebarItem icon={Settings} label="Team & Settings" active={activeView === 'team'} onClick={() => setActiveView('team')} />
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
            <button onClick={() => setActiveUser(null)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors" title="Logout"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-900">
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0 shadow-md">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-white capitalize">{activeView.replace('-', ' ')}</h2>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => setSelectedCountry(c)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedCountry === c ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 w-48 lg:w-64"/>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            <div className="w-full h-full overflow-y-auto scrollbar-thin">
              {activeView === 'dashboard' && <YearlyDashboardView tasks={filteredTasks} />}
              {activeView === 'library' && <MediaLibraryView tasks={filteredTasks} />}
              {activeView === 'calendar' && <CalendarPlanView tasks={filteredTasks} setTasks={setTasks} />}
              {activeView === 'brief' && <BriefSlideGenerator setTasks={setTasks} teamMembers={teamMembers} editData={editTaskData} setEditData={setEditTaskData} activeUser={activeUser} apiUrl={API_URL} setActiveView={setActiveView} />}
              {activeView === 'board' && <BoardView tasks={filteredTasks} setTasks={setTasks} activeUser={activeUser} onEditBrief={(t) => { setEditTaskData(t); setActiveView('brief'); }} onViewBrief={setViewingTask} apiUrl={API_URL} />}
              {activeView === 'video-timeline' && <VideoTimelineView tasks={filteredTasks} />}
              {activeView === 'table' && <TableView tasks={filteredTasks} onEditTask={(t) => { setEditTaskData(t); setActiveView('brief'); }} />}
              {activeView === 'team' && <TeamAdminView teamMembers={teamMembers} setTeamMembers={setTeamMembers} activeUser={activeUser} permissions={permissions} setPermissions={setPermissions} apiUrl={API_URL} />}
            </div>
        </div>

        {/* 🟢 MODAL: Graphic Brief Viewer (หน้าต่างดูบรีฟและส่งงานสำหรับทีมกราฟิก) */}
        {viewingTask && (
          <BriefViewerModal task={viewingTask} onClose={() => setViewingTask(null)} activeUser={activeUser} setTasks={setTasks} apiUrl={API_URL} />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// 1. BRIEF VIEWER MODAL (NEW!) - หน้าต่างสำหรับกราฟิกดูบรีฟชัดๆ + ส่งงาน
// ============================================================================
function BriefViewerModal({ task, onClose, activeUser, setTasks, apiUrl }) {
  const [driveLink, setDriveLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAssignedToMe = task.designer === activeUser.Name;
  const canSubmitWork = isAssignedToMe && (task.status === 'In Progress' || task.status === 'Editing');

  const handleSubmitWork = () => {
    if(!driveLink.trim()) return alert("กรุณาใส่ลิงก์ Google Drive ด้วยครับ");
    setIsSubmitting(true);
    
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Reviewing', assetUrl: driveLink } : t));
    
    // Simulate API Call
    setTimeout(() => {
      alert("ส่งงานเรียบร้อยแล้ว! สถานะถูกเปลี่ยนเป็น Reviewing");
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-widest">{task.country}</span>
             <h2 className="font-black text-white text-lg">{task.project}</h2>
             {task.lastUpdated && <span className="bg-amber-500/20 text-amber-500 border border-amber-500/50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3"/> บรีฟถูกแก้ไขล่าสุด: {task.lastUpdated}</span>}
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 rounded-lg transition-colors"><XCircle className="w-5 h-5"/></button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* 🔴 Left: Specification Panel (สเปกไฟล์ที่ต้องทำ) */}
          <div className="lg:w-1/3 bg-slate-950/50 border-r border-slate-800 p-6 lg:p-8 overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Layers className="w-4 h-4"/> Specifications</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {task.placement ? task.placement.split(',').map(p => <span key={p} className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">{p.trim()}</span>) : '-'}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Required Sizes (ไซส์ที่ต้องทำ)</p>
                <div className="flex flex-col gap-2">
                  {task.size ? task.size.split(',').map(s => <span key={s} className="bg-rose-950/50 text-rose-300 border border-rose-900/50 px-3 py-2 rounded-lg text-sm font-black shadow-sm">{s.trim()}</span>) : '-'}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Target Date</p>
                <p className="text-lg font-black text-white">{new Date(task.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Assignee</p>
                <p className="text-sm font-bold text-blue-400">{task.designer}</p>
              </div>
            </div>
          </div>

          {/* 🔵 Right: Content & Copywriting (ข้อความที่ต้องใส่ในภาพ) */}
          <div className="lg:w-2/3 p-6 lg:p-10 overflow-y-auto scrollbar-thin bg-slate-900 flex flex-col">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"><FileText className="w-4 h-4"/> Content & Copywriting</h3>
            
            <div className="flex-1 space-y-8">
              {/* Main Headline */}
              <div className="bg-slate-950 border-l-4 border-blue-500 p-6 rounded-r-2xl shadow-lg">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">📌 ข้อความหลัก (Main Headline - เน้นใหญ่สุด)</p>
                <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight">{task.headline || '-'}</h1>
              </div>

              {/* Subtext */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">📝 ข้อความรอง / รายละเอียด (Subtext)</p>
                <h3 className="text-lg font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">{task.subtext || '-'}</h3>
              </div>

              {/* Condition */}
              {task.condition && (
                <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl inline-block">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">⚠️ เงื่อนไข (Conditions / Footer)</p>
                  <p className="text-xs font-bold text-amber-200">{task.condition}</p>
                </div>
              )}

              {/* Social Caption */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">💬 Social Media Caption (สำหรับ Post)</p>
                <div className="bg-slate-900 p-4 rounded-xl text-xs text-slate-400 font-mono whitespace-pre-wrap border border-slate-800">
                  {task.caption || '-'}
                </div>
              </div>
            </div>

            {/* 📤 Submit Work Area (แสดงเฉพาะคนที่รับผิดชอบงานนี้) */}
            {canSubmitWork && (
              <div className="mt-8 bg-blue-950/30 border border-blue-900/50 rounded-2xl p-6 shadow-inner shrink-0">
                <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Submit Final Work (ส่งงาน)</h4>
                <p className="text-xs text-slate-400 mb-4">เมื่อทำอาร์ตเวิร์กเสร็จแล้ว กรุณาแปะลิงก์ Google Drive งานที่นี่ เพื่อส่งให้ Creative ตรวจสอบ</p>
                <div className="flex gap-3">
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/..." 
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="flex-1 bg-slate-950 border border-blue-900/50 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={handleSubmitWork}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                    Submit Work
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
// 2. CALENDAR VIEW (อัปเกรด: Drag & Drop + สีตามโปรเจกต์)
// ============================================================================
function CalendarPlanView({ tasks, setTasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-07-01'));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const tasksInMonth = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate.getMonth() === currentMonth.getMonth() && taskDate.getFullYear() === currentMonth.getFullYear();
  });

  // HTML5 Drag and Drop Functions
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // อนุญาตให้ Drop ลงได้
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // คำนวณวันที่ใหม่
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const newDateString = newDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // อัปเดต Task ใน State
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, date: newDateString } : t));
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarDays className="text-blue-500 w-6 h-6"/> Content Calendar Plan
          </h2>
          <p className="text-xs text-slate-500 mt-1">สามารถคลิกค้างที่การ์ดงานแล้วลาก (Drag & Drop) เพื่อเลื่อนวันที่ได้เลย</p>
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
                        draggable // ทำให้ลากได้
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`text-left px-2 py-1.5 rounded-lg border text-[10px] leading-tight font-medium cursor-grab active:cursor-grabbing transition-colors shadow-sm relative group/task ${colorClass}`}
                      >
                        {/* Grip icon โชว์ตอน hover */}
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
// 3. TEAM & ADMIN VIEW (เพิ่มระบบกำหนด Permissions)
// ----------------------------------------------------------------------
function TeamAdminView({ teamMembers, setTeamMembers, activeUser, permissions, setPermissions }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Graphic');

  const isSuperAdmin = activeUser.Role === 'SuperAdmin';
  const isManager = activeUser.Role === 'Manager';
  const canInvite = isSuperAdmin || isManager;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!canInvite) return;
    const newMember = { UserID: 'u_' + Date.now(), Name: name, Email: email, Role: role, CountryAccess: 'TH', LINE_ID: '', Status: 'Active', TasksCompleted: 0 };
    setTeamMembers([...teamMembers, newMember]);
    setShowAddModal(false);
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
          <p className="text-xs text-slate-500 mt-1">Manage users and access rights</p>
        </div>
        {canInvite && (
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4"/> Invite User
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.UserID} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.Name}&backgroundColor=0f172a`} className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900" alt="" />
             <div>
               <h3 className="font-bold text-white text-sm flex items-center gap-1">
                 {member.Name} 
                 {(member.Role === 'SuperAdmin' || member.Role === 'Manager') && <Award className="w-3.5 h-3.5 text-yellow-500"/>}
               </h3>
               <span className="text-[10px] text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50 mt-1 inline-block">{member.Role}</span>
             </div>
          </div>
        ))}
      </div>

      {/* ส่วนตั้งค่า Permissions (เห็นเฉพาะ SuperAdmin) */}
      {isSuperAdmin && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mt-8">
          <h3 className="text-base font-black text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-amber-500"/> Role Permissions (SuperAdmin Only)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-3">Role</th>
                  {ALL_VIEWS.map(v => <th key={v.id} className="p-3 text-center">{v.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Object.keys(permissions).map(roleName => {
                  if(roleName === 'SuperAdmin') return null; // ซ่อน SuperAdmin ไม่ให้แก้ของตัวเอง
                  return (
                    <tr key={roleName} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white">{roleName}</td>
                      {ALL_VIEWS.map(v => (
                        <td key={v.id} className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={permissions[roleName].includes(v.id)}
                            onChange={() => togglePermission(roleName, v.id)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
                          />
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500"><XCircle className="w-5 h-5"/></button>
            <h3 className="text-base font-black text-white mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500"/> Invite User</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div><label className="text-xs text-slate-400">Name</label><input required className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm" value={name} onChange={e=>setName(e.target.value)} /></div>
              <div><label className="text-xs text-slate-400">Role</label>
                <select className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="Graphic">Graphic</option><option value="Editor">Editor</option><option value="Manager">Manager</option><option value="Creative">Creative</option><option value="Requester">Requester (External)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm">Send Invite</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. KANBAN BOARD (อัปเดตให้กดคลิกเพื่อดู Modal Brief ได้)
// ============================================================================
function BoardView({ tasks, setTasks, activeUser, onEditBrief, onViewBrief }) {
  
  const moveTask = (taskId, direction) => {
    setTasks(currentTasks => currentTasks.map(t => {
      if (t.id === taskId) {
        const currentIndex = STAGES.indexOf(t.status);
        let newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < STAGES.length) return { ...t, status: STAGES[newIndex] };
      }
      return t;
    }));
  };

  const claimTask = (taskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, designer: activeUser.Name, status: 'In Progress' } : t));
  const releaseTask = (taskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, designer: 'Unassigned', status: 'Open Pool' } : t));
  
  const approveToPool = (taskId, urgency) => {
    if ((urgency === 'Urgent' || urgency === 'Emergency') && activeUser.Role === 'Creative') {
      return alert('ไม่อนุญาต: งานระดับ Urgent/Emergency ต้องได้รับการอนุมัติจาก Manager หรือ SuperAdmin');
    }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Open Pool' } : t));
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Creative Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">คลิกที่กล่องงานเพื่อดูบรีฟฉบับเต็มและส่งงาน</p>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start snap-x">
        {STAGES.map((stage, sIdx) => {
          const stageTasks = tasks.filter(t => t.status === stage);
          return (
            <div key={stage} className={`bg-slate-950/40 border rounded-2xl w-[340px] shrink-0 flex flex-col max-h-full snap-center ${stage === 'Incoming Requests' ? 'border-amber-900/50' : stage === 'Open Pool' ? 'border-blue-900/50' : 'border-slate-800'}`}>
              <div className={`p-4 border-b flex justify-between items-center rounded-t-2xl ${stage === 'Incoming Requests' ? 'bg-amber-950/40 border-amber-900/50' : stage === 'Open Pool' ? 'bg-blue-950/40 border-blue-900/50' : 'bg-slate-950/80 border-slate-800'}`}>
                <h4 className={`text-xs font-black uppercase tracking-wider ${stage === 'Incoming Requests' ? 'text-amber-500' : stage === 'Open Pool' ? 'text-blue-400' : 'text-slate-300'}`}>{stage}</h4>
                <span className="bg-slate-900 border border-slate-800 text-xs px-2 rounded-full text-slate-400">{stageTasks.length}</span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
                {stageTasks.map(task => (
                  <div key={task.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50 transition-all group relative cursor-pointer" onClick={() => onViewBrief(task)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 border rounded ${task.urgency === 'Emergency' || task.urgency === 'Urgent' ? 'bg-rose-950 border-rose-800 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>{task.urgency}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-slate-500 font-bold">{task.id}</span>
                        {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') && (
                          <button onClick={(e) => { e.stopPropagation(); onEditBrief(task); }} className="text-slate-500 hover:text-blue-400 transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                        )}
                      </div>
                    </div>
                    
                    <h5 className="text-sm font-bold text-white mb-2 leading-snug">{task.topic || task.title}</h5>
                    <p className="text-[10px] text-slate-400 mb-2 border-b border-slate-800/50 pb-2 flex items-center justify-between">
                      <span>Assignee: <span className="font-bold text-blue-400">{task.designer}</span></span>
                      <span>{new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </p>
                    
                    {task.lastUpdated && (
                      <div className="text-[9px] text-amber-500/80 font-bold mb-3 flex items-center gap-1 animate-pulse">
                         <AlertTriangle className="w-3 h-3"/> Edited: {task.lastUpdated}
                      </div>
                    )}
                    
                    {/* Logic ปุ่มต่างๆ (ต้องกดหยุด Propagation เพื่อไม่ให้ Modal เด้งซ้อน) */}
                    {stage === 'Incoming Requests' && (
                       <div className="mt-2">
                         {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') ? (
                           <button onClick={(e) => { e.stopPropagation(); approveToPool(task.id, task.urgency); }} className={`w-full py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${task.urgency === 'Urgent' && activeUser.Role === 'Creative' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-amber-500/20 text-amber-500 border-amber-900/50 hover:bg-amber-500 hover:text-white'}`}>
                             <CheckSquare className="w-3.5 h-3.5"/> Approve to Open Pool
                           </button>
                         ) : (<p className="text-center text-[10px] text-slate-500 italic mt-2">Waiting for Creative</p>)}
                       </div>
                    )}

                    {stage === 'Open Pool' && (
                       <div className="mt-2">
                         {(activeUser.Role === 'Graphic' || activeUser.Role === 'Editor') && task.designer === 'Unassigned' && (
                           <button onClick={(e) => { e.stopPropagation(); claimTask(task.id); }} className="w-full py-1.5 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-900/50 hover:bg-blue-600 hover:text-white transition-colors">Pick up this Task</button>
                         )}
                       </div>
                    )}

                    {sIdx > 1 && task.designer === activeUser.Name && (
                       <button onClick={(e) => { e.stopPropagation(); releaseTask(task.id); }} className="w-full py-1.5 bg-rose-600/10 text-rose-400 text-xs font-bold rounded-lg border border-rose-900/50 hover:bg-rose-600 hover:text-white transition-colors mt-2">Release Task</button>
                    )}

                    {sIdx > 1 && (activeUser.Role === 'Graphic' || activeUser.Role === 'Editor' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') && (
                      <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, -1); }} className="px-2 py-1 bg-slate-800 rounded text-xs text-white" disabled={stage === STAGES[2]}>←</button>
                         <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 1); }} className="px-2 py-1 bg-slate-800 rounded text-xs text-white" disabled={stage === STAGES[STAGES.length - 1]}>→</button>
                      </div>
                    )}
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
// 5. BRIEF GENERATOR / EDIT FORM
// ----------------------------------------------------------------------
function BriefSlideGenerator({ setTasks, teamMembers, editData, setEditData, activeUser, setActiveView }) {
  const [briefType, setBriefType] = useState(editData?.isVideoProduction ? 'video' : 'graphic');

  const initSizes = editData ? (editData.size || '').split(', ').filter(s => STANDARD_SIZES.includes(s)) : [];
  const initPlatforms = editData ? (editData.placement || '').split(', ').filter(p => STANDARD_PLATFORMS.includes(p)) : [];
  const initOtherSize = editData ? (editData.size || '').split(', ').filter(s => !STANDARD_SIZES.includes(s)).join(', ') : '';

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

  const handlePublish = () => {
    if (!formData.project || !formData.topic) return alert("Please fill in Project and Topic.");
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

    setTimeout(() => { // Simulate API Call
      if (formData.id) {
        setTasks(prev => prev.map(t => t.id === formData.id ? { ...t, ...payload } : t));
        alert('อัปเดตบรีฟสำเร็จ!');
      } else {
        setTasks(prev => [payload, ...prev]);
        alert('สร้างบรีฟสำเร็จ ส่งเข้าคิว Incoming Requests แล้ว');
        setFormData({ ...formData, project: '', topic: '', mainTitle: '', subTitle: '', caption: '' });
      }
      setIsSubmitting(false);
      setEditData(null);
      if(activeUser.Role !== 'Requester') setActiveView('board'); // กลับไปหน้า Board
    }, 500);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-900 relative">
      <div className={`h-full overflow-y-auto p-6 flex flex-col items-center bg-slate-900/60 transition-all ${isFullscreen ? 'w-full absolute inset-0 z-50 bg-slate-950' : 'w-2/3'}`}>
        
        {editData && (
          <div className="w-full max-w-5xl bg-amber-500/20 border border-amber-500/50 rounded-lg p-3 mb-4 flex items-center justify-between text-amber-400 text-sm font-bold">
            <div className="flex items-center gap-2"><Edit2 className="w-4 h-4"/> โหมดแก้ไขบรีฟ (Editing Mode)</div>
            <button onClick={() => { setEditData(null); setActiveView('board'); }} className="text-amber-200 hover:text-white underline text-xs">Cancel Edit</button>
          </div>
        )}

        <div className="w-full max-w-5xl flex items-center justify-between mb-4">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
             <button onClick={() => setBriefType('graphic')} className={`px-4 py-1.5 rounded text-xs font-black transition-all ${briefType === 'graphic' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>🎨 Graphic Brief</button>
             <button onClick={() => setBriefType('video')} className={`px-4 py-1.5 rounded text-xs font-black transition-all ${briefType === 'video' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>🎥 Video Brief</button>
          </div>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2">
             {isFullscreen ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
             {isFullscreen ? 'Exit Presentation' : 'Present Slide'}
          </button>
        </div>

        {/* Slide Preview (เหมือน Google Slides) */}
        <div className="w-full max-w-5xl aspect-[16/9] bg-white shadow-2xl border-2 border-slate-400 rounded-lg relative overflow-hidden flex flex-col text-slate-900">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
               <span className="bg-blue-600 px-3 py-1 rounded text-xs font-black uppercase tracking-widest">{formData.country}</span>
               <h2 className="font-black text-lg">{formData.project || '[Project Name]'}</h2>
             </div>
             <div className="text-right">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Date</p>
               <p className="font-black text-blue-400 text-lg">{new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
             </div>
          </div>

          <div className="flex-1 flex flex-col p-8 lg:p-12">
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 shrink-0">
                <div className="flex-1 border-r border-slate-200 pr-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">📱 แพลตฟอร์มที่ใช้ (Placement)</p>
                  <p className="font-bold text-slate-800">{formData.selectedPlatforms.join(', ') || 'ยังไม่ได้ระบุแพลตฟอร์ม'}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2">📏 ไซส์ที่ต้องทำ (Required Sizes)</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedSizes.map(s => <span key={s} className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-1 rounded text-xs font-black">{s}</span>)}
                    {formData.otherSize && <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-1 rounded text-xs font-black">{formData.otherSize}</span>}
                  </div>
                </div>
             </div>

             <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">📌 ข้อความหลักที่ต้องเน้นใหญ่ที่สุด (Main Headline)</p>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-snug mb-6">{formData.mainTitle || '[รอใส่หัวข้อหลัก]'}</h1>
                
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">📝 ข้อความรอง / รายละเอียด (Subtext)</p>
                <h3 className="text-xl font-bold text-slate-700 leading-relaxed max-w-3xl mb-8 whitespace-pre-wrap">{formData.subTitle || '[รอใส่รายละเอียดรอง]'}</h3>
                
                <div className="mt-auto self-start">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">⚠️ เงื่อนไขเพิ่มเติม (Conditions / Footer)</p>
                  <span className="inline-block bg-yellow-200 text-yellow-900 font-bold px-4 py-2 rounded-lg text-sm">{formData.footerText || '[ไม่มีเงื่อนไขเพิ่มเติม]'}</span>
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
            <Settings className="w-5 h-5 text-blue-500"/> {editData ? 'Edit Details' : 'New Brief Settings'}
          </h3>

          <div className="bg-amber-500/10 border border-amber-500/50 p-3 rounded-lg mb-6 text-[10px] text-amber-500 font-medium leading-relaxed">
             <strong className="block text-amber-400 text-xs mb-1">⚠️ ข้อกำหนดการขอ Artwork / Video</strong>
             กรุณาเผื่อระยะเวลาทำงานล่วงหน้า 1 สัปดาห์ หากเป็นงานด่วน <span className="font-black text-rose-400">Urgent</span> ระบบจะส่งให้ Manager อนุมัติ
          </div>
          
          <div className="space-y-6">
             <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-2">1. Basic Info</p>
                <div><label className="text-xs text-slate-400 block mb-1">Project</label><input name="project" value={formData.project} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Topic</label><input name="topic" value={formData.topic} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Target Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
             </div>

             <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-800 pb-2">2. Platforms & Sizes</p>
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-2">Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_PLATFORMS.map(p => (
                      <button key={p} onClick={() => toggleCheckbox('selectedPlatforms', p)} className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${formData.selectedPlatforms.includes(p) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-2">Standard Sizes</label>
                  <div className="flex flex-col gap-2">
                    {STANDARD_SIZES.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={formData.selectedSizes.includes(s)} onChange={() => toggleCheckbox('selectedSizes', s)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"/>
                        <span className={`text-xs ${formData.selectedSizes.includes(s) ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-300'}`}>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Other Sizes (ระบุไซส์อื่นๆ)</label>
                  <input name="otherSize" value={formData.otherSize} onChange={handleInputChange} placeholder="e.g., Cover Page (820x312)" className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg text-xs text-white"/>
                </div>
             </div>

             <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">3. Copywriting</p>
                <div>
                  <label className="text-xs text-amber-400 font-bold block mb-1 flex items-center justify-between"><span>Main Headline (เน้นใหญ่สุด)</span><AlertCircle className="w-3 h-3"/></label>
                  <input name="mainTitle" value={formData.mainTitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-amber-900/50 p-2 rounded-lg text-xs text-amber-100 font-bold"/>
                </div>
                <div><label className="text-xs text-slate-400 block mb-1">Subtext (รายละเอียดรอง)</label><textarea name="subTitle" value={formData.subTitle} onChange={handleInputChange} rows={3} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Conditions (เงื่อนไขใต้ภาพ)</label><input name="footerText" value={formData.footerText} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-400"/></div>
                <div><label className="text-xs text-slate-400 block mb-1 mt-2">Social Caption</label><textarea name="caption" value={formData.caption} onChange={handleInputChange} rows={3} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-400"/></div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 pt-2">
               {activeUser.Role !== 'Requester' && (
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Assign To</label>
                   <select name="designer" value={formData.designer} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white font-bold">
                      <option value="Unassigned">Unassigned (To Pool)</option>
                      {teamMembers.filter(m => m.Role === 'Graphic' || m.Role === 'Editor').map(m => <option key={m.Name} value={m.Name}>{m.Name} ({m.Role})</option>)}
                   </select>
                 </div>
               )}
               <div className={activeUser.Role === 'Requester' ? "col-span-2" : ""}>
                 <label className="text-xs text-slate-400 block mb-1">Urgency</label>
                 <select name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white font-bold">
                    <option value="Normal">Normal (ล่วงหน้า 1 สัปดาห์)</option><option value="Urgent">Urgent (งานด่วน)</option><option value="Emergency">Emergency (ด่วนพิเศษ)</option>
                 </select>
               </div>
             </div>
             
             <button onClick={handlePublish} disabled={isSubmitting} className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-xl text-xs flex justify-center items-center shadow-lg shadow-blue-600/20 transition-all">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : (editData ? 'Save Updates' : 'Generate & Add to Pool')}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. DASHBOARD & OTHERS (คงเดิมจากที่คอมไพล์ผ่านแล้ว)
// ----------------------------------------------------------------------
function YearlyDashboardView({ tasks }) {
  // สรุปข้อมูลสำหรับ Dashboard
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