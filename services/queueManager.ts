// Queue Management Service
// Handles wait time calculations and queue operations for astrologer sessions

export interface QueueEntry {
    requestId: string;
    userId: string;
    userName: string;
    astrologerId: string;
    type: 'chat' | 'call';
    category: 'love' | 'career' | 'money' | 'family' | 'business';
    requestedAt: number;
    estimatedDuration: number; // minutes
    ratePerMin: number;
}

export interface AstrologerQueue {
    astrologerId: string;
    activeSession: QueueEntry | null;
    pendingRequests: QueueEntry[];
}

// Average session duration in minutes
const AVG_SESSION_DURATION = 7;

class QueueManager {
    private queues: Map<string, AstrologerQueue> = new Map();

    /**
     * Initialize queue for an astrologer
     */
    initQueue(astrologerId: string): void {
        if (!this.queues.has(astrologerId)) {
            this.queues.set(astrologerId, {
                astrologerId,
                activeSession: null,
                pendingRequests: []
            });
        }
    }

    /**
     * Add a request to the queue
     */
    addToQueue(entry: QueueEntry): void {
        this.initQueue(entry.astrologerId);
        const queue = this.queues.get(entry.astrologerId)!;

        // Check if request already exists
        const exists = queue.pendingRequests.some(req => req.requestId === entry.requestId);
        if (exists) return;

        // Add to pending requests and sort by requestedAt (FIFO)
        queue.pendingRequests.push(entry);
        queue.pendingRequests.sort((a, b) => a.requestedAt - b.requestedAt);
    }

    /**
     * Remove a request from the queue
     */
    removeFromQueue(astrologerId: string, requestId: string): void {
        const queue = this.queues.get(astrologerId);
        if (!queue) return;

        queue.pendingRequests = queue.pendingRequests.filter(
            req => req.requestId !== requestId
        );
    }

    /**
     * Accept a request and move it to active session
     */
    acceptRequest(astrologerId: string, requestId: string): QueueEntry | null {
        const queue = this.queues.get(astrologerId);
        if (!queue) return null;

        const requestIndex = queue.pendingRequests.findIndex(
            req => req.requestId === requestId
        );

        if (requestIndex === -1) return null;

        const [acceptedRequest] = queue.pendingRequests.splice(requestIndex, 1);
        queue.activeSession = acceptedRequest;

        return acceptedRequest;
    }

    /**
     * End the active session
     */
    endSession(astrologerId: string): void {
        const queue = this.queues.get(astrologerId);
        if (queue) {
            queue.activeSession = null;
        }
    }

    /**
     * Get queue position for a specific user (1-indexed)
     */
    getQueuePosition(astrologerId: string, userId: string): number {
        const queue = this.queues.get(astrologerId);
        if (!queue) return -1;

        const index = queue.pendingRequests.findIndex(req => req.userId === userId);
        return index === -1 ? -1 : index + 1; // 1-indexed position
    }

    /**
     * Get estimated wait time for a user in minutes
     */
    getEstimatedWaitTime(astrologerId: string, userId?: string): number {
        const queue = this.queues.get(astrologerId);
        if (!queue) return 0;

        let waitTime = 0;

        // If there's an active session, add its remaining time
        if (queue.activeSession) {
            waitTime += queue.activeSession.estimatedDuration || AVG_SESSION_DURATION;
        }

        // If userId is provided, calculate wait time for that specific user
        if (userId) {
            const position = this.getQueuePosition(astrologerId, userId);
            if (position === -1) return 0;

            // Add time for all users ahead in queue
            for (let i = 0; i < position - 1; i++) {
                waitTime += queue.pendingRequests[i].estimatedDuration || AVG_SESSION_DURATION;
            }
        } else {
            // Calculate total wait time for next user
            if (queue.pendingRequests.length > 0) {
                waitTime += queue.pendingRequests[0].estimatedDuration || AVG_SESSION_DURATION;
            }
        }

        return waitTime;
    }

    /**
     * Get queue length (pending requests only)
     */
    getQueueLength(astrologerId: string): number {
        const queue = this.queues.get(astrologerId);
        return queue ? queue.pendingRequests.length : 0;
    }

    /**
     * Get all pending requests for an astrologer (ordered by time)
     */
    getPendingRequests(astrologerId: string): QueueEntry[] {
        const queue = this.queues.get(astrologerId);
        return queue ? [...queue.pendingRequests] : [];
    }

    /**
     * Get active session for an astrologer
     */
    getActiveSession(astrologerId: string): QueueEntry | null {
        const queue = this.queues.get(astrologerId);
        return queue ? queue.activeSession : null;
    }

    /**
     * Check if astrologer is available (no active session)
     */
    isAvailable(astrologerId: string): boolean {
        const queue = this.queues.get(astrologerId);
        return queue ? queue.activeSession === null : true;
    }

    /**
     * Get formatted wait time string
     */
    getWaitTimeString(astrologerId: string, userId?: string): string {
        const waitTime = this.getEstimatedWaitTime(astrologerId, userId);

        if (waitTime === 0) {
            return 'Available Now';
        } else if (waitTime < 60) {
            return `~${waitTime} min wait`;
        } else {
            const hours = Math.floor(waitTime / 60);
            const mins = waitTime % 60;
            return mins > 0 ? `~${hours}h ${mins}m wait` : `~${hours}h wait`;
        }
    }

    /**
     * Get all queues (for debugging)
     */
    getAllQueues(): Map<string, AstrologerQueue> {
        return this.queues;
    }

    /**
     * Clear all queues (for testing)
     */
    clearAllQueues(): void {
        this.queues.clear();
    }
}

// Export singleton instance
export const queueManager = new QueueManager();
export default queueManager;
