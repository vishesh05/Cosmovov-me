import { ChatSession, ChatMessage, UserProfile } from '../types';

export const getStorageKey = (profile: UserProfile) => `astroveda_chat_sessions_${profile.name}_${profile.date}`;
export const getLastActiveKey = (profile: UserProfile) => `astroveda_last_session_id_${profile.name}_${profile.date}`;

export const getSessions = (profile: UserProfile): ChatSession[] => {
  try {
    const data = localStorage.getItem(getStorageKey(profile));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSession = (session: ChatSession, profile: UserProfile) => {
  const sessions = getSessions(profile);
  const index = sessions.findIndex(s => s.id === session.id);
  
  // Auto-generate title if it's default and we have messages
  if ((session.title === 'New Conversation' || !session.title) && session.messages.length > 0) {
    const firstMsg = session.messages[0].text;
    session.title = firstMsg.length > 30 ? firstMsg.substring(0, 30) + '...' : firstMsg;
  }

  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(getStorageKey(profile), JSON.stringify(sessions));
  localStorage.setItem(getLastActiveKey(profile), session.id);
};

export const updateSessionTitle = (sessionId: string, newTitle: string, profile: UserProfile) => {
  const sessions = getSessions(profile);
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index >= 0) {
    sessions[index].title = newTitle;
    sessions[index].lastModified = Date.now();
    localStorage.setItem(getStorageKey(profile), JSON.stringify(sessions));
  }
};

export const deleteSession = (sessionId: string, profile: UserProfile) => {
  const sessions = getSessions(profile).filter(s => s.id !== sessionId);
  localStorage.setItem(getStorageKey(profile), JSON.stringify(sessions));
  if (localStorage.getItem(getLastActiveKey(profile)) === sessionId) {
    localStorage.removeItem(getLastActiveKey(profile));
  }
  return sessions;
};

export const getLastActiveSessionId = (profile: UserProfile): string | null => {
  return localStorage.getItem(getLastActiveKey(profile));
};

export const createNewSession = (): ChatSession => {
  return {
    id: Date.now().toString(),
    title: 'New Conversation',
    messages: [],
    lastModified: Date.now()
  };
};

export const groupSessionsByDate = (sessions: ChatSession[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const groups = {
    Today: [] as ChatSession[],
    Yesterday: [] as ChatSession[],
    'Last 7 Days': [] as ChatSession[],
    Older: [] as ChatSession[]
  };

  sessions.sort((a, b) => b.lastModified - a.lastModified).forEach(session => {
    const date = new Date(session.lastModified);
    if (date >= today) {
      groups.Today.push(session);
    } else if (date >= yesterday) {
      groups.Yesterday.push(session);
    } else if (date >= last7Days) {
      groups['Last 7 Days'].push(session);
    } else {
      groups.Older.push(session);
    }
  });

  return groups;
};
