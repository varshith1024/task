import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const catColors = {
  Design:  { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  Dev:     { bg: 'bg-blue-500/20',   text: 'text-blue-300'   },
  Meeting: { bg: 'bg-amber-500/20',  text: 'text-amber-300'  },
  Other:   { bg: 'bg-zinc-500/20',   text: 'text-zinc-300'   },
};

const navItems = [
  { label: 'All Tasks', value: '', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  { label: 'Pending',   value: 'pending',   icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/></svg> },
  { label: 'Completed', value: 'completed', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

const categories = ['Design', 'Dev', 'Meeting', 'Other'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [form, setForm]             = useState({ title: '', description: '', category: 'Other' });
  const [editId, setEditId]         = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter]         = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [search, setSearch]         = useState('');
  const [stats, setStats]           = useState({ total: 0, done: 0, pending: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      if (search) params.search = search;
      const { data } = await api.get('/tasks', { params });
      let list = data.tasks;
      if (catFilter) list = list.filter(t => t.category === catFilter);
      setTasks(list);
      const total = data.tasks.length;
      const done  = data.tasks.filter(t => t.status === 'completed').length;
      setStats({ total, done, pending: total - done });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTasks(); }, [filter, search, catFilter]);

  // close sidebar on mobile when filter selected
  const handleNavClick = (val) => {
    setFilter(val); setCatFilter('');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };
  const handleCatClick = (cat) => {
    setCatFilter(catFilter === cat ? '' : cat); setFilter('');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const openModal = (task = null) => {
    if (task) { setForm({ title: task.title, description: task.description, category: task.category || 'Other' }); setEditId(task._id); }
    else { setForm({ title: '', description: '', category: 'Other' }); setEditId(null); }
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const saveTask = async () => {
    if (!form.title.trim()) return;
    try {
      if (editId) await api.put(`/tasks/${editId}`, form);
      else await api.post('/tasks', form);
      closeModal(); fetchTasks();
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (task) => {
    await api.put(`/tasks/${task._id}`, { status: task.status === 'completed' ? 'pending' : 'completed' });
    fetchTasks();
  };

  const askDelete    = (id) => { setDeleteTarget(id); setShowConfirm(true); };
  const confirmDelete = async () => {
    await api.delete(`/tasks/${deleteTarget}`);
    setShowConfirm(false); setDeleteTarget(null); fetchTasks();
  };

  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      className="min-h-screen bg-[#0f0f0f] text-white flex relative overflow-hidden"
      onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* ── AMBIENT ORBS ── */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-[#c8f55a]/10 rounded-full blur-[180px] animate-pulse pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-[#c8f55a]/5 rounded-full blur-[150px] pointer-events-none z-0" style={{ animation: 'float 8s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none rounded-full blur-[120px] z-0"
        style={{ width: '350px', height: '350px', background: '#c8f55a', opacity: 0.06,
          left: mousePos.x - 175, top: mousePos.y - 175, transition: 'all 0.15s linear' }} />

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed md:relative z-30 md:z-10
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 flex-shrink-0 bg-[#141414] border-r border-white/10 flex flex-col
        transition-transform duration-300 min-h-screen h-full
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c8f55a] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <span className="font-bold text-white text-lg">TaskFlow</span>
          </div>
          {/* close btn mobile */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c8f55a] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Views</p>
          {navItems.map(item => (
            <button key={item.value} onClick={() => handleNavClick(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${filter === item.value && !catFilter ? 'bg-[#c8f55a]/15 text-[#c8f55a]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              {item.icon}
              <span>{item.label}</span>
              <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {item.value === '' ? stats.total : item.value === 'pending' ? stats.pending : stats.done}
              </span>
            </button>
          ))}

          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mt-5 mb-3">Categories</p>
          {categories.map(cat => {
            const c = catColors[cat];
            return (
              <button key={cat} onClick={() => handleCatClick(cat)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${catFilter === cat ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${c.bg} ${c.text}`}>{cat[0]}</span>
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-4 border-t border-white/10">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="relative z-10 flex-1 flex flex-col min-h-screen overflow-auto w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0f0f0f]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            {/* hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div>
              <p className="text-gray-500 text-xs hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-base md:text-xl font-bold">
                {greeting()}, <span className="text-[#c8f55a]">{user?.name?.split(' ')[0]} 👋</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* search — hidden on very small, shown sm+ */}
            <div className="relative hidden sm:block">
              <input type="text" placeholder="Search…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a] w-36 md:w-48"/>
              <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <button onClick={() => openModal()}
              className="flex items-center gap-1.5 bg-[#c8f55a] text-black font-semibold px-3 md:px-4 py-2 rounded-xl text-sm hover:bg-[#d4ff66] transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* mobile search */}
        <div className="sm:hidden px-4 pt-3">
          <div className="relative">
            <input type="text" placeholder="Search tasks…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a]"/>
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[
              { label: 'Total',     value: stats.total,   color: 'text-white',        sub: 'All tasks' },
              { label: 'Completed', value: stats.done,    color: 'text-[#c8f55a]',    sub: `${pct}% done` },
              { label: 'Pending',   value: stats.pending, color: 'text-amber-400',     sub: 'In progress' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 truncate">{s.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-600 text-xs mt-1 hidden sm:block">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold">Overall Progress</span>
              <span className="text-[#c8f55a] text-sm font-bold">{pct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#c8f55a] to-[#8bcc1f] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Task header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm md:text-base">
              {catFilter ? `${catFilter} Tasks` : filter ? `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks` : 'All Tasks'}
              <span className="ml-2 text-xs text-gray-500 font-normal">{tasks.length} tasks</span>
            </h2>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No tasks here. Add one!</p>
              </div>
            )}

            {tasks.map(task => {
              const c = catColors[task.category] || catColors.Other;
              return (
                <div key={task._id} className="group bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 flex items-center gap-3 hover:border-white/20 hover:bg-white/[0.07] transition-all">
                  <button onClick={() => toggleStatus(task)}
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                      ${task.status === 'completed' ? 'bg-[#c8f55a] border-[#c8f55a]' : 'border-white/20 hover:border-[#c8f55a]/60'}`}>
                    {task.status === 'completed' && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-gray-600 text-xs truncate mt-0.5">{task.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {task.category && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg hidden sm:inline ${c.bg} ${c.text}`}>
                        {task.category}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium
                      ${task.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {task.status === 'completed' ? '✓' : '…'}
                      <span className="hidden sm:inline ml-1">{task.status}</span>
                    </span>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openModal(task)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button onClick={() => askDelete(task._id)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── ADD/EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editId ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Title *</label>
              <input type="text" placeholder="e.g. Design homepage" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a]"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
              <textarea placeholder="What needs to be done?" rows={3} value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a] resize-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c8f55a]">
                <option value="Design">Design</option>
                <option value="Dev">Dev</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={saveTask} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#c8f55a] text-black hover:bg-[#d4ff66] transition-colors">Save Task</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Delete Task?</h3>
              <p className="text-gray-500 text-sm">This action can't be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}