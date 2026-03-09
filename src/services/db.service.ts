import { StudentProfile } from '../types/quest';
import { studentService } from './studentService';

type SyncCallback = () => void;

class DatabaseService {
    private listeners: SyncCallback[] = [];

    public subscribe(callback: SyncCallback): () => void {
        this.listeners.push(callback);
        const unsubscribe = studentService.subscribeToProfiles(() => {
            this.notifyListeners();
        });
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
            unsubscribe();
        };
    }

    public notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }

    public async init(): Promise<void> {
        // No-op for Firebase as it auto-initializes
        console.log('Connected to Firebase/Firestore backend.');
    }

    // --- Students / Profiles ---

    public async getProfiles(): Promise<StudentProfile[]> {
        return await studentService.fetchProfiles();
    }

    public async getTeachers(): Promise<StudentProfile[]> {
        const profiles = await this.getProfiles();
        return profiles.filter(p => p.role === 'teacher');
    }

    public async getStudentsForTeacher(teacherId: string): Promise<StudentProfile[]> {
        // Currently we fetch all and filter client-side for simplicity, 
        // matching the existing StudentProfile interface.
        const profiles = await this.getProfiles();
        return profiles.filter(p => p.teacherId === teacherId);
    }

    public async addProfile(profile: StudentProfile): Promise<void> {
        await studentService.saveProfile(profile);
    }

    public async updateProfile(updatedProfile: StudentProfile): Promise<void> {
        await studentService.saveProfile(updatedProfile);
    }

    public async deleteProfile(profileId: string): Promise<void> {
        await studentService.deleteProfile(profileId);
    }

    public async updateProfilesBulk(profiles: StudentProfile[]): Promise<void> {
        // studentService handles batching if needed, but for now we reuse resetProfiles or loop
        await studentService.resetProfiles(profiles);
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
