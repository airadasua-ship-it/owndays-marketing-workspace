import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, KanbanSquare, ListTodo, FileEdit, Users, Search, 
  CheckCircle2, Clock, AlertCircle, FileText, Image as ImageIcon,
  Zap, XCircle, Loader2, Trash2, UserPlus, Mail, Calendar as CalendarIcon, 
  Award, Download, Copy, Maximize2, Minimize2, Send, 
  MessageCircle, Video, Film, Play, Eye, ArrowRight,
  FolderOpen, CalendarDays, BarChart3, DownloadCloud, ExternalLink, Image, Grid,
  ChevronLeft, ChevronRight, Trophy, Star, PieChart, Briefcase, Layers, Edit2, History,
  Inbox, CheckSquare, Sliders
} from 'lucide-react';

// URL ของ Web App ที่เชื่อมกับ Google Sheets ของคุณ
const API_URL = 'https://script.google.com/macros/s/AKfycby6j9tUrUE948IhRFbYBcGyJT2h7AzOPp9ZjyfQdKxK1Fw0ypoNH0jBUAx4b42D4luR/exec';

// ปรับ Stage ใหม่ให้รองรับระบบ Pool แบบ Asana
const STAGES = ['Incoming Requests', 'Open Pool', 'In Progress', 'Reviewing', 'Published'];
const COUNTRIES = ['ALL', 'TH', 'MY', 'KH', 'ADS'];
const STANDARD_SIZES = ['FB Single (1080x1080)', 'FB Album (1080x1350)', 'IG Story (1080x1920)', 'Reels / TikTok (1080x1920)', 'Ads (1200x628)'];
const STANDARD_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'LINE', 'Ads', 'Website'];

// เพิ่ม Role Creative และ Requester (คนนอก)
const initialTeamMembers = [
  { UserID: 'u_001', Name: 'Airada S.', Email: 'airada.s@owndays.com', Role: 'SuperAdmin', CountryAccess: 'ALL', LINE_ID: 'airada_admin', Status: 'Active', TasksCompleted: 120 },
  { UserID: 'u_01', Name: 'Yok', Email: 'yok.d@owndays.com', Role: 'Graphic', CountryAccess: 'TH', LINE_ID: 'yok_design', Status: 'Active', TasksCompleted: 90 },
  { UserID: 'u_02', Name: 'Minnie', Email: 'minnie.p@owndays.com', Role: 'Graphic', CountryAccess: 'TH', LINE_ID: 'minnie_p', Status: 'Active', TasksCompleted: 84 },
  { UserID: 'u_03', Name: 'Mick', Email: 'mick.e@owndays.com', Role: 'Editor', CountryAccess: 'TH', LINE_ID: 'mick_edit', Status: 'Active', TasksCompleted: 32 },
  { UserID: 'u_04', Name: 'Creative Team', Email: 'creative@owndays.com', Role: 'Creative', CountryAccess: 'TH', LINE_ID: 'creative_1', Status: 'Active', TasksCompleted: 150 },
  { UserID: 'u_05', Name: 'Manager', Email: 'manager@owndays.com', Role: 'Manager', CountryAccess: 'TH', LINE_ID: 'manager_1', Status: 'Active', TasksCompleted: 5 },
  { UserID: 'u_06', Name: 'External Staff', Email: 'staff@external.com', Role: 'Requester', CountryAccess: 'TH', LINE_ID: 'req_1', Status: 'Active', TasksCompleted: 0 }
];

// แปลง Status เดิมให้เข้ากับ Pool ใหม่
const initialMockTasks = [
  { id: 'T-2026-005', title: 'Hello Kitty Preorder official', project: 'Hello Kitty', topic: 'Preorder official', country: 'TH', date: '2026-01-26', pillar: 'Product', assetType: 'Statics', placement: 'FB, IG', size: 'FB Single (1080x1080)', designer: 'Minnie', status: 'Published', urgency: 'Normal', assetUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80', fileLink: '#' },
  { id: 'T-2026-006', title: 'Valentine Mario this or that', project: "Valentine's Day", topic: 'Mario this or that', country: 'TH', date: '2026-02-14', pillar: 'Lifestyle', assetType: 'Reels', placement: 'FB, IG, TT', size: 'Reels / TikTok (1080x1920)', designer: 'Mick', status: 'Published', urgency: 'High', isVideoProduction: true, assetUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=400&q=80', fileLink: '#' },
  
  { id: 'T-2026-001', title: 'Hello Kitty Exclusive Launch', project: 'Hello Kitty', topic: 'Official Launch', country: 'TH', date: '2026-07-10', pillar: 'Product', assetType: 'Statics', placement: 'Facebook, Instagram', size: 'FB Single (1080x1080), IG Story (1080x1920)', headline: 'Hello Kitty Exclusive', subtext: 'Get special gift box set', condition: 'T&C Apply', caption: 'Preorder now!', designer: 'Unassigned', status: 'Incoming Requests', urgency: 'Urgent', quality: 98, lastUpdated: '2026-07-02 10:30 AM' },
  { id: 'T-2026-002', title: 'Star Wars Prelaunch KV', project: 'Star Wars', topic: 'Final call', country: 'TH', date: '2026-07-05', pillar: 'Product', assetType: 'Statics', placement: 'Facebook', size: 'FB Single (1080x1080)', headline: 'MAY THE FORCE BE WITH YOUR EYES', subtext: 'Final day', condition: 'Limited stock.', caption: 'May the force be with you!', designer: 'Unassigned', status: 'Open Pool', urgency: 'Normal', quality: 95 },
  { id: 'T-2026-003', title: 'OWN your running DAYS', project: "Marathon", topic: 'Lifestyle fun content', country: 'TH', date: '2026-07-20', pillar: 'Event', assetType: 'Video, Reels', placement: 'Facebook, Instagram, TikTok', size: 'Reels / TikTok (1080x1920)', headline: 'Run with OWNDAYS', subtext: 'Running Event', designer: 'Arm', status: 'In Progress', urgency: 'High', isVideoProduction: true, shootingDate: '2026-07-10', editorStatus: 'Editing' },
  { id: 'T-2026-004', title: 'Siam Square One Closure', project: 'Siam Square One', topic: 'Permanently Closed', country: 'TH', date: '2026-07-12', pillar: 'Store Related', assetType: 'Statics', placement: 'Facebook, Instagram', size: 'FB Single (1080x1080)', headline: 'Permanently Closed', subtext: 'Branch will close.', condition: 'Visit Siam Center.', caption: 'Closed notice.', designer: 'Yok', status: 'Reviewing', urgency: 'Normal', quality: 90 },
];

const getProjectColor = (projectName) => {
  const colors = [
    'bg-blue-600 border-blue-500 text-white', 
    'bg-rose-600 border-rose-500 text-white', 
    'bg-emerald-600 border-emerald-500 text-white', 
    'bg-amber-600 border-amber-500 text-white', 
    'bg-purple-600 border-purple-500 text-white',
    'bg-indigo-600 border-indigo-500 text-white',
    'bg-cyan-600 border-cyan-500 text-white',
    'bg-pink-600 border-pink-500 text-white'
  ];
  let hash = 0;
  for (let i = 0; i < projectName?.length || 0; i++) {
    hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function SidebarItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </div>
      {badge && <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">{badge}</span>}
    </button>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState('board'); 
  const [tasks, setTasks] = useState(initialMockTasks);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editTaskData, setEditTaskData] = useState(null); 
  
  const [activeUser, setActiveUser] = useState(initialTeamMembers[4]); // เริ่มต้นด้วย Creative

  const [lineLogs, setLineLogs] = useState([
    { timestamp: '10:00 AM', type: 'system', message: 'System connected to Google Sheets Master Data.' }
  ]);

  const addLineLog = (type, message) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLineLogs(prev => [{ timestamp: time, type, message }, ...prev]);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchCountry = selectedCountry === 'ALL' || t.country === selectedCountry;
      const matchSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.project || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.designer || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCountry && matchSearch;
    });
  }, [tasks, selectedCountry, searchQuery]);

  const handleEditBrief = (task) => {
    setEditTaskData(task);
    setActiveView('brief');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 z-20 shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white mr-3 shadow-lg shadow-blue-500/20">O</div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">OWNDAYS</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Marketing Hub</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
          {/* ซ่อนเมนู Analytics จากคนนอก (Requester) */}
          {activeUser.Role !== 'Requester' && (
            <>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2">Data & Analytics</p>
              <nav className="space-y-1 mb-6">
                <SidebarItem icon={BarChart3} label="Yearly Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <SidebarItem icon={FolderOpen} label="Media Library" active={activeView === 'library'} onClick={() => setActiveView('library')} />
                <SidebarItem icon={CalendarDays} label="Calendar Plan" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
              </nav>
            </>
          )}

          <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2">Workspace</p>
          <nav className="space-y-1 mb-8">
            <SidebarItem icon={FileEdit} label={activeUser.Role === 'Requester' ? "Submit Task Request" : "Brief Generator"} active={activeView === 'brief'} onClick={() => { setEditTaskData(null); setActiveView('brief'); }} />
            {activeUser.Role !== 'Requester' && (
              <>
                <SidebarItem icon={KanbanSquare} label="Creative Board" active={activeView === 'board'} onClick={() => setActiveView('board')} />
                <SidebarItem icon={Film} label="Video Pipeline" active={activeView === 'video-timeline'} onClick={() => setActiveView('video-timeline')} />
                <SidebarItem icon={ListTodo} label="Master Data List" active={activeView === 'table'} onClick={() => setActiveView('table')} />
              </>
            )}
          </nav>

          {activeUser.Role !== 'Requester' && (
            <>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3 px-2 mt-4">Management</p>
              <nav className="space-y-1">
                <SidebarItem icon={Users} label="Team Access" active={activeView === 'team'} onClick={() => setActiveView('team')} />
              </nav>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.Name}&backgroundColor=1e293b`} className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800" alt="Profile" />
            <div className="truncate">
              <p className="text-sm font-bold text-white truncate">{activeUser.Name}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                {(activeUser.Role === 'SuperAdmin' || activeUser.Role === 'Manager') && <Award className="w-3 h-3 text-yellow-500"/>}
                {activeUser.Role}
              </p>
            </div>
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
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedCountry === c ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 hidden md:flex">
               <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Role Test:</span>
               <select 
                 value={activeUser.UserID} 
                 onChange={(e) => {
                   const found = teamMembers.find(m => m.UserID === e.target.value);
                   if(found) {
                     setActiveUser(found);
                     if(found.Role === 'Requester') setActiveView('brief');
                   }
                 }}
                 className={`bg-transparent text-xs font-black outline-none cursor-pointer ${(activeUser.Role === 'SuperAdmin' || activeUser.Role === 'Manager') ? 'text-yellow-500' : 'text-blue-400'}`}
               >
                 {teamMembers.map(m => (
                   <option key={m.UserID} value={m.UserID} className="bg-slate-950 text-white font-bold">{m.Name} ({m.Role})</option>
                 ))}
               </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search Topic, Project..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 w-48 lg:w-64"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            <div className="w-full h-full overflow-y-auto scrollbar-thin">
              {activeView === 'dashboard' && <YearlyDashboardView tasks={filteredTasks} />}
              {activeView === 'library' && <MediaLibraryView tasks={filteredTasks} />}
              {activeView === 'calendar' && <CalendarPlanView tasks={filteredTasks} />}
              {activeView === 'brief' && <BriefSlideGenerator setTasks={setTasks} teamMembers={teamMembers} addLineLog={addLineLog} editData={editTaskData} setEditData={setEditTaskData} activeUser={activeUser} apiUrl={API_URL} />}
              {activeView === 'board' && <BoardView tasks={filteredTasks} setTasks={setTasks} activeUser={activeUser} addLineLog={addLineLog} onEditTask={handleEditBrief} apiUrl={API_URL} />}
              {activeView === 'video-timeline' && <VideoTimelineView tasks={filteredTasks} />}
              {activeView === 'table' && <TableView tasks={filteredTasks} onEditTask={handleEditBrief} />}
              {activeView === 'team' && <TeamAdminView teamMembers={teamMembers} tasks={tasks} lineLogs={lineLogs} setTeamMembers={setTeamMembers} addLineLog={addLineLog} activeUser={activeUser} apiUrl={API_URL} />}
            </div>
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. YEARLY DASHBOARD VIEW
// ----------------------------------------------------------------------
function YearlyDashboardView({ tasks }) {
  const [analysisTab, setAnalysisTab] = useState('PROJECT');

  const dashboardData = {
    totalTasks: 293,
    topDesigner: { name: 'Yok', count: 90 },
    topEditor: { name: 'Mick', count: 32 },
    teamPerf: [
      { name: 'Yok', count: 90, color: 'bg-indigo-500' },
      { name: 'Minnie', count: 84, color: 'bg-blue-500' },
      { name: 'Mick', count: 32, color: 'bg-emerald-500' },
      { name: 'Poom', count: 30, color: 'bg-amber-500' },
      { name: 'Arm', count: 25, color: 'bg-rose-500' },
      { name: 'Nan', count: 13, color: 'bg-purple-500' },
      { name: 'Best', count: 10, color: 'bg-cyan-500' },
      { name: 'Other', count: 9, color: 'bg-slate-500' },
    ]
  };
  const maxPerf = Math.max(...dashboardData.teamPerf.map(d => d.count));

  const { projectStats, monthlyStats } = useMemo(() => {
    const pStats = {};
    const mStats = {};
    tasks.forEach(t => {
      const projName = t.project || 'Unknown';
      const pillarName = t.pillar || 'Generic';
      const assetName = t.assetType || 'Generic';

      if (!pStats[projName]) pStats[projName] = { total: 0, pillars: {}, assets: {} };
      pStats[projName].total++;
      pStats[projName].pillars[pillarName] = (pStats[projName].pillars[pillarName] || 0) + 1;
      pStats[projName].assets[assetName] = (pStats[projName].assets[assetName] || 0) + 1;

      const d = new Date(t.date);
      if (!isNaN(d)) {
        const monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        if (!mStats[monthKey]) mStats[monthKey] = { total: 0, pillars: {}, assets: {}, rawDate: d };
        mStats[monthKey].total++;
        mStats[monthKey].pillars[pillarName] = (mStats[monthKey].pillars[pillarName] || 0) + 1;
        mStats[monthKey].assets[assetName] = (mStats[monthKey].assets[assetName] || 0) + 1;
      }
    });

    const sortedProjects = Object.entries(pStats).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total);
    const sortedMonths = Object.entries(mStats).map(([name, data]) => ({ name, ...data })).sort((a, b) => a.rawDate - b.rawDate);
    return { projectStats: sortedProjects, monthlyStats: sortedMonths };
  }, [tasks]);

  const getPillarColor = (pillarName) => {
    switch(pillarName?.toLowerCase()) {
      case 'promotion': return 'bg-pink-500/20 text-pink-400 border-pink-900/50';
      case 'product': return 'bg-blue-500/20 text-blue-400 border-blue-900/50';
      case 'branding': return 'bg-violet-500/20 text-violet-400 border-violet-900/50';
      case 'event': return 'bg-orange-500/20 text-orange-400 border-orange-900/50';
      case 'lifestyle': return 'bg-emerald-500/20 text-emerald-400 border-emerald-900/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-blue-500"/> Yearly Content Dashboard (2026)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Overall performance and content distribution</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-4">
          <div className="text-center">
             <span className="text-[10px] font-black text-slate-500 uppercase block">Total Executed</span>
             <span className="text-xl font-black text-white">{dashboardData.totalTasks}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-amber-900/40 to-slate-950 border border-amber-900/50 p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden">
           <Trophy className="w-12 h-12 text-amber-500 shrink-0"/>
           <div className="relative z-10">
             <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Top Designer 👑</p>
             <h3 className="text-2xl font-black text-white">{dashboardData.topDesigner.name}</h3>
             <p className="text-sm text-slate-300 font-bold">{dashboardData.topDesigner.count} Tasks Completed</p>
           </div>
           <Star className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500 opacity-5"/>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-950 border border-emerald-900/50 p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden">
           <Award className="w-12 h-12 text-emerald-500 shrink-0"/>
           <div className="relative z-10">
             <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Top Video Editor 👑</p>
             <h3 className="text-2xl font-black text-white">{dashboardData.topEditor.name}</h3>
             <p className="text-sm text-slate-300 font-bold">{dashboardData.topEditor.count} Tasks Completed</p>
           </div>
           <Star className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500 opacity-5"/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl col-span-1 lg:col-span-1 h-fit">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-blue-400"/> Team Performance</h3>
            <span className="text-xs font-bold text-slate-500">{dashboardData.totalTasks} Total</span>
          </div>
          <div className="space-y-5">
            {dashboardData.teamPerf.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 text-right shrink-0">
                  <span className="text-xs font-bold text-slate-300">{d.name}</span>
                </div>
                <div className="flex-1 bg-slate-900 rounded-full h-3.5 overflow-hidden flex items-center">
                  <div className={`${d.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${(d.count / maxPerf) * 100}%` }}></div>
                </div>
                <div className="w-8 shrink-0 text-right">
                  <span className="text-xs font-black text-slate-400">{d.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400"/> Content Strategy & Distribution</h3>
              <p className="text-[10px] text-slate-500 mt-1">Deep dive analytics (Values in Total Count)</p>
            </div>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button onClick={() => setAnalysisTab('PROJECT')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${analysisTab === 'PROJECT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Briefcase className="w-3.5 h-3.5"/> By Project
              </button>
              <button onClick={() => setAnalysisTab('MONTHLY')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${analysisTab === 'MONTHLY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <CalendarIcon className="w-3.5 h-3.5"/> By Month
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4 max-h-[400px]">
            {analysisTab === 'PROJECT' ? (
              projectStats.map((proj, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-black text-white">{proj.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">Total: {proj.total}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 flex items-center gap-1"><PieChart className="w-3 h-3"/> Pillars Focus</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(proj.pillars).map(([pillar, count]) => (
                          <span key={pillar} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPillarColor(pillar)}`}>
                            {pillar} <span className="font-black ml-1">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Asset Types Used</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(proj.assets).map(([asset, count]) => (
                          <span key={asset} className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                            {asset} <span className="font-black text-slate-400 ml-1">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              monthlyStats.map((month, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-black text-blue-400">{month.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">Total: {month.total}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 flex items-center gap-1"><PieChart className="w-3 h-3"/> Pillars Allocation</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(month.pillars).map(([pillar, count]) => (
                          <span key={pillar} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPillarColor(pillar)}`}>
                            {pillar} <span className="font-black ml-1">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Asset Outputs</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(month.assets).map(([asset, count]) => (
                          <span key={asset} className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                            {asset} <span className="font-black text-slate-400 ml-1">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. MEDIA LIBRARY VIEW
// ----------------------------------------------------------------------
function MediaLibraryView({ tasks }) {
  const publishedTasks = tasks.filter(t => t.status === 'Published');
  const [filterType, setFilterType] = useState('ALL');

  const displayTasks = publishedTasks.filter(t => filterType === 'ALL' || (t.assetType && t.assetType.includes(filterType)));

  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
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
          {['ALL', 'Statics', 'Reels'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {displayTasks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <Image className="w-12 h-12 mb-4 opacity-50"/>
          <p className="font-bold">No matching files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayTasks.map(task => (
            <div key={task.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-600 transition-all flex flex-col">
              <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                <img src={task.assetUrl || `https://via.placeholder.com/400x300/1e293b/334155?text=${task.project}`} alt={task.topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform" title="Download">
                    <DownloadCloud className="w-5 h-5"/>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center border border-slate-700 hover:scale-110 transition-transform" title="View Source">
                    <ExternalLink className="w-5 h-5"/>
                  </button>
                </div>

                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="bg-slate-950/80 backdrop-blur text-[9px] font-black text-white px-2 py-1 rounded border border-slate-700/50 uppercase">
                    {task.assetType}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{task.project}</p>
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug" title={task.topic}>{task.topic}</h3>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                      {task.designer.charAt(0)}
                    </div>
                    <span>{task.designer}</span>
                  </div>
                  <span>{new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. CALENDAR PLAN VIEW
// ----------------------------------------------------------------------
function CalendarPlanView({ tasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-07-01'));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const tasksInMonth = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate.getMonth() === currentMonth.getMonth() && taskDate.getFullYear() === currentMonth.getFullYear();
  });

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarDays className="text-blue-500 w-6 h-6"/> Content Calendar Plan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Monthly calendar view for campaign overview (Color-Coded by Project)</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-white min-w-[120px] text-center">
            {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(130px,auto)] bg-slate-900 gap-px border-b border-slate-800">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="bg-slate-950/50 p-2 opacity-50"></div>
          ))}
          
          {days.map(day => {
            const dayTasks = tasksInMonth.filter(task => new Date(task.date).getDate() === day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div key={day} className={`bg-slate-950 p-2 border-r border-b border-slate-800 hover:bg-slate-900/50 transition-colors flex flex-col group min-h-[130px] ${isToday ? 'bg-blue-950/20' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 group-hover:text-white'}`}>
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                     <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{dayTasks.length}</span>
                  )}
                </div>
                
                <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-none pr-1">
                  {dayTasks.map(task => {
                    const colorClass = getProjectColor(task.project);
                    return (
                      <div key={task.id} className={`text-left px-2 py-1.5 rounded-md border text-[10px] leading-tight font-medium cursor-pointer transition-colors shadow-sm ${colorClass}`}>
                        <div className="flex items-center justify-between mb-0.5 opacity-80">
                          <span className="font-black truncate">{task.project}</span>
                          {task.isVideoProduction && <Video className="w-3 h-3 shrink-0"/>}
                        </div>
                        <p className="line-clamp-2 drop-shadow-sm font-bold" title={task.topic}>{task.topic}</p>
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
// 4. BRIEF GENERATOR / REQUEST FORM
// ----------------------------------------------------------------------
function BriefSlideGenerator({ setTasks, teamMembers, addLineLog, editData, setEditData, activeUser, apiUrl }) {
  const [briefType, setBriefType] = useState(editData?.isVideoProduction ? 'video' : 'graphic');

  const initSizes = editData ? (editData.size || '').split(', ').filter(s => STANDARD_SIZES.includes(s)) : [];
  const initPlatforms = editData ? (editData.placement || '').split(', ').filter(p => STANDARD_PLATFORMS.includes(p)) : [];
  const initOtherSize = editData ? (editData.size || '').split(', ').filter(s => !STANDARD_SIZES.includes(s)).join(', ') : '';

  const isRequester = activeUser.Role === 'Requester';

  const [formData, setFormData] = useState({
    id: editData?.id || null,
    project: editData?.project || '',
    topic: editData?.topic || '',
    selectedPlatforms: initPlatforms,
    selectedSizes: initSizes,
    otherSize: initOtherSize,
    date: editData?.date || new Date().toISOString().split('T')[0],
    country: editData?.country || 'TH',
    mainTitle: editData?.headline || '',
    subTitle: editData?.subtext || '',
    footerText: editData?.condition || '',
    caption: editData?.caption || '',
    designer: editData?.designer || 'Unassigned',
    urgency: editData?.urgency || 'Normal',
    shootingDate: editData?.shootingDate || '',
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setBriefType(editData.isVideoProduction ? 'video' : 'graphic');
      const eSizes = (editData.size || '').split(', ').filter(s => STANDARD_SIZES.includes(s));
      const ePlatforms = (editData.placement || '').split(', ').filter(p => STANDARD_PLATFORMS.includes(p));
      const eOther = (editData.size || '').split(', ').filter(s => !STANDARD_SIZES.includes(s)).join(', ');
      setFormData({
        id: editData.id,
        project: editData.project || '',
        topic: editData.topic || '',
        selectedPlatforms: ePlatforms,
        selectedSizes: eSizes,
        otherSize: eOther,
        date: editData.date || new Date().toISOString().split('T')[0],
        country: editData.country || 'TH',
        mainTitle: editData.headline || '',
        subTitle: editData.subtext || '',
        footerText: editData.condition || '',
        caption: editData.caption || '',
        designer: editData.designer || 'Unassigned',
        urgency: editData.urgency || 'Normal',
        shootingDate: editData.shootingDate || '',
      });
    }
  }, [editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCheckbox = (listName, item) => {
    setFormData(prev => {
      const currentList = prev[listName];
      const isSelected = currentList.includes(item);
      const newList = isSelected ? currentList.filter(i => i !== item) : [...currentList, item];
      return { ...prev, [listName]: newList };
    });
  };

  const handlePublish = async () => {
    if (!formData.project || !formData.topic) {
      alert("Please fill in Project and Topic.");
      return;
    }

    setIsSubmitting(true);
    const finalSizes = [...formData.selectedSizes];
    if (formData.otherSize.trim() !== '') finalSizes.push(formData.otherSize.trim());
    const finalSizeString = finalSizes.join(', ');
    const finalPlacementString = formData.selectedPlatforms.join(', ');

    let initialStatus = editData ? editData.status : 'Incoming Requests'; 

    const payload = {
      id: formData.id || 'T-2026-' + Math.floor(1000 + Math.random() * 9000),
      title: formData.topic.slice(0, 30),
      project: formData.project,
      topic: formData.topic,
      country: formData.country,
      date: formData.date,
      pillar: editData?.pillar || 'Generic', 
      assetType: briefType === 'video' ? 'Video, Reels' : 'Statics',
      placement: finalPlacementString,
      size: finalSizeString,
      headline: formData.mainTitle,
      subtext: formData.subTitle,
      condition: formData.footerText,
      caption: formData.caption,
      designer: formData.designer,
      status: initialStatus,
      urgency: formData.urgency,
      quality: 95,
      isVideoProduction: briefType === 'video',
      shootingDate: formData.shootingDate,
      editorStatus: editData?.editorStatus || '',
      lastUpdated: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    };

    try {
      if (formData.id) {
        setTasks(prev => prev.map(t => t.id === formData.id ? payload : t));
        fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateTask', data: payload }) }).catch(e => console.log('Mock Mode'));
        alert(`อัปเดตบรีฟสำเร็จ! ระบบบันทึกการแก้ไขแล้ว`);
      } else {
        setTasks(prev => [payload, ...prev]);
        fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'createTask', data: payload }) }).catch(e => console.log('Mock Mode'));
        alert(`ส่ง Request งานสำเร็จ! งานถูกส่งไปให้ทีม Creative ตรวจสอบแล้ว`);
        setFormData({ ...formData, project: '', topic: '', mainTitle: '', subTitle: '', caption: '' });
      }
      setEditData(null); 
    } catch(e) {
      console.warn("Offline mode.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-900 relative">
      <div className={`h-full overflow-y-auto p-6 flex flex-col items-center bg-slate-900/60 transition-all ${isFullscreen ? 'w-full absolute inset-0 z-50 bg-slate-950' : 'w-2/3'}`}>
        
        {editData && (
          <div className="w-full max-w-5xl bg-amber-500/20 border border-amber-500/50 rounded-lg p-3 mb-4 flex items-center justify-between text-amber-400 text-sm font-bold">
            <div className="flex items-center gap-2"><Edit2 className="w-4 h-4"/> โหมดแก้ไขบรีฟ (Editing Mode)</div>
            {editData.lastUpdated && <div className="flex items-center gap-1 text-xs"><History className="w-3.5 h-3.5"/> แก้ไขล่าสุด: {editData.lastUpdated}</div>}
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
                    {formData.selectedSizes.length === 0 && !formData.otherSize && <span className="text-slate-400 text-sm italic">ยังไม่ได้ระบุไซส์</span>}
                  </div>
                </div>
             </div>

             <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">📌 ข้อความหลักที่ต้องเน้นใหญ่ที่สุด (Main Headline)</p>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-snug mb-6">{formData.mainTitle || '[รอใส่หัวข้อหลัก]'}</h1>
                
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">📝 ข้อความรอง / รายละเอียด (Subtext)</p>
                <h3 className="text-xl font-bold text-slate-700 leading-relaxed max-w-3xl mb-8 whitespace-pre-wrap">{formData.subTitle || '[รอใส่รายละเอียดรอง]'}</h3>
                
                {briefType === 'graphic' ? (
                  <div className="mt-auto self-start">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">⚠️ เงื่อนไขเพิ่มเติม (Conditions / Footer)</p>
                    <span className="inline-block bg-yellow-200 text-yellow-900 font-bold px-4 py-2 rounded-lg text-sm">{formData.footerText || '[ไม่มีเงื่อนไขเพิ่มเติม]'}</span>
                  </div>
                ) : (
                  <div className="mt-auto grid grid-cols-2 gap-4 max-w-lg bg-slate-100 p-4 rounded-xl border border-slate-200">
                    <div><p className="text-[10px] font-black text-slate-500 uppercase">Shooting Date</p><p className="font-bold text-sm">{formData.shootingDate || 'TBD'}</p></div>
                  </div>
                )}
             </div>
          </div>
          
          {editData?.lastUpdated && (
            <div className="absolute bottom-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1.5 rounded-full border border-amber-300 shadow-sm flex items-center gap-1">
              <History className="w-3 h-3"/> Edited: {editData.lastUpdated}
            </div>
          )}
        </div>

        <div className="w-full max-w-5xl mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-400 mb-2">Social Copy / Caption</h4>
            <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">{formData.caption || '...'}</p>
        </div>
      </div>

      {!isFullscreen && (
        <div className="w-1/3 h-full bg-slate-950 border-l border-slate-800 overflow-y-auto p-6 scrollbar-thin">
          <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500"/> {editData ? 'Edit Details' : (isRequester ? 'Submit Request Form' : 'New Brief Settings')}
          </h3>

          <div className="bg-amber-500/10 border border-amber-500/50 p-3 rounded-lg mb-6 text-[10px] text-amber-500 font-medium leading-relaxed">
             <strong className="block text-amber-400 text-xs mb-1">⚠️ ข้อกำหนดการขอ Artwork / Video</strong>
             กรุณาเผื่อระยะเวลาทำงานล่วงหน้า 1 สัปดาห์<br/>
             หากเป็นงานระดับ <span className="font-black text-rose-400">Urgent</span> หรือ <span className="font-black text-rose-400">Emergency</span> ระบบจะส่งให้ Manager หรือ SuperAdmin อนุมัติการแทรกคิวก่อนทีมจะเริ่มงาน
          </div>
          
          <div className="space-y-6">
             <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-2">1. Basic Info</p>
                <div><label className="text-xs text-slate-400 block mb-1">Project</label><input name="project" value={formData.project} onChange={handleInputChange} placeholder="e.g., Summer Sale" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Topic</label><input name="topic" value={formData.topic} onChange={handleInputChange} placeholder="e.g., Buy 1 Get 1" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Target Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
             </div>

             <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-1">2. Platforms & Sizes <span className="text-[9px] text-slate-500 normal-case font-normal">(ให้กราฟิกรู้ว่าต้องทำกี่ไซส์)</span></p>
                
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
                  <input name="otherSize" value={formData.otherSize} onChange={handleInputChange} placeholder="e.g., Cover Page (820x312)" className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg text-xs text-white placeholder:text-slate-600"/>
                </div>
             </div>

             <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">3. Copywriting (ข้อความบนภาพ)</p>
                <div>
                  <label className="text-xs text-amber-400 font-bold block mb-1 flex items-center justify-between">
                    <span>Main Headline (ข้อความที่ต้องเน้นใหญ่สุด)</span>
                    <AlertCircle className="w-3 h-3"/>
                  </label>
                  <input name="mainTitle" value={formData.mainTitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-amber-900/50 p-2 rounded-lg text-xs text-amber-100 font-bold"/>
                </div>
                <div><label className="text-xs text-slate-400 block mb-1">Subtext (รายละเอียดรอง)</label><textarea name="subTitle" value={formData.subTitle} onChange={handleInputChange} rows={3} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Conditions (เงื่อนไขใต้ภาพ)</label><input name="footerText" value={formData.footerText} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-400"/></div>
                <div><label className="text-xs text-slate-400 block mb-1 mt-2">Social Caption</label><textarea name="caption" value={formData.caption} onChange={handleInputChange} rows={3} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-400"/></div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 pt-2">
               {!isRequester && (
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Assign To</label>
                   <select name="designer" value={formData.designer} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white font-bold">
                      <option value="Unassigned">Unassigned (To Pool)</option>
                      {teamMembers.filter(m => m.Role === 'Graphic' || m.Role === 'Editor').map(m => <option key={m.Name} value={m.Name}>{m.Name} ({m.Role})</option>)}
                   </select>
                 </div>
               )}
               <div className={isRequester ? "col-span-2" : ""}>
                 <label className="text-xs text-slate-400 block mb-1">Urgency</label>
                 <select name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white font-bold">
                    <option value="Normal">Normal (ล่วงหน้า 1 สัปดาห์)</option>
                    <option value="Urgent">Urgent (งานด่วน)</option>
                    <option value="Emergency">Emergency (ด่วนพิเศษ)</option>
                 </select>
               </div>
             </div>
             
             <button onClick={handlePublish} disabled={isSubmitting} className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-xl text-xs flex justify-center items-center shadow-lg shadow-blue-600/20 transition-all">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : (editData ? 'Update Details' : (isRequester ? 'Submit Request to Creative' : 'Generate & Add to Pool'))}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. KANBAN BOARD (Flow ใหม่: Asana-like Pools)
// ----------------------------------------------------------------------
function BoardView({ tasks, setTasks, activeUser, apiUrl, onEditTask }) {
  
  const moveTask = (taskId, direction) => {
    setTasks(currentTasks => currentTasks.map(t => {
      if (t.id === taskId) {
        const currentIndex = STAGES.indexOf(t.status);
        let newIndex = currentIndex + direction;
        let additionalData = {};
        if (STAGES[newIndex] === 'Published') {
           additionalData.assetUrl = `https://images.unsplash.com/photo-${Math.floor(1500000000000 + Math.random()*100000000000)}?auto=format&fit=crop&w=400&q=80`;
        }
        if (newIndex >= 0 && newIndex < STAGES.length) return { ...t, status: STAGES[newIndex], ...additionalData };
      }
      return t;
    }));
  };

  const claimTask = (taskId) => {
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, designer: activeUser.Name, status: 'In Progress' } : t));
    fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'claimTask', taskId: taskId, designerId: activeUser.Name }) }).catch(e => console.log('Mock Mode'));
  };

  const releaseTask = (taskId) => {
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, designer: 'Unassigned', status: 'Open Pool' } : t));
  };

  const approveToPool = (taskId, urgency) => {
    if ((urgency === 'Urgent' || urgency === 'Emergency') && activeUser.Role === 'Creative') {
      alert('ไม่อนุญาต: งานระดับ Urgent/Emergency ต้องได้รับการอนุมัติจาก Manager หรือ SuperAdmin เท่านั้น');
      return;
    }

    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, status: 'Open Pool' } : t));
    fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', taskId: taskId, newStatus: 'Open Pool', userId: activeUser.Name }) }).catch(e => console.log('Mock Mode'));
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Creative Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">Request Queue -&gt; Creative Review -&gt; Open Pool -&gt; Design</p>
        </div>
        <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
           <span>Actioning as: <strong className="text-emerald-400">{activeUser.Name} ({activeUser.Role})</strong></span>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start snap-x">
        {STAGES.map((stage, sIdx) => {
          const stageTasks = tasks.filter(t => t.status === stage);
          return (
            <div key={stage} className={`bg-slate-950/40 border rounded-2xl w-[340px] shrink-0 flex flex-col max-h-full snap-center ${stage === 'Incoming Requests' ? 'border-amber-900/50' : stage === 'Open Pool' ? 'border-blue-900/50' : 'border-slate-800'}`}>
              
              <div className={`p-4 border-b flex justify-between items-center rounded-t-2xl ${stage === 'Incoming Requests' ? 'bg-amber-950/40 border-amber-900/50' : stage === 'Open Pool' ? 'bg-blue-950/40 border-blue-900/50' : 'bg-slate-950/80 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  {stage === 'Incoming Requests' && <Inbox className="w-4 h-4 text-amber-500"/>}
                  {stage === 'Open Pool' && <FolderOpen className="w-4 h-4 text-blue-500"/>}
                  <h4 className={`text-xs font-black uppercase tracking-wider ${stage === 'Incoming Requests' ? 'text-amber-500' : stage === 'Open Pool' ? 'text-blue-400' : 'text-slate-300'}`}>{stage}</h4>
                </div>
                <span className="bg-slate-900 border border-slate-800 text-xs px-2 rounded-full text-slate-400">{stageTasks.length}</span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
                {stageTasks.map(task => (
                  <div key={task.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 hover:border-slate-600 transition-all group relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 border rounded ${task.urgency === 'Emergency' || task.urgency === 'Urgent' ? 'bg-rose-950 border-rose-800 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>{task.urgency}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-slate-500 font-bold">{task.id}</span>
                        {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') && (
                          <button onClick={() => onEditTask(task)} className="text-slate-500 hover:text-blue-400 transition-colors" title="Edit Brief Details">
                            <Edit2 className="w-3.5 h-3.5"/>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <h5 className="text-sm font-bold text-white mb-2 leading-snug">{task.topic || task.title}</h5>
                    <p className="text-[10px] text-slate-400 mb-2 border-b border-slate-800/50 pb-2 flex items-center justify-between">
                      <span>Assignee: <span className="font-bold text-slate-300">{task.designer}</span></span>
                      <span>{new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </p>
                    
                    {task.lastUpdated && (
                      <div className="text-[9px] text-amber-500/80 font-bold mb-3 flex items-center gap-1">
                         <History className="w-3 h-3"/> Edited: {task.lastUpdated}
                      </div>
                    )}
                    
                    {/* Logic ปุ่มตาม Stage และ Role */}
                    
                    {/* Stage 1: Incoming Requests (For Creative/Manager to Review) */}
                    {stage === 'Incoming Requests' && (
                       <div className="mt-2">
                         {(activeUser.Role === 'Creative' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') ? (
                           <button 
                             onClick={() => approveToPool(task.id, task.urgency)} 
                             className={`w-full py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1
                               ${(task.urgency === 'Urgent' || task.urgency === 'Emergency') && activeUser.Role === 'Creative' 
                                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                                  : 'bg-amber-500/20 text-amber-500 border-amber-900/50 hover:bg-amber-500 hover:text-white'}`}
                           >
                             <CheckSquare className="w-3.5 h-3.5"/> 
                             {(task.urgency === 'Urgent' || task.urgency === 'Emergency') && activeUser.Role === 'Creative' ? 'Waiting Manager Approval' : 'Approve to Open Pool'}
                           </button>
                         ) : (
                           <p className="text-center text-[10px] text-slate-500 italic mt-2">Waiting for Creative review</p>
                         )}
                       </div>
                    )}

                    {/* Stage 2: Open Pool (For Graphic/Editor to Claim) */}
                    {stage === 'Open Pool' && (
                       <div className="mt-2">
                         {(activeUser.Role === 'Graphic' || activeUser.Role === 'Editor') && task.designer === 'Unassigned' && (
                           <button onClick={() => claimTask(task.id)} className="w-full py-1.5 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-900/50 hover:bg-blue-600 hover:text-white transition-colors">
                             Pick up this Task
                           </button>
                         )}
                       </div>
                    )}

                    {/* Stage 3+: In Progress Onward */}
                    {sIdx > 1 && task.designer === activeUser.Name && (
                       <button onClick={() => releaseTask(task.id)} className="w-full py-1.5 bg-rose-600/10 text-rose-400 text-xs font-bold rounded-lg border border-rose-900/50 hover:bg-rose-600 hover:text-white transition-colors mt-2">
                         Release Task back to Pool
                       </button>
                    )}

                    {/* ลูกศรเลื่อน Stage ซ้ายขวา สำหรับคนทำ */}
                    {sIdx > 1 && (activeUser.Role === 'Graphic' || activeUser.Role === 'Editor' || activeUser.Role === 'Manager' || activeUser.Role === 'SuperAdmin') && (
                      <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => moveTask(task.id, -1)} className="px-2 py-1 bg-slate-800 rounded text-xs text-white" disabled={stage === STAGES[2]}>←</button>
                         <button onClick={() => moveTask(task.id, 1)} className="px-2 py-1 bg-slate-800 rounded text-xs text-white" disabled={stage === STAGES[STAGES.length - 1]}>→</button>
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
// 6. VIDEO TIMELINE 
// ----------------------------------------------------------------------
function VideoTimelineView({ tasks }) {
  const videoTasks = tasks.filter(t => t.isVideoProduction);
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-black text-white mb-6">Video Production Pipeline</h2>
      <div className="space-y-4">
        {videoTasks.map(task => (
          <div key={task.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">{task.title}</h4>
              <p className="text-xs text-slate-500">Editor: {task.designer} | Status: {task.editorStatus || task.status}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-500 block">Shoot Date</span>
              <span className="text-sm font-bold text-blue-400">{task.shootingDate || 'TBA'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. TABLE VIEW
// ----------------------------------------------------------------------
function TableView({ tasks, onEditTask }) {
  return (
    <div className="p-6 lg:p-8">
      <h2 className="text-xl font-black text-white mb-6">Master Data Register</h2>
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-900 text-[10px] uppercase text-slate-500">
            <tr>
              <th className="p-4">Action</th>
              <th className="p-4">ID</th>
              <th className="p-4">Project</th>
              <th className="p-4">Topic</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Deadline</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-800/50">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-slate-900/50">
                <td className="p-4">
                   <button onClick={() => onEditTask(t)} className="text-slate-500 hover:text-blue-400 transition-colors p-1 bg-slate-900 border border-slate-800 rounded" title="Edit">
                     <Edit2 className="w-3.5 h-3.5"/>
                   </button>
                </td>
                <td className="p-4 font-bold text-slate-400">{t.id} {t.lastUpdated && <span className="text-amber-500 ml-1 text-[10px]" title={`Edited: ${t.lastUpdated}`}>*</span>}</td>
                <td className="p-4 font-bold text-white">{t.project}</td>
                <td className="p-4 text-slate-300">{t.topic}</td>
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

// ----------------------------------------------------------------------
// 8. TEAM & ADMIN VIEW
// ----------------------------------------------------------------------
function TeamAdminView({ teamMembers, setTeamMembers, activeUser, apiUrl }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Graphic');

  const isSuperAdmin = activeUser.Role === 'SuperAdmin';
  const isManager = activeUser.Role === 'Manager';
  const canInvite = isSuperAdmin || isManager;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!canInvite) {
      alert("Access Denied: Only SuperAdmin or Manager can invite new users.");
      return;
    }
    const newMember = { UserID: 'u_' + Date.now(), Name: name, Email: email, Role: role, CountryAccess: 'TH', LINE_ID: '', Status: 'Active', TasksCompleted: 0 };
    setTeamMembers([...teamMembers, newMember]);
    fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'createUser', data: newMember }) }).catch(e => console.log('Mock Mode'));
    setShowAddModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white">Team Access Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage users and access permissions</p>
        </div>
        
        {canInvite ? (
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4"/> Invite User
          </button>
        ) : (
          <div className="bg-slate-900 border border-slate-800 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <Eye className="w-4 h-4"/> View Only
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.UserID} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
             <div className="flex items-center gap-4 mb-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.Name}&backgroundColor=0f172a`} className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900" alt="" />
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    {member.Name} 
                    {(member.Role === 'SuperAdmin' || member.Role === 'Manager') && <Award className="w-3.5 h-3.5 text-yellow-500"/>}
                  </h3>
                  <p className="text-[10px] text-slate-500">{member.Email}</p>
                </div>
             </div>
             <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">Role: <span className="text-white font-bold">{member.Role}</span></div>
          </div>
        ))}
      </div>

      {showAddModal && canInvite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500"><XCircle className="w-5 h-5"/></button>
            <h3 className="text-base font-black text-white mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500"/> Invite User</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div><label className="text-xs text-slate-400">Name</label><input required className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm" value={name} onChange={e=>setName(e.target.value)} /></div>
              <div><label className="text-xs text-slate-400">Email</label><input required type="email" className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm" value={email} onChange={e=>setEmail(e.target.value)} /></div>
              <div>
                <label className="text-xs text-slate-400">Role</label>
                <select className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="Graphic">Graphic</option>
                  <option value="Editor">Editor</option>
                  <option value="Manager">Manager</option>
                  <option value="Creative">Creative</option>
                  <option value="Requester">Requester (External)</option>
                  {isSuperAdmin && <option value="SuperAdmin">SuperAdmin</option>}
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