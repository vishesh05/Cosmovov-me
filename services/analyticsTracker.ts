/**
 * Analytics Event Tracker
 * 
 * Lightweight client-side SDK to track user events and send them to Supabase.
 * Import this anywhere in the app and call trackEvent() to log structured analytics.
 */
import { supabase } from './supabase';

// Generate a unique session ID per app load
const SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get or create a persistent anonymous user ID for guests
function getAnonymousId(): string {
    const key = 'astroveda_anon_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(key, id);
    }
    return id;
}

// Get current user ID (from auth or anonymous)
function getUserId(): string {
    try {
        const authStr = localStorage.getItem('astroveda_auth_state');
        if (authStr) {
            const auth = JSON.parse(authStr);
            if (auth.isLoggedIn && auth.email) return auth.email;
        }
    } catch { /* ignore */ }
    return getAnonymousId();
}

/**
 * Track an analytics event
 */
export async function trackEvent(
    eventType: string,
    eventData: Record<string, any> = {},
    deviceType: string = 'web'
): Promise<void> {
    try {
        await supabase.from('analytics_events').insert({
            user_id: getUserId(),
            event_type: eventType,
            event_data: eventData,
            session_id: SESSION_ID,
            device_type: deviceType,
        });
    } catch (err) {
        // Silently fail — analytics should never break the app
        console.warn('[Analytics] Failed to track event:', err);
    }
}

/**
 * Track a page view
 */
export function trackPageView(pageName: string) {
    trackEvent('page_view', { page: pageName });
}

/**
 * Track a chat message (with token counts for cost estimation)
 */
export function trackChatMessage(inputTokens: number, outputTokens: number, topic?: string) {
    trackEvent('chat_message', {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        topic: topic || 'general'
    });
}

/**
 * Track tool usage
 */
export function trackToolUse(toolName: string) {
    trackEvent('tool_use', { tool: toolName });
}

/**
 * Track report view
 */
export function trackReportView(reportType: string) {
    trackEvent('report_view', { report: reportType });
}

/**
 * Heartbeat: update live presence for realtime online counter
 */
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function startPresenceHeartbeat(currentPage?: string) {
    // Send an initial heartbeat immediately
    sendHeartbeat(currentPage);

    // Then send every 60 seconds
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => sendHeartbeat(currentPage), 60000);
}

export function stopPresenceHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    // Mark offline
    supabase.rpc('heartbeat_presence', {
        p_user_id: getUserId(),
        p_current_page: null,
        p_device_type: 'web'
    }).then(() => {
        // Mark as offline by setting last_seen far in past (cleanup function handles it)
    });
}

async function sendHeartbeat(currentPage?: string) {
    try {
        await supabase.rpc('heartbeat_presence', {
            p_user_id: getUserId(),
            p_current_page: currentPage || 'unknown',
            p_device_type: 'web'
        });
    } catch {
        // Silently fail
    }
}

/**
 * Track a complete chat session with aggregated metrics
 */
export async function trackChatSession(data: {
    messageCount: number;
    inputTokens: number;
    outputTokens: number;
    topicCategory?: string;
    userRating?: number;
    responseTimeMs?: number;
}): Promise<void> {
    try {
        await supabase.from('chat_analytics').insert({
            user_id: getUserId(),
            session_id: SESSION_ID,
            message_count: data.messageCount,
            input_tokens: data.inputTokens,
            output_tokens: data.outputTokens,
            cost_usd: ((data.inputTokens * 0.000001) + (data.outputTokens * 0.000002)), // Approximate Gemini pricing
            topic_category: data.topicCategory || 'general',
            user_rating: data.userRating,
            response_time_ms: data.responseTimeMs
        });
    } catch (err) {
        console.warn('[Analytics] Failed to track chat session:', err);
    }
}
