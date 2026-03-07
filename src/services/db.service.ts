import { StudentProfile } from '../types/quest';

type SyncCallback = () => void;

// Base API URL respects the current origin to support both local dev and production
const API_BASE = '/api/profiles';

class DatabaseService {
    private listeners: SyncCallback[] = [];

    constructor() {
        // We can no longer rely on 'storage' events for cross-tab sync easily without websockets or polling.
        // For simplicity in this iteration, we'll just expose the notify wrapper.
    }

    public subscribe(callback: SyncCallback): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    public notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }

    public async init(): Promise<void> {
        // json-server auto-inits from db.json. We just ensure we can reach it.
        try {
            await fetch(API_BASE);
            console.log('Connected to backend JSON store.');
        } catch (e) {
            console.warn('Could not connect to backend JSON store. Is json-server running?');
        }
    }

    // --- Students / Profiles ---

    public async getProfiles(): Promise<StudentProfile[]> {
        const res = await fetch(API_BASE);
        if (!res.ok) return [];
        return await res.json();
    }

    public async getTeachers(): Promise<StudentProfile[]> {
        const profiles = await this.getProfiles();
        return profiles.filter(p => p.role === 'teacher');
    }

    public async getStudentsForTeacher(teacherId: string): Promise<StudentProfile[]> {
        // json-server supports filtering via query params
        const res = await fetch(`${API_BASE}?teacherId=${teacherId}`);
        if (!res.ok) return [];
        return await res.json();
    }

    public async addProfile(profile: StudentProfile): Promise<void> {
        await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        this.notifyListeners();
    }

    public async updateProfile(updatedProfile: StudentProfile): Promise<void> {
        await fetch(`${API_BASE}/${updatedProfile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile)
        });
        this.notifyListeners();
    }

    public async deleteProfile(profileId: string): Promise<void> {
        await fetch(`${API_BASE}/${profileId}`, {
            method: 'DELETE'
        });
        this.notifyListeners();
    }

    public async updateProfilesBulk(profiles: StudentProfile[]): Promise<void> {
        // json-server doesn't natively support bulk PUT to replace everything easily without custom routes.
        // For this app, we iterate and update individually or just delete all and insert.
        // For safety, we will update individually.
        for (const p of profiles) {
            await this.updateProfile(p);
        }
        this.notifyListeners();
    }
}

export const DbService = new DatabaseService();

// Simplistic hook to allow components to manually refresh if a user triggers an action
export function useDbSync(callback: () => void) {
    if (typeof window !== 'undefined') {
        const unsubscribe = DbService.subscribe(callback);
        return () => unsubscribe();
    }
    return () => { };
}
