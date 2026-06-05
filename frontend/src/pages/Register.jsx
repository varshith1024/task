import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-[#0f0f0f] overflow-hidden p-4"
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* Top-right orb */}
      <div className="absolute top-[-150px] right-[10%] w-[550px] h-[550px] bg-[#c8f55a]/10 rounded-full blur-[180px] animate-pulse" />

      {/* Bottom-left orb */}
      <div className="absolute bottom-[-180px] left-[10%] w-[500px] h-[500px] bg-[#c8f55a]/5 rounded-full blur-[170px]"
        style={{ animation: 'float 8s ease-in-out infinite' }} />

      {/* Mouse follow glow */}
      <div
        className="absolute pointer-events-none rounded-full blur-[120px]"
        style={{
          width: '350px', height: '350px',
          background: '#c8f55a', opacity: 0.12,
          left: mousePos.x - 175, top: mousePos.y - 175,
          transition: 'all 0.15s linear',
        }}
      />

      {/* Green haze */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at center, rgba(200,245,90,0.03) 0%, transparent 70%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#c8f55a] flex items-center justify-center shadow-lg shadow-[#c8f55a]/30">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold">TaskFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5 shadow-2xl shadow-black/30">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">Account created! Redirecting…</p>}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Full Name</label>
            <input type="text" placeholder="John Doe" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a] focus:ring-2 focus:ring-[#c8f55a]/20" required/>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a] focus:ring-2 focus:ring-[#c8f55a]/20" required/>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f55a] focus:ring-2 focus:ring-[#c8f55a]/20" required/>
          </div>

          <button onClick={handleSubmit}
            className="w-full bg-[#c8f55a] text-black font-semibold py-3 rounded-xl text-sm hover:bg-[#d4ff66] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#c8f55a]/30">
            Create Account →
          </button>

          <p className="text-center text-gray-500 text-sm">
            Have an account?{' '}
            <Link to="/login" className="text-[#c8f55a] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}