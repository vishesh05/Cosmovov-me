
import React from 'react';
import { Icons } from '../Icons';
import { ChatSession } from '../../types';
import { groupSessionsByDate } from '../../services/chatStorage';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession: (session: ChatSession, e: React.MouseEvent) => void;
  editingSessionId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  onSaveRename: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen, onClose, sessions, currentSessionId, onSelectSession, onNewChat,
  onDeleteSession, onRenameSession, editingSessionId, editTitle, setEditTitle, onSaveRename,
  isDarkMode, toggleDarkMode
}) => {
  const sessionGroups = groupSessionsByDate(sessions);

  // Subtle Dark Mode Palette
  const darkBg = 'bg-[#1c1b19]'; // Surface
  const darkBorder = 'border-[#33312e]';
  const darkText = 'text-[#e6e4df]';
  const darkTextMuted = 'text-[#a8a6a1]';
  const darkHover = 'hover:bg-[#2a2826]';
  const darkActive = 'bg-[#2a2826]';

  return (
    <>
      {isOpen && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        ></div>
      )}

      <div className={`absolute top-0 left-0 bottom-0 w-4/5 max-w-[300px] z-50 transform transition-all duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'} ${isDarkMode ? `${darkBg} border-r ${darkBorder}` : 'bg-white'}`}>
        <div className="flex flex-col h-full bg-noise">
          <div className={`p-6 border-b ${isDarkMode ? darkBorder : 'border-stone-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-serif text-xl ${isDarkMode ? darkText : 'text-charcoal-900'}`}>History</h2>
              <button onClick={onClose} className={isDarkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-charcoal-900'}><Icons.X /></button>
            </div>
            <button
              onClick={onNewChat}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl shadow-lg font-medium text-sm transition-all ${isDarkMode ? 'bg-[#332b1e] text-[#e0c080] hover:bg-[#3d3423] border border-[#4d402b]' : 'bg-charcoal-900 text-gold-400 hover:bg-black shadow-charcoal-900/10'}`}
            >
              <Icons.Plus /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
            {Object.entries(sessionGroups).map(([group, groupSessions]) => groupSessions.length > 0 && (
              <div key={group}>
                <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 pl-2 ${isDarkMode ? 'text-[#666460]' : 'text-stone-400'}`}>{group}</h3>
                <div className="space-y-2">
                  {groupSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => { onSelectSession(session.id); onClose(); }}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${currentSessionId === session.id
                        ? isDarkMode ? `${darkActive} ${darkBorder} shadow-sm` : 'bg-gold-50 border border-gold-100 shadow-sm'
                        : 'border-transparent ' + (isDarkMode ? darkHover : 'hover:bg-stone-50')
                        }`}
                    >
                      <div className={`opacity-60 ${currentSessionId === session.id ? 'opacity-100' : ''} ${isDarkMode ? 'text-[#c5a059]' : 'text-gold-500'}`}>
                        <Icons.Message />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingSessionId === session.id ? (
                          <input
                            autoFocus
                            className={`w-full outline-none px-2 py-1 rounded text-sm font-medium ${isDarkMode ? 'bg-[#2a2826] text-white border-[#444]' : 'bg-white border-gold-200 text-charcoal-900 border'}`}
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onBlur={onSaveRename}
                            onKeyDown={e => e.key === 'Enter' && onSaveRename()}
                          />
                        ) : (
                          <>
                            <p className={`text-sm truncate font-medium ${isDarkMode ? (currentSessionId === session.id ? darkText : darkTextMuted) : (currentSessionId === session.id ? 'text-charcoal-900' : 'text-charcoal-600')}`}>
                              {session.title || 'New Conversation'}
                            </p>
                            <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-[#666460]' : 'text-stone-500'}`}>
                              {new Date(session.lastModified).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                            </p>
                          </>
                        )}
                      </div>

                      <div className={`flex gap-1 transition-opacity ${currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button onClick={(e) => onRenameSession(session, e)} className={`p-1 ${isDarkMode ? 'text-stone-500 hover:text-[#e0c080]' : 'text-stone-300 hover:text-gold-500'}`}><Icons.Edit /></button>
                        <button onClick={(e) => onDeleteSession(session.id, e)} className={`p-1 ${isDarkMode ? 'text-stone-500 hover:text-red-400' : 'text-stone-300 hover:text-red-400'}`}><Icons.Trash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Settings Section */}
          <div className={`p-4 border-t ${isDarkMode ? darkBorder : 'border-stone-100'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 pl-2 ${isDarkMode ? 'text-[#666460]' : 'text-stone-500'}`}>Settings</div>
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-95 ${isDarkMode ? `${darkActive} hover:bg-[#33312e]` : 'bg-stone-50 hover:bg-stone-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`${isDarkMode ? 'text-[#e0c080]' : 'text-charcoal-600'}`}>
                  {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? darkText : 'text-charcoal-900'}`}>Dark Mode</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#c5a059]' : 'bg-stone-300'}`}>
                <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isDarkMode ? 'left-[18px]' : 'left-0.5'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
