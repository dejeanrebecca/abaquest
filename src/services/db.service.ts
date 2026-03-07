import { StudentProfile } from '../types/quest';
import { INITIAL_PROFILES } from './seedData';

type StorageEventCallback = () => void;

interface DB {
    profiles: StudentProfile[];
}

const DB_KEY = 'abaquest_db';
const LEGACY_KEY = 'abaquest_students';

class DatabaseService {
    private listeners: StorageEventCallback[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === DB_KEY) {
                    this.notifyListeners();
                }
            });
        }
    }

    public subscribe(callback: StorageEventCallback): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }

    public async init(): Promise<void> {
        // Run migration if needed
        const existingData = localStorage.getItem(DB_KEY);
        if (!existingData) {
            const legacyData = localStorage.getItem(LEGACY_KEY);
            if (legacyData) {
                try {
                    console.log('Migrating legacy data to new schema...');
                    const parsedLegacy: StudentProfile[] = JSON.parse(legacyData);
                    const newDb: DB = { profiles: parsedLegacy };
                    localStorage.setItem(DB_KEY, JSON.stringify(newDb));
                } catch (error) {
                    console.error('Migration failed:', error);
                    const newDb: DB = { profiles: INITIAL_PROFILES };
                    localStorage.setItem(DB_KEY, JSON.stringify(newDb));
                }
            } else {
                console.log('No existing data, using seed data...');
                const newDb: DB = { profiles: INITIAL_PROFILES };
                localStorage.setItem(DB_KEY, JSON.stringify(newDb));
            }
        }
    }

    private getDb(): DB {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return { profiles: [] };
            }
        }
        return { profiles: [] };
    }

    private saveDb(db: DB): void {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        // Manually trigger for same-window updates
        window.dispatchEvent(new Event('local-db-updated'));
        this.notifyListeners();
    }

    // --- Students / Profiles ---

    public async getProfiles(): Promise<StudentProfile[]> {
        return this.getDb().profiles;
    }

    public async getTeachers(): Promise<StudentProfile[]> {
        return this.getDb().profiles.filter(p => p.role === 'teacher');
    }

    public async getStudentsForTeacher(teacherId: string): Promise<StudentProfile[]> {
        return this.getDb().profiles.filter(p => p.teacherId === teacherId);
    }

    public async addProfile(profile: StudentProfile): Promise<void> {
        const db = this.getDb();
        db.profiles.push(profile);
        this.saveDb(db);
    }

    public async updateProfile(updatedProfile: StudentProfile): Promise<void> {
        const db = this.getDb();
        db.profiles = db.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
        this.saveDb(db);
    }

    public async deleteProfile(profileId: string): Promise<void> {
        const db = this.getDb();
        db.profiles = db.profiles.filter(p => p.id !== profileId);
        this.saveDb(db);
    }

    public async updateProfilesBulk(profiles: StudentProfile[]): Promise<void> {
        const db = this.getDb();
        db.profiles = profiles;
        this.saveDb(db);
    }
}

export const DbService = new DatabaseService();

// For components that need a custom hook to stay synced:
export function useDbSync(callback: () => void) {
    if (typeof window !== 'undefined') {
        const handleSync = () => callback();
        window.addEventListener('local-db-updated', handleSync);
        const unsubscribe = DbService.subscribe(handleSync);

        return () => {
            window.removeEventListener('local-db-updated', handleSync);
            unsubscribe();
        };
    }
    return () => { };
}
