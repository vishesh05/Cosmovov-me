
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { InputField } from '../UI';
import { UserTransaction, getUserWalletBalance, addUserMoney, getUserTransactions } from '../../services/userRepository';
import { getSavedCharts, saveNewChart, deleteSavedChart, SavedChart } from '../../services/chartRepository';
import { supabase } from '../../services/supabase';
import { UserProfile } from '../../types';
import { getCitySuggestions } from '../../services/geminiService';
import { useTheme } from '../../contexts/ThemeContext';


// --- Shared Header ---
const SubPageHeader: React.FC<{ title: string; onBack: () => void; action?: React.ReactNode }> = ({ title, onBack, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-charcoal-900 transition-colors active:scale-90">
        <Icons.ChevronLeft />
      </button>
      <h2 className="text-xl font-serif text-charcoal-900">{title}</h2>
    </div>
    {action}
  </div>
);

// --- 1. Edit Profile View ---
export const EditProfileView: React.FC<{ user: UserProfile; onBack: () => void; onSave: (p: UserProfile) => void }> = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState(user);

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <SubPageHeader title="Edit Personal Info" onBack={onBack} />
      <div className="space-y-4 flex-1">
        <InputField
          label="Full Name"
          icon={<Icons.Users />}
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />

        {/* Gender Selection */}
        <div className="group">
          <label className="block text-[10px] uppercase tracking-widest text-charcoal-800/50 mb-2 pl-1 font-serif">Gender</label>
          <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3.5 transition-all group-focus-within:border-gold-400 group-focus-within:shadow-[0_4px_20px_-4px_rgba(212,175,55,0.15)]">
            <span className="text-gold-500 opacity-70"><div className="scale-90"><Icons.Users /></div></span>
            <select
              className="flex-1 bg-transparent outline-none text-charcoal-900 font-medium text-sm appearance-none"
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="text-stone-300 pointer-events-none">
              <Icons.ChevronRight className="rotate-90 w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date of Birth"
            icon={<Icons.Calendar />}
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
          <InputField
            label="Time of Birth"
            icon={<Icons.Clock />}
            type="time"
            value={formData.time}
            onChange={e => setFormData({ ...formData, time: e.target.value })}
          />
        </div>

        <InputField
          label="Place of Birth"
          icon={<Icons.MapPin />}
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
        />
      </div>
      <button onClick={() => onSave(formData)} className="w-full bg-charcoal-900 text-gold-400 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">Save Changes</button>
    </div>
  );
};

// --- 2. Auth Settings View ---
export const AuthSettingsView: React.FC<{ email?: string; onBack: () => void }> = ({ email, onBack }) => {
  const [editingField, setEditingField] = useState<'email' | 'phone' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({ email: email || '', phone: '', password: '' });

  const handleUpdate = async () => {
    if (!editingField) return;
    setLoading(true);
    setMessage(null);

    try {
      let updatePayload: any = {};
      if (editingField === 'email') updatePayload.email = formData.email;
      if (editingField === 'phone') updatePayload.phone = formData.phone;
      if (editingField === 'password') updatePayload.password = formData.password;

      // Note: for email changes, Supabase requires both new and old email verification links 
      // to be clicked before the email actually updates, unless configured otherwise.
      const { error } = await supabase.auth.updateUser(updatePayload);

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: editingField === 'email'
            ? 'Verification links sent to both old and new emails.'
            : 'Successfully updated.'
        });
        if (editingField !== 'email') {
          setTimeout(() => setEditingField(null), 2000);
        }
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in overflow-y-auto no-scrollbar pb-20">
      <SubPageHeader title="Login & Security" onBack={onBack} />

      {message && (
        <div className={`p-4 rounded-xl mb-4 text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* EMAIL */}
        <div className={`bg-white p-4 rounded-2xl border transition-all ${editingField === 'email' ? 'border-gold-300 shadow-md ring-4 ring-gold-50/50' : 'border-stone-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email Address</span>
            {!editingField && <span className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded">Verified</span>}
          </div>

          {editingField === 'email' ? (
            <div className="mt-4 space-y-3 animate-fade-in">
              <input
                type="email"
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-charcoal-900 font-medium text-sm outline-none focus:border-gold-400 transition-colors"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="New Email Address"
              />
              <div className="flex gap-2">
                <button onClick={handleUpdate} disabled={loading} className="flex-1 bg-charcoal-900 text-gold-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md active:scale-95 transition-all disabled:opacity-50">{loading ? 'Updating...' : 'Save Email'}</button>
                <button onClick={() => { setEditingField(null); setMessage(null); }} className="px-4 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-charcoal-900 font-medium">{email || 'Not set'}</p>
              <button onClick={() => setEditingField('email')} className="mt-3 text-xs text-gold-600 font-bold uppercase tracking-wide hover:underline">Change Email</button>
            </>
          )}
        </div>

        {/* PHONE NUMBER */}
        <div className={`bg-white p-4 rounded-2xl border transition-all ${editingField === 'phone' ? 'border-gold-300 shadow-md ring-4 ring-gold-50/50' : 'border-stone-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Phone Number</span>
          </div>

          {editingField === 'phone' ? (
            <div className="mt-4 space-y-3 animate-fade-in">
              <input
                type="tel"
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-charcoal-900 font-medium text-sm outline-none focus:border-gold-400 transition-colors"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91..."
              />
              <div className="flex gap-2">
                <button onClick={handleUpdate} disabled={loading} className="flex-1 bg-charcoal-900 text-gold-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md active:scale-95 transition-all disabled:opacity-50">{loading ? 'Updating...' : 'Save Phone'}</button>
                <button onClick={() => { setEditingField(null); setMessage(null); }} className="px-4 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-charcoal-900 font-medium">+91 98*** **210</p>
              <button onClick={() => setEditingField('phone')} className="mt-3 text-xs text-gold-600 font-bold uppercase tracking-wide hover:underline">Update Phone</button>
            </>
          )}
        </div>

        {/* PASSWORD */}
        <div className={`bg-white p-4 rounded-2xl border transition-all ${editingField === 'password' ? 'border-gold-300 shadow-md ring-4 ring-gold-50/50' : 'border-stone-100 shadow-sm'}`}>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">Password</span>

          {editingField === 'password' ? (
            <div className="mt-4 space-y-3 animate-fade-in">
              <input
                type="password"
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-charcoal-900 font-medium text-sm outline-none focus:border-gold-400 transition-colors"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="New Password"
              />
              <div className="flex gap-2">
                <button onClick={handleUpdate} disabled={loading} className="flex-1 bg-charcoal-900 text-gold-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md active:scale-95 transition-all disabled:opacity-50">{loading ? 'Updating...' : 'Save Password'}</button>
                <button onClick={() => { setEditingField(null); setMessage(null); }} className="px-4 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-charcoal-900 font-medium text-lg tracking-widest">••••••••</p>
              <button onClick={() => setEditingField('password')} className="mt-3 text-xs text-gold-600 font-bold uppercase tracking-wide hover:underline">Reset Password</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 3. Transactions View ---
export const TransactionsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const transactions = getUserTransactions();

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in overflow-hidden">
      <SubPageHeader title="Transaction History" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar -mx-6 px-6">
        {transactions.map(txn => (
          <div key={txn.id} className="bg-white p-4 rounded-2xl border border-stone-100 mb-3 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-charcoal-900 text-sm">{txn.title}</h4>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">{txn.id}</p>
              </div>
              <div className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-charcoal-900'}`}>
                {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-500 mt-3 pt-3 border-t border-stone-50">
              {txn.details?.duration && <div>Duration: <span className="text-charcoal-800 font-medium">{txn.details.duration}</span></div>}
              {txn.details?.rate && <div>Rate: <span className="text-charcoal-800 font-medium">{txn.details.rate}</span></div>}
              <div>Date: <span className="text-charcoal-800 font-medium">{new Date(txn.date).toLocaleDateString()}</span></div>
              <div className="text-right">Status: <span className="text-green-600 font-bold uppercase">{txn.status}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 4. Wallet & Add Money View ---
export const WalletView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [view, setView] = useState<'BALANCE' | 'ADD'>('BALANCE');
  const [balance, setBalance] = useState(getUserWalletBalance());
  const [amount, setAmount] = useState('');

  const handleAddMoney = () => {
    if (!amount) return;
    const newBal = addUserMoney(parseInt(amount));
    setBalance(newBal);
    setAmount('');
    setView('BALANCE');
  };

  if (view === 'ADD') {
    return (
      <div className="p-6 h-full flex flex-col animate-fade-in">
        <SubPageHeader title="Add Money" onBack={() => setView('BALANCE')} />
        <div className="space-y-6 flex-1">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Enter Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif text-charcoal-900">₹</span>
              <input
                type="number"
                autoFocus
                className="bg-transparent text-3xl font-bold text-charcoal-900 outline-none w-full placeholder-stone-300"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {['UPI', 'Net Banking', 'Debit Card', 'Credit Card'].map(m => (
                <button key={m} className="p-4 bg-white border border-stone-100 rounded-xl text-left hover:border-gold-300 hover:shadow-md transition-all group">
                  <span className="text-xs font-bold text-charcoal-800 group-hover:text-gold-600">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleAddMoney} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 active:scale-95 transition-all">
          Proceed to Pay ₹{amount || '0'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <SubPageHeader title="My Wallet" onBack={onBack} />

      <div className="bg-charcoal-900 text-ivory-50 p-6 rounded-[32px] shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block mb-1">Available Balance</span>
        <div className="text-4xl font-serif mb-6">₹{balance.toFixed(2)}</div>
        <button onClick={() => setView('ADD')} className="w-full bg-white text-charcoal-900 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Icons.Plus className="w-4 h-4" /> Add Money
        </button>
      </div>

      <div>
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Recent Top-ups</h3>
        <div className="space-y-3">
          {getUserTransactions().filter(t => t.type === 'credit').slice(0, 3).map(t => (
            <div key={t.id} className="flex justify-between items-center py-3 border-b border-stone-50">
              <div>
                <div className="text-xs font-bold text-charcoal-900">{t.title}</div>
                <div className="text-[9px] text-stone-400">{new Date(t.date).toLocaleDateString()}</div>
              </div>
              <div className="text-green-600 font-bold text-xs">+₹{t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 5. Saved Charts View ---
export const SavedChartsView: React.FC<{ onBack: () => void; onLoadProfile: (p: UserProfile) => void; onRevertToOwnChart: () => void }> = ({ onBack, onLoadProfile, onRevertToOwnChart }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(false);
  const [newChart, setNewChart] = useState<Partial<SavedChart>>({ gender: 'male', time: '12:00', relation: 'Friend' });

  // Fetch charts on load
  useEffect(() => {
    const fetchCharts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setLoading(true);
        const data = await getSavedCharts(session.user.id);
        setCharts(data);
        setLoading(false);
      }
    };
    fetchCharts();
  }, []);

  // Location Autocomplete State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<any>(null);

  const handleSave = async () => {
    if (newChart.name && newChart.date && newChart.location) {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await saveNewChart(session.user.id, newChart as any);
          // Refresh
          const data = await getSavedCharts(session.user.id);
          setCharts(data);
          setView('LIST');
          setNewChart({ gender: 'male', time: '12:00', relation: 'Friend' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chart?')) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await deleteSavedChart(id);
        const data = await getSavedCharts(session.user.id);
        setCharts(data);
        // If no charts remain, revert to user's own chart
        if (data.length === 0) {
          onRevertToOwnChart();
        }
      }
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewChart(prev => ({ ...prev, location: val }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length >= 3) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await getCitySuggestions(val);
          if (results?.length) {
            setSuggestions(results);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        } catch (err) {
          console.error(err);
          setShowSuggestions(false);
        }
      }, 500);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (loc: string) => {
    setNewChart(prev => ({ ...prev, location: loc }));
    setShowSuggestions(false);
  };

  if (view === 'CREATE') {
    return (
      <div className="p-6 h-full flex flex-col animate-fade-in overflow-y-auto no-scrollbar">
        <SubPageHeader title="Create New Chart" onBack={() => setView('LIST')} />
        <div className="space-y-4 flex-1">
          <InputField label="Name" icon={<Icons.Users />} value={newChart.name || ''} onChange={e => setNewChart({ ...newChart, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Gender</label>
              <select className="w-full bg-white border border-stone-200 p-3.5 rounded-xl text-sm font-medium outline-none" value={newChart.gender} onChange={e => setNewChart({ ...newChart, gender: e.target.value as any })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <InputField label="Relation" icon={<Icons.Heart />} value={newChart.relation || ''} onChange={e => setNewChart({ ...newChart, relation: e.target.value })} placeholder="e.g. Brother" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Date of Birth" icon={<Icons.Calendar />} type="date" value={newChart.date || ''} onChange={e => setNewChart({ ...newChart, date: e.target.value })} />
            <InputField label="Time" icon={<Icons.Clock />} type="time" value={newChart.time || ''} onChange={e => setNewChart({ ...newChart, time: e.target.value })} />
          </div>

          <div className="relative">
            <InputField
              label="Place of Birth"
              icon={<Icons.MapPin />}
              value={newChart.location || ''}
              onChange={handleLocationChange}
              placeholder="City, Country"
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-stone-100 rounded-xl mt-2 shadow-2xl py-2 max-h-48 overflow-y-auto no-scrollbar left-0">
                {suggestions.map((city, idx) => (
                  <li key={idx} onClick={() => selectLocation(city)}
                    className="px-4 py-3 text-charcoal-800 hover:bg-gold-50 cursor-pointer text-sm border-b border-stone-50 last:border-none flex items-center gap-2">
                    <span className="text-gold-400"><Icons.MapPin /></span>
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <InputField label="Email (Optional)" icon={<div className="text-xs font-bold">@</div>} value={newChart.email || ''} onChange={e => setNewChart({ ...newChart, email: e.target.value })} />
        </div>
        <button onClick={handleSave} className="w-full bg-charcoal-900 text-gold-400 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Save Chart</button>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in relative">
      <SubPageHeader title="Saved Charts" onBack={onBack} />

      <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-20">
        {loading ? <div className="text-center p-4 text-xs text-stone-400">Loading charts...</div> : charts.length === 0 ? (
          <div className="text-center p-8 text-stone-300">
            <Icons.History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs uppercase tracking-widest">No saved charts</p>
          </div>
        ) : charts.map(chart => (
          <div
            key={chart.id}
            onClick={() => onLoadProfile(chart)}
            className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 font-serif font-bold text-lg">
                {chart.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-charcoal-900 text-sm">{chart.name}</h4>
                <p className="text-[10px] text-stone-400">{chart.relation || 'Profile'} • {chart.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => handleDelete(chart.id, e)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                <Icons.Trash className="w-4 h-4" />
              </button>
              <button className="p-2 text-gold-500">
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setView('CREATE')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-gold-500 text-white rounded-full shadow-xl shadow-gold-500/30 flex items-center justify-center active:scale-90 transition-all"
      >
        <Icons.Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- 6. Notifications View (NEW) ---
export const NotificationsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    if (type === 'transit') return <Icons.Activity className="w-4 h-4" />;
    if (type === 'daily') return <Icons.Sun className="w-4 h-4" />;
    if (type === 'promo') return <div className="font-bold text-xs">%</div>;
    return <Icons.Sparkles className="w-4 h-4" />;
  };

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <SubPageHeader
        title="Notifications"
        onBack={onBack}
        action={<button onClick={markAllRead} className="text-[10px] font-bold text-gold-600 uppercase tracking-widest hover:underline">Mark all read</button>}
      />

      <div className="space-y-3 overflow-y-auto no-scrollbar pb-20">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-stone-100' : 'bg-gold-50/20 border-gold-100 shadow-sm'}`}>
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'transit' ? 'bg-purple-50 text-purple-500' : n.type === 'daily' ? 'bg-orange-50 text-orange-500' : n.type === 'promo' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500'}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-bold ${n.read ? 'text-charcoal-800' : 'text-charcoal-900'}`}>{n.title}</h4>
                  <span className="text-[9px] text-stone-400 whitespace-nowrap ml-2">{n.time}</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">{n.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 7. Preferences View (Rebuilt) ---
export const PreferencesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isDark, toggleTheme } = useTheme();

  // Load saved preferences from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('astroveda_preferences');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      chartStyle: 'North Indian',
      language: 'English',
      dailyHoroscope: true,
      transitAlerts: true,
      powerHourAlerts: false,
      soundEffects: true
    };
  });

  // Persist settings on every change
  useEffect(() => {
    localStorage.setItem('astroveda_preferences', JSON.stringify(settings));
  }, [settings]);

  // Calculate approximate localStorage usage
  const getCacheSize = () => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += localStorage.getItem(key)?.length || 0;
        }
      }
      return (total / 1024).toFixed(1);
    } catch { return '0'; }
  };

  const [cacheSize, setCacheSize] = useState(getCacheSize());
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    const keysToKeep = ['astroveda_auth_state', 'astroveda_theme', 'astroveda_preferences'];
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setCacheSize(getCacheSize());
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${active ? 'bg-gold-500' : isDark ? 'bg-[#33312e]' : 'bg-stone-200'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${active ? 'translate-x-5' : ''}`} />
    </button>
  );

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 pl-1 ${isDark ? 'text-[#666460]' : 'text-stone-400'}`}>{children}</h3>
  );

  const SettingCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1c1b19] border-[#33312e]' : 'bg-white border-stone-100'}`}>
      {children}
    </div>
  );

  const SettingRow: React.FC<{ children: React.ReactNode; last?: boolean }> = ({ children, last }) => (
    <div className={`p-4 flex justify-between items-center ${!last ? (isDark ? 'border-b border-[#2a2826]' : 'border-b border-stone-50') : ''}`}>
      {children}
    </div>
  );

  return (
    <div className={`p-6 h-full flex flex-col animate-fade-in overflow-y-auto no-scrollbar pb-20 ${isDark ? 'bg-[#141413]' : ''}`}>
      <SubPageHeader title="Preferences" onBack={onBack} />

      <div className="space-y-8">
        {/* Appearance */}
        <div>
          <SectionTitle>Appearance</SectionTitle>
          <SettingCard>
            {/* Dark Mode */}
            <SettingRow>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#332b1e] text-[#c5a059]' : 'bg-stone-50 text-stone-400'}`}>
                  {isDark ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
                </div>
                <div>
                  <span className={`text-sm font-bold ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-900'}`}>Dark Mode</span>
                  <p className={`text-[10px] ${isDark ? 'text-[#666460]' : 'text-stone-400'}`}>{isDark ? 'On — Cosmic theme' : 'Off — Light theme'}</p>
                </div>
              </div>
              <Toggle active={isDark} onToggle={toggleTheme} />
            </SettingRow>

            {/* Chart Style */}
            <SettingRow last>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#2a2826] text-[#a8a6a1]' : 'bg-stone-50 text-stone-400'}`}>
                  <Icons.Grid className="w-4 h-4" />
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-900'}`}>Chart Style</span>
              </div>
              <select
                className={`text-xs font-bold py-2 px-3 rounded-lg outline-none border-none text-right ${isDark ? 'bg-[#2a2826] text-[#e6e4df]' : 'bg-stone-50 text-charcoal-700'}`}
                value={settings.chartStyle}
                onChange={e => setSettings({ ...settings, chartStyle: e.target.value })}
              >
                <option>North Indian</option>
                <option>South Indian</option>
              </select>
            </SettingRow>
          </SettingCard>
        </div>

        {/* Notifications */}
        <div>
          <SectionTitle>Notifications</SectionTitle>
          <SettingCard>
            <SettingRow>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#2a2826] text-[#a8a6a1]' : 'bg-stone-50 text-stone-400'}`}>
                  <Icons.Sun className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-800'}`}>Daily Horoscope</span>
              </div>
              <Toggle active={settings.dailyHoroscope} onToggle={() => setSettings({ ...settings, dailyHoroscope: !settings.dailyHoroscope })} />
            </SettingRow>
            <SettingRow>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#2a2826] text-[#a8a6a1]' : 'bg-stone-50 text-stone-400'}`}>
                  <Icons.Activity className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-800'}`}>Major Transits & Alerts</span>
              </div>
              <Toggle active={settings.transitAlerts} onToggle={() => setSettings({ ...settings, transitAlerts: !settings.transitAlerts })} />
            </SettingRow>
            <SettingRow last>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#2a2826] text-[#a8a6a1]' : 'bg-stone-50 text-stone-400'}`}>
                  <Icons.Sparkles className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-800'}`}>Power Hour Reminders</span>
              </div>
              <Toggle active={settings.powerHourAlerts} onToggle={() => setSettings({ ...settings, powerHourAlerts: !settings.powerHourAlerts })} />
            </SettingRow>
          </SettingCard>
        </div>

        {/* Data & Storage */}
        <div>
          <SectionTitle>Data & Storage</SectionTitle>
          <SettingCard>
            <SettingRow>
              <div>
                <span className={`text-sm font-bold block ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-900'}`}>Cached Data</span>
                <span className={`text-[10px] ${isDark ? 'text-[#666460]' : 'text-stone-400'}`}>{cacheSize} KB used</span>
              </div>
              <button
                onClick={handleClearCache}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                  cacheCleared
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : isDark
                      ? 'bg-[#2a2826] text-[#a8a6a1] hover:text-red-400 border border-[#33312e]'
                      : 'bg-stone-50 text-stone-500 hover:text-red-500 border border-stone-200'
                }`}
              >
                {cacheCleared ? '✓ Cleared' : 'Clear Cache'}
              </button>
            </SettingRow>
            <SettingRow last>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#2a2826] text-[#a8a6a1]' : 'bg-stone-50 text-stone-400'}`}>
                  <Icons.Wand className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-[#e6e4df]' : 'text-charcoal-800'}`}>Sound Effects</span>
              </div>
              <Toggle active={settings.soundEffects} onToggle={() => setSettings({ ...settings, soundEffects: !settings.soundEffects })} />
            </SettingRow>
          </SettingCard>
        </div>

        {/* About */}
        <div>
          <SectionTitle>About</SectionTitle>
          <SettingCard>
            <button className={`w-full p-4 text-left text-xs font-bold transition-colors ${isDark ? 'text-[#a8a6a1] hover:bg-[#2a2826] border-b border-[#2a2826]' : 'text-charcoal-700 border-b border-stone-50 hover:bg-stone-50'}`}>Terms of Service</button>
            <button className={`w-full p-4 text-left text-xs font-bold transition-colors ${isDark ? 'text-[#a8a6a1] hover:bg-[#2a2826] border-b border-[#2a2826]' : 'text-charcoal-700 border-b border-stone-50 hover:bg-stone-50'}`}>Privacy Policy</button>
            <div className="p-4 text-center">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#444240]' : 'text-stone-300'}`}>CosmoVoc v2.5.0</p>
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
};
