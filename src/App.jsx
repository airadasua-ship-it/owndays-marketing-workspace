import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, KanbanSquare, ListTodo, FileEdit, Users, Search, 
  CheckCircle2, Clock, AlertCircle, FileText, Image as ImageIcon,
  Zap, XCircle, Loader2, Trash2, UserPlus, Mail, Calendar as CalendarIcon, 
  Award, Download, Copy, Maximize2, Minimize2, Send, 
  MessageCircle, Video, Film, Play, Eye, ArrowRight,
  FolderOpen, CalendarDays, BarChart3, DownloadCloud, ExternalLink, Image, Grid,
  ChevronLeft, ChevronRight, Trophy, Star, PieChart, Briefcase, Layers, Edit2, History,
  Inbox, CheckSquare, Settings, LogOut, Check, GripVertical, AlertTriangle, Link as LinkIcon,
  Palette, Plus, Type, Square, Circle, BringToFront, SendToBack, MousePointer2, Smartphone, Ruler
} from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycby6j9tUrUE948IhRFbYBcGyJT2h7AzOPp9ZjyfQdKxK1Fw0ypoNH0jBUAx4b42D4luR/exec';

const STAGES = ['Incoming Requests', 'Open Pool', 'In Progress', 'Reviewing', 'Published'];
const COUNTRIES = ['ALL', 'TH', 'MY', 'KH', 'ADS'];
const STANDARD_SIZES = ['FB Single (1080x1080)', 'FB Album (1080x1350)', 'IG Story (1080x1920)', 'Reels / TikTok (1080x1920)', 'Ads (1200x628)'];
const STANDARD_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'LINE', 'Ads', 'Website'];

const THEMES = {
  blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', outline: 'focus:border-blue-500', lightBg: 'bg-blue-600/20' },
  rose: { bg: 'bg-rose-600', hover: 'hover:bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', outline: 'focus:border-rose-500', lightBg: 'bg-rose-600/20' },
  emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', outline: 'focus:border-emerald-500', lightBg: 'bg-emerald-600/20' },
  amber: { bg: 'bg-amber-600', hover: 'hover:bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', outline: 'focus:border-amber-500', lightBg: 'bg-amber-600/20' },
  purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', outline: 'focus:border-purple-500', lightBg: 'bg-purple-600/20' }
};

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

const initialMockTasks = [
  { id: 'T-2026-001', title: 'Hello Kitty Exclusive Launch', project: 'Hello Kitty', topic: 'Official Launch', country: 'TH', date: '2026-07-10', pillar: 'Product', assetType: 'Statics', placement: 'Facebook, Instagram', size: 'FB Single (1080x1080), IG Story (1080x1920)', headline: 'Hello Kitty Exclusive', subtext: 'Get special gift box set', condition: 'T&C Apply', caption: 'Preorder now!', designer: 'Unassigned', status: 'Incoming Requests', urgency: 'Urgent', quality: 98 },
  { id: 'T-2026-002', title: 'Star Wars Prelaunch KV', project: 'Star Wars', topic: 'Final call', country: 'TH', date: '2026-07-15', pillar: 'Product', assetType: 'Statics', placement: 'Facebook', size: 'FB Single (1080x1080)', headline: 'MAY THE FORCE BE WITH YOUR EYES', subtext: 'Final day', condition: 'Limited stock.', caption: 'May the force be with you!', designer: 'Unassigned', status: 'Open Pool', urgency: 'Normal', quality: 95 },
  { id: 'T-2026-003', title: 'Siam Square One Closure', project: 'Siam Square One', topic: 'Permanently Closed', country: 'TH', date: '2026-07-20', pillar: 'Store Related', assetType: 'Statics', placement: 'Facebook, Instagram', size: 'FB Single (1080x1080)', headline: 'Permanently Closed', subtext: 'Branch will close.', condition: 'Visit Siam Center.', caption: 'Closed notice.', designer: 'Unassigned', status: 'In Progress', urgency: 'Normal', quality: 90 },
];

// Helper ปลอดภัยป้องกันหน้าจอขาวจากการจัดรูปแบบเวลา
const safeFormatDate = (dateString, options = { day: '2-digit', month: 'short', year: 'numeric' }) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', options);
};

function SidebarItem({ icon: Icon, label, active, onClick, badge, visible = true, theme }) {
  if (!visible) return null;
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? `${theme.bg} text-white shadow-md` : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
      <div className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" /><span>{label}</span></div>
      {badge && <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">{badge}</span>}
    </button>
  );
}

export default function App() {
  const [activeUser, setActiveUser] = useState(null); 
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [themeColor, setThemeColor] = useState('blue');
  const theme = THEMES[themeColor];
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeView, setActiveView] = useState('board'); 
  const [tasks, setTasks] = useState(initialMockTasks);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editTaskData, setEditTaskData] = useState(null); 
  const [viewingTask, setViewingTask] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchAllData = async () => {
    setIsLoadingData(true);
    try {
      const taskRes = await fetch(`${API_URL}?action=getTasks`);
      const taskJson = await taskRes.json();
      if (taskJson.success && taskJson.data.length > 0) {
        const validated = taskJson.data.map(t => ({
          ...t,
          date: t.date && !isNaN(new Date(t.date).getTime()) ? t.date : new Date().toISOString().split('T')[0]
        }));
        setTasks(validated);
      }

      const userRes = await fetch(`${API_URL}?action=getUsers`);
      const userJson = await userRes.json();
      if (userJson.success && userJson.data.length > 0) {
        const fetchedUsers = userJson.data;
        const hasAdmin = fetchedUsers.some(u => u.Email === 'airada.s@owndays.com');
        setTeamMembers(hasAdmin ? fetchedUsers : [...initialTeamMembers, ...fetchedUsers]);
      }
    } catch (e) {
      console.log('Using local state due to fetch error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const savedTheme = localStorage.getItem('owndays_theme');
    if(savedTheme && THEMES[savedTheme]) setThemeColor(savedTheme);
  }, []);

  const changeTheme = (color) => {
    setThemeColor(color);
    localStorage.setItem('owndays_theme', color);
  };

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
    if (activeUser.Role === 'SuperAdmin') return true; 
    return permissions[activeUser.Role]?.includes(viewName);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    const user = teamMembers.find(m => m.Email.toLowerCase() === loginEmail.toLowerCase().trim());
    
    setTimeout(() => { 
      if (user) {
        setActiveUser(user);
        if (user.Role === 'SuperAdmin') setActiveView('board');
        else {
          const userViews = permissions[user.Role] || [];
          if (userViews.includes('board')) setActiveView('board');
          else if (userViews.includes('brief')) setActiveView('brief');
          else setActiveView(userViews[0] || 'dashboard');
        }
      } else {
        setLoginError('Email not found in system. Please contact the manager for an invitation.');
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
            <div className={`w-16 h-16 ${theme.bg} rounded-xl flex items-center justify-center font-black text-white text-3xl mx-auto mb-6 shadow-lg shadow-blue-500/20`}>O</div>
            <h2 className="text-2xl font-black text-white text-center mb-2">OWNDAYS Marketing Hub</h2>
            <p className="text-sm text-slate-400 text-center mb-8">Login to access the workspace</p>
            
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
                  className={`w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none ${theme.outline} text-sm font-medium transition-colors`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full ${theme.bg} ${theme.hover} text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg mt-4 flex justify-center items-center gap-2`}
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin"/> : <><CheckCircle2 className="w-4 h-4"/> Sign In</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 z-20 shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className={`w-8 h-8 ${theme.bg} rounded flex items-center justify-center font-bold text-white mr-3 shadow-lg`}>O</div>
          <div><h1 className="font-bold text-white text-sm tracking-wide">OWNDAYS</h1><p className="text-[10px] uppercase tracking-wider text-slate-400">Marketing Hub</p></div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
          {(hasAccess('dashboard') || hasAccess('library') || hasAccess('calendar')) && (
            <>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2">Data & Analytics</p>
              <nav className="space-y-1 mb-6">
                <SidebarItem icon={BarChart3} label="Yearly Dashboard" theme={theme} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} visible={hasAccess('dashboard')} />
                <SidebarItem icon={FolderOpen} label="Media Library" theme={theme} active={activeView === 'library'} onClick={() => setActiveView('library')} visible={hasAccess('library')} />
                <SidebarItem icon={CalendarDays} label="Calendar Plan" theme={theme} active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} visible={hasAccess('calendar')} />
              </nav>
            </>
          )}

          <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2">Workspace</p>
          <nav className="space-y-1 mb-8">
            <SidebarItem icon={FileEdit} label={activeUser.Role === 'Requester' ? "Submit Request" : "Brief Generator"} theme={theme} active={activeView === 'brief'} onClick={() => { setEditTaskData(null); setActiveView('brief'); }} visible={hasAccess('brief')} />
            <SidebarItem icon={KanbanSquare} label="Creative Board" theme={theme} active={activeView === 'board'} onClick={() => setActiveView('board')} visible={hasAccess('board')} />
            <SidebarItem icon={Film} label="Video Pipeline" theme={theme} active={activeView === 'video-timeline'} onClick={() => setActiveView('video-timeline')} visible={hasAccess('video-timeline')} />
            <SidebarItem icon={ListTodo} label="Master Data List" theme={theme} active={activeView === 'table'} onClick={() => setActiveView('table')} visible={hasAccess('table')} />
          </nav>

          {hasAccess('team') && (
            <>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2 mt-4">Management</p>
              <nav className="space-y-1">
                <SidebarItem icon={Settings} label="Team & Permissions" theme={theme} active={activeView === 'team'} onClick={() => setActiveView('team')} />
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
                <button key={c} onClick={() => setSelectedCountry(c)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedCountry === c ? `${theme.bg} text-white shadow-sm` : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-full transition-colors">
                <Palette className="w-4 h-4"/>
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-slate-950 border border-slate-800 rounded-xl p-2 hidden group-hover:flex flex-col gap-2 shadow-xl z-50">
                {Object.keys(THEMES).map(color => (
                  <button key={color} onClick={() => changeTheme(color)} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors flex items-center gap-2 ${themeColor === color ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                    <span className={`w-3 h-3 rounded-full ${THEMES[color].bg}`}></span> {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search Topic, Project..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder:text-slate-500 outline-none ${theme.outline} w-48 lg:w-64`}/>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            {isLoadingData ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <Loader2 className={`w-8 h-8 animate-spin mb-4 ${theme.text}`}/>
                <p className="font-bold tracking-widest uppercase text-xs">Syncing with Server...</p>
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto scrollbar-thin">
                {activeView === 'dashboard' && <YearlyDashboardView tasks={filteredTasks} theme={theme} />}
                {activeView === 'library' && <MediaLibraryView tasks={filteredTasks} theme={theme} />}
                {activeView === 'calendar' && <CalendarPlanView tasks={filteredTasks} setTasks={setTasks} apiUrl={API_URL} theme={theme} />}
                {activeView === 'brief' && <BriefSlideGenerator setTasks={setTasks} editData={editTaskData} setEditData={setEditTaskData} activeUser={activeUser} apiUrl={API_URL} setActiveView={setActiveView} theme={theme} themeColor={themeColor} />}
                {activeView === 'board' && <BoardView tasks={filteredTasks} setTasks={setTasks} activeUser={activeUser} onEditBrief={(t) => { setEditTaskData(t); setActiveView('brief'); }} onViewBrief={setViewingTask} apiUrl={API_URL} theme={theme} themeColor={themeColor} />}
                {activeView === 'video-timeline' && <VideoTimelineView tasks={filteredTasks} theme={theme} />}
                {activeView === 'table' && <TableView tasks={filteredTasks} onEditTask={(t) => { setEditTaskData(t); setActiveView('brief'); }} theme={theme} />}
                {activeView === 'team' && <TeamAdminView teamMembers={teamMembers} setTeamMembers={setTeamMembers} activeUser={activeUser} permissions={permissions} setPermissions={setPermissions} apiUrl={API_URL} theme={theme} />}
              </div>
            )}
        </div>

        {viewingTask && (
          <BriefViewerModal task={viewingTask} onClose={() => setViewingTask(null)} activeUser={activeUser} setTasks={setTasks} apiUrl={API_URL} theme={theme} />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// 1. BRIEF VIEWER MODAL (Graphic & Video Viewer & Submit Work)
// ============================================================================
function BriefViewerModal({ task, onClose, activeUser, setTasks, apiUrl, theme }) {
  const [driveLink, setDriveLink] = useState(task.assetUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  let parsedCaption = task.caption || '';
  let canvasElements = [];
  const isVideo = task.isVideoProduction || task.assetType === 'Video';

  try {
    const data = JSON.parse(task.caption);
    if (data.elements) {
      parsedCaption = data.text;
      canvasElements = data.elements;
    }
  } catch (e) {
    if(task.headline) {
      canvasElements.push({ id: 'legacy-1', type: 'text', text: task.headline, x: 40, y: 40, fontSize: 48, color: '#0f172a', fontWeight: 'bold' });
    }
    if(task.subtext) {
      canvasElements.push({ id: 'legacy-2', type: 'text', text: task.subtext, x: 40, y: 120, fontSize: 24, color: '#475569', fontWeight: 'normal' });
    }
  }

  // ปลดล็อกให้ทุกตำแหน่งที่ทำงานออกแบบสามารถเข้าถึงช่องส่งงาน และมองเห็นลิงก์ที่เคยส่งไปแล้วได้ทันที
  const canSubmitWork = ['Graphic', 'Editor', 'SuperAdmin', 'Manager', 'Creative'].includes(activeUser.Role) && task.status !== 'Published';

  const handleSubmitWork = async () => {
    if(!driveLink.trim()) return alert("Please provide a Google Drive or asset link to submit.");
    setIsSubmitting(true);
    
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Reviewing', assetUrl: driveLink } : t));
    
    try {
      await fetch(apiUrl, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'updateStatus', taskId: task.id, newStatus: 'Reviewing', userId: activeUser.Name, assetUrl: driveLink }) 
      });
      alert("Work submitted successfully! Status changed to Reviewing.");
      onClose();
    } catch (error) {
      alert("Error submitting work (Mock Mode Saved locally)");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <span className={`${theme.bg} text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm`}>{task.country}</span>
             <h2 className="font-black text-white text-xl">{task.project}</h2>
             {task.lastUpdated && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Last Edited: {task.lastUpdated}</span>}
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm"><XCircle className="w-5 h-5"/></button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-slate-900">
          
          <div className="lg:w-[35%] bg-slate-950/50 border-r border-slate-800 p-8 overflow-y-auto scrollbar-thin flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-3"><Layers className={`w-4 h-4 ${theme.text}`}/> Specifications</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Smartphone className="w-3 h-3"/> Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {task.placement ? task.placement.split(',').map(p => <span key={p} className="bg-slate-900 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">{p.trim()}</span>) : '-'}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Ruler className="w-3 h-3"/> Required Sizes</p>
                  <div className="flex flex-col gap-2">
                    {task.size ? task.size.split(',').map(s => <span key={s} className="bg-slate-900 text-slate-300 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm">{s.trim()}</span>) : '-'}
                  </div>
                </div>

                {task.refLink && (
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><LinkIcon className="w-3 h-3"/> Reference Link</p>
                    <a href={task.refLink} target="_blank" rel="noreferrer" className={`text-sm font-bold ${theme.text} hover:underline break-all`}>{task.refLink}</a>
                  </div>
                )}

                {task.assetUrl && (
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mt-4">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Delivered Asset Link</p>
                    <a href={task.assetUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5"/> Open Submitted Work (ลิงก์ส่งงาน)
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto space-y-6 pt-6 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target Date</p>
                <p className="text-2xl font-black text-rose-400">{safeFormatDate(task.date)}</p>
              </div>
              <div className="mb-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Assignee</p>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">{(task.designer || 'U').charAt(0)}</span>
                  {task.designer || 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-[65%] flex flex-col relative overflow-hidden bg-slate-100">
            {/* Conditional Render: If Video, show clean structured slide. If Graphic, show Canvas rendering */}
            {isVideo ? (
              <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
                <div className="relative bg-white shadow-lg overflow-hidden border border-slate-300 p-10 flex flex-col justify-between" style={{ width: '800px', height: '450px' }}>
                  <div>
                    <span className="text-xs font-black text-rose-600 tracking-wider uppercase border-b-2 border-rose-600 pb-1">Video Briefing Panel</span>
                    <h1 className="text-4xl font-black text-slate-900 mt-6 leading-tight">{task.topic || task.title}</h1>
                    <p className="text-md text-slate-500 mt-4 font-semibold leading-relaxed">
                      Please refer to the specifications and caption details below for producing this video/reel content. 
                      No visual graphic design frame is attached as this is a video edit request.
                    </p>
                  </div>
                  <div className="border-t border-slate-200 pt-4 flex justify-between text-xs text-slate-400 font-bold">
                    <span>Project: {task.project}</span>
                    <span>Date: {safeFormatDate(task.date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                <div className="relative bg-white shadow-lg overflow-hidden border border-slate-300" style={{ width: '800px', height: '450px', transformOrigin: 'center' }}>
                  {canvasElements.map(el => {
                    if (!el) return null;
                    const x = typeof el.x === 'number' && !isNaN(el.x) ? el.x : 50;
                    const y = typeof el.y === 'number' && !isNaN(el.y) ? el.y : 50;
                    const style = { position: 'absolute', left: `${x}px`, top: `${y}px`, zIndex: el.zIndex || 1, pointerEvents: 'none' };
                    if (el.type === 'text') {
                      return <div key={el.id} style={{...style, color: el.color || '#000000', fontSize: el.fontSize || 16, fontWeight: el.fontWeight || 'normal', whiteSpace: 'pre-wrap'}}>{el.text}</div>;
                    }
                    if (el.type === 'rect') {
                      return <div key={el.id} style={{...style, width: el.width || 100, height: el.height || 100, backgroundColor: el.fill || '#cccccc'}}></div>;
                    }
                    if (el.type === 'circle') {
                      return <div key={el.id} style={{...style, width: el.width || 100, height: el.height || 100, backgroundColor: el.fill || '#cccccc', borderRadius: '50%'}}></div>;
                    }
                    if (el.type === 'image') {
                      return <img key={el.id} src={el.url || ''} style={{...style, width: el.width || 100, height: el.height || 100, objectFit: 'contain'}} alt=""/>;
                    }
                    return null;
                  })}
                  {canvasElements.length === 0 && task.condition && (
                     <div className="absolute bottom-4 left-4 inline-block bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-lg text-sm border border-yellow-200">{task.condition}</div>
                  )}
                </div>
              </div>
            )}

            {/* Social Caption & Submit Area */}
            <div className="bg-slate-900 border-t border-slate-800 p-6 flex flex-col shrink-0 max-h-72 overflow-y-auto">
              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><MessageCircle className="w-3 h-3"/> Social Media Caption / Notes</p>
                <div className="bg-slate-950 p-4 rounded-xl text-xs text-slate-400 font-mono whitespace-pre-wrap border border-slate-800">
                  {parsedCaption || '-'}
                </div>
              </div>

              {canSubmitWork && (
                <div className={`mt-2 ${theme.lightBg} border ${theme.border} rounded-2xl p-4 shadow-xl shrink-0 backdrop-blur`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${theme.text}`}/> Submit Final Work</h4>
                      <p className="text-xs text-slate-400 mt-1">อัปโหลดงานเสร็จแล้ว กรุณาแปะลิงก์ Google Drive หรือ Frame.io ตรงนี้ได้เลยครับ</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"/>
                      <input 
                        type="url" 
                        placeholder="Paste Google Drive link here..." 
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        className={`w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none ${theme.outline} transition-colors`}
                      />
                    </div>
                    <button 
                      onClick={handleSubmitWork}
                      disabled={isSubmitting}
                      className={`${theme.bg} ${theme.hover} text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 shrink-0`}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                      Submit Work
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. FREE-FORM CANVAS BRIEF GENERATOR (ลากไฟล์รูปภาพมาวาง และดับเบิ้ลคลิกแก้ไขข้อความได้ทันที)
// ============================================================================
function BriefSlideGenerator({ setTasks, editData, setEditData, activeUser, setActiveView, apiUrl, theme, themeColor }) {
  const [briefType, setBriefType] = useState(editData?.isVideoProduction ? 'video' : 'graphic');

  const initSizes = editData ? (editData.size || '').split(',').map(s=>s.trim()).filter(s => STANDARD_SIZES.includes(s)) : [];
  const initPlatforms = editData ? (editData.placement || '').split(',').map(p=>p.trim()).filter(p => STANDARD_PLATFORMS.includes(p)) : [];
  const initCustomSizes = editData ? (editData.size || '').split(',').map(s=>s.trim()).filter(s => !STANDARD_SIZES.includes(s) && s !== '') : [];

  let initialCaption = editData?.caption || '';
  let initialElements = [];
  try {
    const data = JSON.parse(editData?.caption);
    if(data.elements) {
      initialCaption = data.text;
      initialElements = data.elements;
    }
  } catch(e) {
    if(editData?.headline) initialElements.push({ id: 'e1', type: 'text', text: editData.headline, x: 40, y: 40, fontSize: 48, color: '#0f172a', fontWeight: 'bold' });
    if(editData?.subtext) initialElements.push({ id: 'e2', type: 'text', text: editData.subtext, x: 40, y: 120, fontSize: 24, color: '#475569', fontWeight: 'normal' });
  }

  const isRequester = activeUser.Role === 'Requester';

  const [formData, setFormData] = useState({
    id: editData?.id || null, project: editData?.project || '', topic: editData?.topic || '',
    selectedPlatforms: initPlatforms, selectedSizes: initSizes, customSizes: initCustomSizes,
    date: editData?.date || new Date().toISOString().split('T')[0], country: editData?.country || 'TH',
    caption: initialCaption, urgency: editData?.urgency || 'Normal',
    refLink: editData?.refLink || '', refImage: editData?.refImage || ''
  });

  const [tempCustomSize, setTempCustomSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CANVAS STATE ---
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);
  const dragInfo = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const toggleCheckbox = (listName, item) => setFormData(prev => {
    const isSelected = prev[listName].includes(item);
    return { ...prev, [listName]: isSelected ? prev[listName].filter(i => i !== item) : [...prev[listName], item] };
  });

  const handleAddCustomSize = (e) => {
    e.preventDefault();
    if(tempCustomSize.trim() !== '') {
      setFormData(prev => ({...prev, customSizes: [...prev.customSizes, tempCustomSize.trim()]}));
      setTempCustomSize('');
    }
  };

  const removeCustomSize = (size) => {
    setFormData(prev => ({...prev, customSizes: prev.customSizes.filter(s => s !== size)}));
  };

  // ✅ ระบบส่งข้อมูลบรีฟแบบ Optimistic UI ช่วยแก้ปัญหากดส่งบรีฟแล้วค้าง
  const handlePublish = async () => {
    if (!formData.project || !formData.topic) return alert("Please fill in Project and Topic.");
    setIsSubmitting(true);
    
    const finalSizes = [...formData.selectedSizes, ...formData.customSizes].join(', ');
    const finalPlacementString = formData.selectedPlatforms.join(', ');

    // ตรวจจับงานวิดีโออัจฉริยะ (Video Auto-Detect)
    const isVideo = briefType === 'video' || 
                    formData.selectedSizes.some(s => s.toLowerCase().includes('reel') || s.toLowerCase().includes('tiktok') || s.toLowerCase().includes('vdo')) ||
                    formData.selectedPlatforms.some(p => p.toLowerCase().includes('tiktok') || p.toLowerCase().includes('reels') || p.toLowerCase().includes('video'));

    // Pack canvas elements inside caption field
    const complexData = {
      text: formData.caption,
      elements: elements
    };

    const payload = {
      id: formData.id || 'T-2026-' + Math.floor(1000 + Math.random() * 9000),
      title: formData.topic.slice(0, 30), project: formData.project, topic: formData.topic,
      country: formData.country, date: formData.date, assetType: isVideo ? 'Video' : 'Statics',
      placement: finalPlacementString, size: finalSizeString, 
      headline: '', subtext: '', condition: '', 
      caption: JSON.stringify(complexData), 
      designer: editData?.designer || 'Unassigned',
      status: editData ? editData.status : 'Incoming Requests', urgency: formData.urgency, isVideoProduction: isVideo,
      refLink: formData.refLink, refImage: formData.refImage,
      lastUpdated: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
    };

    try {
      if (formData.id) {
        setTasks(prev => prev.map(t => t.id === formData.id ? { ...t, ...payload } : t));
        fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateTask', data: payload }) }).catch(e=>console.log("Sync on bg"));
        alert('Update successful!');
      } else {
        setTasks(prev => [payload, ...prev]);
        fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'createTask', data: payload }) }).catch(e=>console.log("Sync on bg"));
        alert('Brief generated and sent to pool!');
        setFormData({ ...formData, project: '', topic: '', caption: '', customSizes: [] });
        setElements([]);
      }
      setEditData(null);
      if(!isRequester) setActiveView('board'); 
    } catch(err) {
      alert("Error Mode Offline");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CANVAS LOGIC ---
  const addElement = (type) => {
    const newEl = { id: `el-${Date.now()}`, type, x: 50, y: 50, zIndex: elements.length + 1 };
    if(type === 'text') { newEl.text = 'Double click to edit text'; newEl.color = '#000000'; newEl.fontSize = 24; newEl.fontWeight = 'bold'; }
    else if(type === 'rect') { newEl.width = 100; newEl.height = 100; newEl.fill = '#3b82f6'; }
    else if(type === 'circle') { newEl.width = 100; newEl.height = 100; newEl.fill = '#ef4444'; }
    else if(type === 'image') {
      const url = prompt("Enter image URL (กรุณาใส่ลิงก์รูปภาพ):");
      if(!url) return;
      newEl.url = url; newEl.width = 200; newEl.height = 200;
    }
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateSelectedElement = (updates) => {
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const deleteSelectedElement = () => {
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(el => el.id === id);
    if (!el) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) - (el.x || 0);
    const offsetY = (e.clientY - rect.top) - (el.y || 0);
    dragInfo.current = { id, offsetX, offsetY };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragInfo.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left) - dragInfo.current.offsetX;
    const newY = (e.clientY - rect.top) - dragInfo.current.offsetY;
    setElements(prev => prev.map(el => el.id === dragInfo.current.id ? { ...el, x: newX, y: newY } : el));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragInfo.current = null;
  };

  // ✅ ดับเบิ้ลคลิกบนกล่องข้อความเพื่อแก้ไของค์ประกอบ
  const handleDoubleClick = (e, el) => {
    e.stopPropagation();
    if (el.type === 'text') {
      const newText = prompt('แก้ไขข้อความ (Edit Text):', el.text);
      if (newText !== null) {
        setElements(prev => prev.map(item => item.id === el.id ? { ...item, text: newText } : item));
      }
    } else if (el.type === 'image') {
      const newUrl = prompt('แก้ไขลิงก์รูปภาพ (Edit Image URL):', el.url);
      if (newUrl !== null) {
        setElements(prev => prev.map(item => item.id === el.id ? { ...item, url: newUrl } : item));
      }
    }
  };

  // ✅ ลากไฟล์ภาพจาก Desktop มาปล่อย (Drag & Drop) ลงบน Canvas ได้เลย!
  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          const newEl = { 
            id: `el-${Date.now()}`, 
            type: 'image', 
            url: base64Url, 
            x: 150, 
            y: 100, 
            width: 250, 
            height: 250, 
            zIndex: elements.length + 1 
          };
          setElements([...elements, newEl]);
          setSelectedId(newEl.id);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOverFile = (e) => {
    e.preventDefault();
  };

  const bringForward = () => updateSelectedElement({ zIndex: (elements.find(e=>e.id===selectedId)?.zIndex || 0) + 1 });
  const sendBackward = () => updateSelectedElement({ zIndex: Math.max(1, (elements.find(e=>e.id===selectedId)?.zIndex || 0) - 1) });

  const selectedEl = elements.find(e => e.id === selectedId);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-900 relative">
      <div className={`h-full overflow-y-auto p-6 flex flex-col items-center bg-slate-900/60 transition-all w-2/3`}>
        
        {editData && (
          <div className="w-full max-w-[800px] bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-4 flex items-center justify-between text-amber-400 text-sm font-bold shadow-lg">
            <div className="flex items-center gap-2"><Edit2 className="w-4 h-4"/> Editing Mode</div>
            <div className="flex gap-4 items-center">
              {editData.lastUpdated && <span className="text-xs flex items-center gap-1"><History className="w-3.5 h-3.5"/> Last Edited: {editData.lastUpdated}</span>}
              <button onClick={() => { setEditData(null); setActiveView('board'); }} className="text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Cancel Edit</button>
            </div>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="w-full max-w-[800px] flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
             <button onClick={() => setBriefType('graphic')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${briefType === 'graphic' ? `${theme.bg} text-white shadow` : 'text-slate-400 hover:text-white'}`}>Graphic Brief</button>
             <button onClick={() => setBriefType('video')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${briefType === 'video' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Video Brief</button>
          </div>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2 text-white">
             {isFullscreen ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
             {isFullscreen ? 'Exit Presentation' : 'Present Slide'}
          </button>
        </div>

        {/* Conditionally Render: Video Specification Sheet vs Graphic Canvas Editor */}
        {briefType === 'video' ? (
          <div className="w-full max-w-[800px] aspect-[16/9] bg-white shadow-2xl border-2 border-slate-400 rounded-2xl overflow-hidden flex flex-col text-slate-900 p-8 justify-between">
            <div className="border-b-2 border-slate-100 pb-4">
              <span className="text-xs font-black text-rose-600 tracking-wider uppercase border-b-2 border-rose-600 pb-1">Video / Reels Specifications</span>
              <h1 className="text-3xl font-black text-slate-900 mt-6 leading-tight">{formData.topic || '[Topic Name Here]'}</h1>
              
              <div className="grid grid-cols-2 gap-6 mt-6 text-sm text-slate-600">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Target Date</p>
                  <p className="font-black text-slate-800">{safeFormatDate(formData.date)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Platforms</p>
                  <p className="font-black text-slate-800">{formData.selectedPlatforms.join(', ') || 'None selected'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Required Video Sizes</p>
              <div className="flex flex-wrap gap-2">
                {formData.selectedSizes.map(s => <span key={s} className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black px-3 py-1.5 rounded-lg">{s}</span>)}
                {formData.customSizes.map(s => <span key={s} className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black px-3 py-1.5 rounded-lg">{s}</span>)}
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 font-bold flex justify-between">
              <span>Project: {formData.project || '[Project]'}</span>
              <span>OWNDAYS Production Hub</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[800px] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-700">
            {/* Toolbar */}
            <div className="bg-slate-950 p-3 flex flex-wrap items-center justify-between border-b border-slate-800">
              <div className="flex gap-2">
                <button onClick={()=>addElement('text')} className="p-2 bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2 text-xs font-bold transition-colors"><Type className="w-4 h-4"/> Text</button>
                <button onClick={()=>addElement('image')} className="p-2 bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2 text-xs font-bold transition-colors"><ImageIcon className="w-4 h-4"/> Image</button>
                <button onClick={()=>addElement('rect')} className="p-2 bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2 text-xs font-bold transition-colors"><Square className="w-4 h-4"/> Square</button>
                <button onClick={()=>addElement('circle')} className="p-2 bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2 text-xs font-bold transition-colors"><Circle className="w-4 h-4"/> Circle</button>
              </div>
              
              {selectedId && (
                <div className="flex gap-2 items-center bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                  <button onClick={bringForward} title="Bring Forward" className="p-1 text-slate-400 hover:text-white"><BringToFront className="w-4 h-4"/></button>
                  <button onClick={sendBackward} title="Send Backward" className="p-1 text-slate-400 hover:text-white"><SendToBack className="w-4 h-4"/></button>
                  <div className="w-px h-4 bg-slate-700 mx-1"></div>
                  <button onClick={deleteSelectedElement} title="Delete" className="p-1 text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
                </div>
              )}
            </div>

            {/* Settings Panel for Selected Element */}
            {selectedEl && (
              <div className="bg-slate-900 p-3 flex gap-4 items-center border-b border-slate-800">
                {selectedEl.type === 'text' && (
                  <>
                    <input type="text" value={selectedEl.text} onChange={e => updateSelectedElement({text: e.target.value})} className="bg-slate-950 border border-slate-700 text-white text-xs px-3 py-1.5 rounded flex-1 outline-none"/>
                    <input type="color" value={selectedEl.color} onChange={e => updateSelectedElement({color: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-slate-950 border-0 p-0"/>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-400">Size:</label>
                      <input type="number" value={selectedEl.fontSize} onChange={e => updateSelectedElement({fontSize: parseInt(e.target.value) || 12})} className="w-16 bg-slate-950 border border-slate-700 text-white text-xs px-2 py-1.5 rounded outline-none"/>
                    </div>
                  </>
                )}
                {selectedEl.type === 'image' && (
                  <>
                    <input type="url" value={selectedEl.url} onChange={e => updateSelectedElement({url: e.target.value})} className="bg-slate-950 border border-slate-700 text-white text-xs px-3 py-1.5 rounded flex-1 outline-none" placeholder="Image URL"/>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      W: <input type="number" value={selectedEl.width} onChange={e => updateSelectedElement({width: parseInt(e.target.value) || 50})} className="w-16 bg-slate-950 border border-slate-700 text-white px-2 py-1.5 rounded outline-none"/>
                    </div>
                  </>
                )}
                {(selectedEl.type === 'rect' || selectedEl.type === 'circle') && (
                  <>
                    <input type="color" value={selectedEl.fill} onChange={e => updateSelectedElement({fill: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-slate-950 border-0 p-0"/>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      W: <input type="number" value={selectedEl.width} onChange={e => updateSelectedElement({width: parseInt(e.target.value) || 50})} className="w-16 bg-slate-950 border border-slate-700 text-white px-2 py-1.5 rounded outline-none"/>
                      H: <input type="number" value={selectedEl.height} onChange={e => updateSelectedElement({height: parseInt(e.target.value) || 50})} className="w-16 bg-slate-950 border border-slate-700 text-white px-2 py-1.5 rounded outline-none"/>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Interactive Canvas Area */}
            <div 
              ref={canvasRef}
              className="w-full h-[450px] bg-slate-100 relative overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDragOver={handleDragOverFile}
              onDrop={handleFileDrop}
              onClick={() => setSelectedId(null)}
            >
              {!elements.length && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-50 pointer-events-none">
                  <ImageIcon className="w-16 h-16 mb-2"/>
                  <p className="font-bold">เพิ่มกรอบ ข้อความ หรือลากไฟล์ภาพมาปล่อยเพื่อออกแบบบรีฟได้อิสระ</p>
                  <p className="text-xs mt-1">💡 Tips: ดับเบิ้ลคลิก (Double click) ที่ข้อความเพื่อแก้ไข</p>
                </div>
              )}
              
              {elements.map(el => {
                const x = typeof el.x === 'number' && !isNaN(el.x) ? el.x : 50;
                const y = typeof el.y === 'number' && !isNaN(el.y) ? el.y : 50;
                const style = {
                  position: 'absolute', left: `${x}px`, top: `${y}px`, zIndex: el.zIndex || 1,
                  cursor: 'grab', userSelect: 'none', border: selectedId === el.id ? `2px solid ${THEMES[themeColor]?.bg?.split('-')[1] || 'blue'}` : '2px solid transparent'
                };
                if(isDragging && selectedId === el.id) style.cursor = 'grabbing';

                return (
                  <div key={el.id} style={style} onMouseDown={(e) => handleMouseDown(e, el.id)} onDoubleClick={(e) => handleDoubleClick(e, el)} title={el.type === 'text' || el.type === 'image' ? 'Double click to edit' : ''}>
                    {el.type === 'text' && <div style={{color: el.color, fontSize: el.fontSize, fontWeight: el.fontWeight}} className="whitespace-pre-wrap pointer-events-none">{el.text}</div>}
                    {el.type === 'rect' && <div style={{width: el.width, height: el.height, backgroundColor: el.fill}} className="pointer-events-none"></div>}
                    {el.type === 'circle' && <div style={{width: el.width, height: el.height, backgroundColor: el.fill, borderRadius: '50%'}} className="pointer-events-none"></div>}
                    {el.type === 'image' && <img src={el.url} style={{width: el.width, height: el.height, objectFit: 'contain'}} alt="Canvas Element" draggable={false} className="pointer-events-none"/>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Caption */}
        <div className="w-full max-w-[800px] mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-400 mb-2">Social Copy / Caption</h4>
            <textarea name="caption" value={formData.caption} onChange={handleInputChange} rows={3} className={`w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white ${theme.outline} outline-none`} placeholder="Type social media caption or video edit requirements here..."/>
        </div>
      </div>

      <div className="w-1/3 h-full bg-slate-950 border-l border-slate-800 overflow-y-auto p-6 scrollbar-thin">
        <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
          <Settings className={`w-5 h-5 ${theme.text}`}/> {editData ? 'Edit Details' : 'New Brief Settings'}
        </h3>

        <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl mb-6 text-xs text-amber-400 font-medium leading-relaxed">
           <strong className="block text-amber-500 font-black mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3"/> Artwork Request Policy</strong>
           Please allow 1 week in advance. Urgent requests will be locked and require Manager approval.
        </div>
        
        <div className="space-y-6">
           <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
              <p className={`text-[10px] font-black ${theme.text} uppercase tracking-widest border-b border-slate-800 pb-2`}>1. Basic Info</p>
              <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Project</label><input name="project" value={formData.project} onChange={handleInputChange} className={`w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white ${theme.outline} outline-none`}/></div>
              <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Topic</label><input name="topic" value={formData.topic} onChange={handleInputChange} className={`w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white ${theme.outline} outline-none`}/></div>
              <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Target Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white ${theme.outline} outline-none`}/></div>
           </div>

           <div className="space-y-5 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-800 pb-2">2. Platforms & Sizes</p>
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-3">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_PLATFORMS.map(p => (
                    <button key={p} onClick={() => toggleCheckbox('selectedPlatforms', p)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${formData.selectedPlatforms.includes(p) ? `${theme.bg} ${theme.border} text-white` : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-3">Standard Sizes</label>
                <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {STANDARD_SIZES.map(s => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={formData.selectedSizes.includes(s)} onChange={() => toggleCheckbox('selectedSizes', s)} className={`w-4 h-4 rounded border-slate-600 bg-slate-900 ${theme.text}`}/>
                      <span className={`text-xs ${formData.selectedSizes.includes(s) ? `${theme.text} font-black` : 'text-slate-400 group-hover:text-slate-300'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-2">Other Sizes</label>
                <div className="flex gap-2 mb-2">
                  <input value={tempCustomSize} onChange={(e) => setTempCustomSize(e.target.value)} placeholder="e.g. IG 4:5" className={`flex-1 bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white ${theme.outline} outline-none`}/>
                  <button onClick={handleAddCustomSize} className={`${theme.bg} text-white px-4 rounded-xl font-bold text-xs`}>OK</button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {formData.customSizes.map(s => (
                     <span key={s} className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded flex items-center gap-1">{s} <button onClick={() => removeCustomSize(s)} className="text-rose-400"><XCircle className="w-3 h-3"/></button></span>
                   ))}
                </div>
              </div>
           </div>

           {/* Reference Link Input Area (Show only reference link input, hide reference image URL input in video mode) */}
           <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2">3. Reference Links</p>
              <div><label className="text-xs text-slate-400 font-bold block mb-1.5"><LinkIcon className="w-3 h-3 inline mr-1"/>Reference Link</label><input type="url" name="refLink" value={formData.refLink} onChange={handleInputChange} placeholder="https://..." className={`w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white ${theme.outline} outline-none`}/></div>
              {briefType !== 'video' && (
                <div><label className="text-xs text-slate-400 font-bold block mb-1.5"><ImageIcon className="w-3 h-3 inline mr-1"/>Reference Image URL</label><input type="url" name="refImage" value={formData.refImage} onChange={handleInputChange} placeholder="https://image-url.jpg" className={`w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white ${theme.outline} outline-none`}/></div>
              )}
           </div>
           
           <div className="grid grid-cols-1 gap-4 pt-2">
             <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Urgency</label>
               <select name="urgency" value={formData.urgency} onChange={handleInputChange} className={`w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white font-bold outline-none ${theme.outline}`}>
                  <option value="Normal">Normal</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option>
               </select>
             </div>
           </div>
           
           <button onClick={handlePublish} disabled={isSubmitting} className={`w-full mt-6 py-4 ${theme.bg} ${theme.hover} text-white font-black text-sm rounded-xl flex justify-center items-center shadow-lg transition-all gap-2`}>
             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : (editData ? <><CheckCircle2 className="w-5 h-5"/> Update Brief Details</> : <><Send className="w-5 h-5"/> Generate & Add to Pool</>)}
           </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. KANBAN BOARD (แยกออกเป็น 2 แท็บเพื่อขยายขนาดการ์ดไม่ให้โดนบีบอัด)
// ============================================================================
function BoardView({ tasks, setTasks, activeUser, apiUrl, onViewBrief, onEditBrief, theme, themeColor }) {
  const [activeBoardTab, setActiveBoardTab] = useState('requests'); // 'requests' หรือ 'production'

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Published')
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 4);
  }, [tasks]);

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
    if ((urgency === 'Urgent' || urgency === 'Emergency') && activeUser.Role === 'Creative' && activeUser.Role !== 'SuperAdmin') {
      return alert('Urgent/Emergency tasks require Manager or SuperAdmin approval.');
    }
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, status: 'Open Pool' } : t));
    fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', taskId: taskId, newStatus: 'Open Pool', userId: activeUser.Name }) }).catch(e=>{});
  };

  // กรอง Stages ที่ต้องการเรนเดอร์ตามแท็บที่เลือก
  const activeStages = activeBoardTab === 'requests' 
    ? ['Incoming Requests', 'Open Pool'] 
    : ['In Progress', 'Reviewing', 'Published'];

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in duration-200 overflow-y-auto">
      
      {/* 🔴 Section: Upcoming Deadlines */}
      {upcomingTasks.length > 0 && (
        <div className="mb-8 shrink-0 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Clock className={`w-4 h-4 ${theme.text}`}/> Upcoming Deadlines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingTasks.map(t => (
              <div key={`upc-${t.id}`} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:border-slate-600 transition-colors" onClick={() => onViewBrief(t)}>
                <div className="overflow-hidden">
                  <p className={`text-[10px] font-black ${theme.text} uppercase truncate`}>{t.project}</p>
                  <p className="text-sm font-bold text-white truncate">{t.topic}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Due</span>
                  <span className="text-xl font-black text-rose-400">{safeFormatDate(t.date, { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔵 Section: Tabs Controller (Asana & Notion Style) */}
      <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-800 pb-4">
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveBoardTab('requests')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeBoardTab === 'requests' ? `${theme.bg} text-white shadow-md` : 'text-slate-400 hover:text-white'}`}
          >
            <Inbox className="w-4 h-4"/> Request Pool
          </button>
          <button 
            onClick={() => setActiveBoardTab('production')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeBoardTab === 'production' ? `${theme.bg} text-white shadow-md` : 'text-slate-400 hover:text-white'}`}
          >
            <Layers className="w-4 h-4"/> Active Production
          </button>
        </div>
        
        <div className="text-xs bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span>Actioning as: <strong className="text-emerald-400">{activeUser.Name} ({activeUser.Role})</strong></span>
        </div>
      </div>

      {/* Grid Layout (การ์ดจะขยายเต็มหน้าจอ และไม่เบียดซ้อนกัน) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start pb-10">
        {activeStages.map((stage, sIdx) => {
          const stageTasks = tasks.filter(t => t.status === stage);
          return (
            <div key={stage} className={`bg-slate-950/40 border rounded-3xl flex flex-col ${stage === 'Incoming Requests' ? 'border-amber-900/50' : stage === 'Open Pool' ? 'border-blue-900/50' : 'border-slate-800'}`}>
              
              <div className={`p-4 border-b flex justify-between items-center rounded-t-3xl ${stage === 'Incoming Requests' ? 'bg-amber-950/40 border-amber-900/50' : stage === 'Open Pool' ? 'bg-blue-950/40 border-blue-900/50' : 'bg-slate-950/80 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  {stage === 'Incoming Requests' && <Inbox className="w-4 h-4 text-amber-500"/>}
                  {stage === 'Open Pool' && <FolderOpen className="w-4 h-4 text-blue-500"/>}
                  <h4 className={`text-[12px] font-black uppercase tracking-wider ${stage === 'Incoming Requests' ? 'text-amber-500' : stage === 'Open Pool' ? 'text-blue-400' : 'text-slate-300'}`}>{stage}</h4>
                </div>
                <span className="bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-0.5 rounded-full text-slate-400 font-black">{stageTasks.length}</span>
              </div>

              <div className="p-4 flex-col space-y-3">
                {stageTasks.map(task => (
                  <div key={task.id} className={`bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:shadow-lg transition-all group relative cursor-pointer`} onClick={() => onViewBrief(task)}>
                    <div className="flex justify-between items-start mb-2">
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
                    
                    <p className={`text-[10px] font-black ${theme.text} uppercase tracking-widest mb-1`}>{task.project}</p>
                    <h5 className="text-base font-bold text-white mb-2 leading-snug">{task.topic}</h5>
                    
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 my-3 text-center">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Target Date</p>
                       <p className="text-2xl font-black text-rose-400">{safeFormatDate(task.date, { day: '2-digit', month: 'short' })}</p>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-bold text-[8px] text-white">
                          {(task.designer || 'U').charAt(0)}
                        </div> 
                        {task.designer || 'Unassigned'}
                      </span>
                    </div>
                    
                    {task.lastUpdated && (
                      <div className="text-[9px] text-amber-500/80 font-bold mb-3 flex items-center gap-1.5 bg-amber-500/10 w-fit px-2 py-1 rounded">
                         <AlertTriangle className="w-3 h-3"/> Edited: {task.lastUpdated}
                      </div>
                    )}
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      {stage === 'Incoming Requests' && (
                         <div className="mt-2">
                           {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') ? (
                             <button onClick={() => approveToPool(task.id, task.urgency)} className={`w-full py-2.5 text-xs font-black rounded-xl border transition-colors flex items-center justify-center gap-2 ${task.urgency === 'Urgent' && activeUser.Role === 'Creative' && activeUser.Role !== 'SuperAdmin' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-amber-500/20 text-amber-500 border-amber-900/50 hover:bg-amber-500 hover:text-white'}`}>
                               <CheckSquare className="w-4 h-4"/> Approve to Pool
                             </button>
                           ) : (<p className="text-center text-[10px] text-slate-500 font-bold mt-2">Waiting for Creative</p>)}
                         </div>
                      )}

                      {stage === 'Open Pool' && (
                         <div className="mt-2">
                           {(activeUser.Role === 'Graphic' || activeUser.Role === 'Editor' || activeUser.Role === 'SuperAdmin') && (task.designer === 'Unassigned' || !task.designer) && (
                             <button onClick={() => claimTask(task.id)} className={`w-full py-2.5 ${theme.lightBg} ${theme.text} text-xs font-black rounded-xl border ${theme.border} ${theme.hover} hover:text-white transition-colors`}>
                               Pick up Task
                             </button>
                           )}
                         </div>
                      )}

                      {sIdx >= 0 && activeBoardTab === 'production' && (task.designer === activeUser.Name || activeUser.Role === 'SuperAdmin') && (
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
// DASHBOARD & TIMELINE 
// ----------------------------------------------------------------------
function YearlyDashboardView({ tasks, theme }) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-black text-white mb-6"><BarChart3 className={`w-6 h-6 inline mr-2 ${theme.text}`}/> Yearly Content Dashboard</h2>
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
              <p className={`text-2xl font-black ${theme.text}`}>{tasks.filter(t => t.status === 'In Progress' || t.status === 'Editing').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoTimelineView({ tasks, theme }) {
  const videoTasks = tasks.filter(t => t.isVideoProduction);
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-black text-white mb-6">Video Production Pipeline</h2>
      <div className="space-y-4">
        {videoTasks.map(task => (
          <div key={task.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div><h4 className="font-bold text-white text-sm">{task.title}</h4><p className="text-xs text-slate-500">Editor: {task.designer}</p></div>
            <div className="text-right"><span className="text-[10px] uppercase font-black text-slate-500 block">Shoot Date</span><span className={`text-sm font-bold ${theme.text}`}>{task.shootingDate || 'TBA'}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. TABLE VIEW (Master Data Register กับการบอกสถานะและกำหนดเวลาด่วน)
// ----------------------------------------------------------------------
function TableView({ tasks, onEditTask, theme }) {
  const [filterMonth, setFilterMonth] = useState('ALL');
  
  const displayTasks = useMemo(() => {
    let list = [...tasks];
    if (filterMonth !== 'ALL') {
      list = list.filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getMonth().toString() === filterMonth;
      });
    }
    return list.sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [tasks, filterMonth]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // คำนวณวันคงเหลือเป้าหมาย (Deadline Countdown) เพื่ออำนวยความสะดวกในการจัดลำดับงาน
  const getDaysLeftText = (targetDateStr) => {
    if (!targetDateStr) return "No Target Date";
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-rose-500 font-bold' };
    if (diffDays === 0) return { text: "Due Today", color: 'text-amber-500 font-bold animate-pulse' };
    if (diffDays <= 3) return { text: `${diffDays} days left (Urgent)`, color: 'text-orange-400 font-bold' };
    return { text: `${diffDays} days left`, color: 'text-slate-400' };
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full bg-slate-900">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white">Monthly Content Master Data</h2>
          <p className="text-xs text-slate-500 mt-1">สรุปสถานะการเคลมงาน และความเร่งด่วนของเดดไลน์คอนเทนต์รายเดือน</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-bold">Filter Month:</span>
          <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} className={`bg-slate-950 border border-slate-700 text-white text-sm p-2 rounded-lg outline-none ${theme.outline}`}>
             <option value="ALL">All Months</option>
             {months.map((m, i) => <option key={m} value={i.toString()}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-y-auto scrollbar-thin">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-900 text-[10px] uppercase text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Target Date</th>
                <th className="p-4">Days Left</th>
                <th className="p-4">Project</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Assignee</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-800/50">
              {displayTasks.map(t => {
                const countdown = getDaysLeftText(t.date);
                return (
                  <tr key={t.id} className="hover:bg-slate-900/50">
                    <td className="p-4"><button onClick={() => onEditTask(t)} className={`text-slate-500 ${theme.hover.replace('bg','text')} p-1 bg-slate-900 rounded border border-slate-800`}><Edit2 className="w-3.5 h-3.5"/></button></td>
                    <td className={`p-4 font-bold ${theme.text}`}>{safeFormatDate(t.date)}</td>
                    <td className={`p-4 ${countdown.color}`}>{countdown.text}</td>
                    <td className="p-4 font-bold text-white">{t.project}</td>
                    <td className="p-4 text-slate-300">{t.topic}</td>
                    <td className="p-4 text-slate-400">
                      {t.designer && t.designer !== 'Unassigned' ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-white">{(t.designer || '').charAt(0)}</span>
                          {t.designer}
                        </span>
                      ) : (
                        <span className="text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30 font-semibold text-[10px]">Unclaimed</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black ${t.status === 'Published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : t.status === 'In Progress' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-slate-800 text-slate-300'}`}>{t.status}</span>
                    </td>
                  </tr>
                );
              })}
              {displayTasks.length === 0 && (
                <tr><td colSpan="7" className="text-center p-8 text-slate-500">No content found for this selection.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. TEAM & ADMIN VIEW
// ----------------------------------------------------------------------
function TeamAdminView({ teamMembers, setTeamMembers, activeUser, permissions, setPermissions, apiUrl, theme }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Graphic');
  const [isProcessing, setIsProcessing] = useState(false);

  // Add Role State
  const [newRoleInput, setNewRoleInput] = useState('');

  const isSuperAdmin = activeUser.Role === 'SuperAdmin';
  const isManager = activeUser.Role === 'Manager';
  const canInvite = isSuperAdmin || isManager;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!canInvite) return;
    setIsProcessing(true);

    const newMember = { UserID: 'u_' + Date.now(), Name: name, Email: email, Role: role, CountryAccess: 'TH', LINE_ID: '', Status: 'Active', TasksCompleted: 0 };
    
    try {
      setTeamMembers([...teamMembers, newMember]); 
      const currentUrl = window.location.origin; 
      await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'createUser', data: newMember, appUrl: currentUrl }) });
      alert(`Invite ${email} sent successfully!`);
      setShowAddModal(false);
      setName(''); setEmail('');
    } catch(err) {
      alert("Error saving user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMember = async (userId, userEmail) => {
    if(userEmail === 'airada.s@owndays.com') return alert('Cannot remove main SuperAdmin');
    if(!window.confirm(`Delete user ${userEmail}?`)) return;
    try {
      setTeamMembers(prev => prev.filter(m => m.UserID !== userId));
    } catch(err) {
      console.log(err);
    }
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if(!newRoleInput.trim()) return;
    const formattedRole = newRoleInput.trim();
    if(!permissions[formattedRole]) {
      setPermissions(prev => ({...prev, [formattedRole]: []}));
      setNewRoleInput('');
    }
  };

  const handleDeleteRole = (roleToDelete) => {
    if(['SuperAdmin', 'Manager', 'Creative', 'Graphic', 'Editor', 'Requester'].includes(roleToDelete)) {
      return alert("System default roles cannot be deleted.");
    }
    if(!window.confirm(`Delete role ${roleToDelete}?`)) return;
    const newPerms = {...permissions};
    delete newPerms[roleToDelete];
    setPermissions(newPerms);
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
    <div className="p-6 lg:p-8 space-y-8 relative animate-in fade-in h-full overflow-y-auto bg-slate-900">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white">Team & Permissions</h2>
          <p className="text-xs text-slate-500 mt-1">Invite users, manage roles, and control access permissions.</p>
        </div>
        {canInvite && (
          <button onClick={() => setShowAddModal(true)} className={`${theme.bg} ${theme.hover} text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all`}>
            <UserPlus className="w-4 h-4"/> Invite New User
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.UserID} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between group">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-black text-slate-400">{member.Name?.charAt(0) || '?'}</div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    {member.Name} 
                    {(member.Role === 'SuperAdmin' || member.Role === 'Manager') && <Award className="w-3.5 h-3.5 text-yellow-500"/>}
                  </h3>
                  <p className="text-[10px] text-slate-500">{member.Email}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${theme.text} ${theme.lightBg} px-2 py-0.5 rounded border ${theme.border} mt-1.5 inline-block`}>{member.Role}</span>
                </div>
             </div>
             
             {isSuperAdmin && member.Email !== 'airada.s@owndays.com' && (
               <button onClick={() => handleDeleteMember(member.UserID, member.Email)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete User">
                 <Trash2 className="w-4 h-4"/>
               </button>
             )}
          </div>
        ))}
      </div>

      {isSuperAdmin && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-black text-white flex items-center gap-2"><Settings className="w-5 h-5 text-amber-500"/> Role Access Control</h3>
            <form onSubmit={handleAddRole} className="flex gap-2">
               <input value={newRoleInput} onChange={e=>setNewRoleInput(e.target.value)} placeholder="New Role Name" className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-white outline-none focus:border-blue-500"/>
               <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Add Role</button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-bold">Role Name</th>
                  {ALL_VIEWS.map(v => <th key={v.id} className="p-4 text-center font-bold">{v.name}</th>)}
                  <th className="p-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Object.keys(permissions).map(roleName => {
                  if(roleName === 'SuperAdmin') return null; 
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
                              className={`w-4 h-4 rounded border-slate-700 bg-slate-950 ${theme.text} cursor-pointer`}
                            />
                          </label>
                        </td>
                      ))}
                      <td className="p-4 text-right">
                         {!['Manager', 'Creative', 'Graphic', 'Editor', 'Requester'].includes(roleName) && (
                           <button onClick={() => handleDeleteRole(roleName)} className="text-slate-600 hover:text-rose-500"><Trash2 className="w-4 h-4 inline"/></button>
                         )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && canInvite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative zoom-in-95">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XCircle className="w-5 h-5"/></button>
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Mail className={`w-5 h-5 ${theme.text}`}/> Invite User</h3>
            <p className="text-xs text-slate-500 mb-6">Invite new member to the workspace</p>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-400 block mb-1">Name</label><input required placeholder="Member Name" className={`w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none ${theme.outline}`} value={name} onChange={e=>setName(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label><input required type="email" placeholder="example@owndays.com" className={`w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none ${theme.outline}`} value={email} onChange={e=>setEmail(e.target.value)} /></div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Role</label>
                <select className={`w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold outline-none ${theme.outline}`} value={role} onChange={e=>setRole(e.target.value)}>
                  {Object.keys(permissions).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isProcessing} className={`w-full mt-4 py-3.5 ${theme.bg} ${theme.hover} text-white font-black rounded-xl text-sm transition-all shadow-lg flex justify-center items-center gap-2`}>
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
// DYNAMIC CALENDAR PLAN VIEW
// ----------------------------------------------------------------------
function CalendarPlanView({ tasks, setTasks, apiUrl, theme }) {
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-07-01'));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const tasksInMonth = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task || !task.date) return false;
      const taskDate = new Date(task.date);
      return !isNaN(taskDate.getTime()) && taskDate.getMonth() === currentMonth.getMonth() && taskDate.getFullYear() === currentMonth.getFullYear();
    });
  }, [tasks, currentMonth]);

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

    // คำนวณวันที่ใหม่แบบเสถียร
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0); 
    const newDateString = newDate.toISOString().split('T')[0]; 

    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, date: newDateString } : t));

    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if(taskToUpdate) {
        await fetch(apiUrl, { 
          method: 'POST', 
          body: JSON.stringify({ action: 'updateTask', data: { ...taskToUpdate, date: newDateString } }) 
        });
      }
    } catch(e) {
      console.log('Calendar Update Background Process Active');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarDays className="text-blue-500 w-6 h-6"/> Content Calendar Plan
          </h2>
          <p className="text-xs text-slate-500 mt-1">สามารถคลิกค้างที่การ์ดงานแล้วลาก (Drag & Drop) เพื่อเลื่อนวันที่ได้เลย ข้อมูลจะอัปเดตอัตโนมัติ</p>
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
            const dayTasks = tasksInMonth.filter(task => {
              if(!task || !task.date) return false;
              const d = new Date(task.date);
              return !isNaN(d.getTime()) && d.getDate() === day;
            });
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
// MEDIA LIBRARY VIEW
// ----------------------------------------------------------------------
function MediaLibraryView({ tasks, theme }) {
  const publishedTasks = tasks.filter(t => t.status === 'Published');
  const [filterType, setFilterType] = useState('ALL');

  const displayTasks = publishedTasks.filter(t => filterType === 'ALL' || (t.assetType && t.assetType.includes(filterType)));

  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-200 bg-slate-900">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FolderOpen className="text-blue-500 w-6 h-6"/> Media Library & Final Assets
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Search and download final artwork/video files.
          </p>
        </div>
        
        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
          {['ALL', 'Statics', 'Video'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? `${theme.bg} text-white` : 'text-slate-400 hover:text-white'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {displayTasks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <ImageIcon className="w-12 h-12 mb-4 opacity-50"/>
          <p className="font-bold">No matching files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayTasks.map(task => (
            <div key={task.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-600 transition-all flex flex-col">
              <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                <img src={task.refImage || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80`} alt={task.topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  {task.assetUrl && (
                    <a href={task.assetUrl} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full ${theme.bg} text-white flex items-center justify-center hover:scale-110 transition-transform`} title="Open Assets">
                      <ExternalLink className="w-5 h-5"/>
                    </a>
                  )}
                </div>

                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="bg-slate-950/80 backdrop-blur text-[9px] font-black text-white px-2 py-1 rounded border border-slate-700/50 uppercase">
                    {task.assetType || 'Statics'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className={`text-[10px] font-black ${theme.text} uppercase tracking-widest mb-1`}>{task.project || 'Project'}</p>
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug" title={task.topic}>{task.topic || 'Topic'}</h3>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                      {(task.designer || '?').charAt(0)}
                    </div>
                    <span>{task.designer || 'Unassigned'}</span>
                  </div>
                  <span>{safeFormatDate(task.date, { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}