import {
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    onSnapshot,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentProfile } from '../types/quest';

const COLLECTION_NAME = 'students';

export const studentService = {
    /**
     * Fetch all student profiles from Firestore
     */
    async fetchProfiles(): Promise<StudentProfile[]> {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => doc.data() as StudentProfile);
        } catch (error) {
            console.error("Error fetching profiles from Firestore:", error);
            return [];
        }
    },

    /**
     * Save or update a student profile in Firestore
     */
    async saveProfile(profile: StudentProfile): Promise<void> {
        try {
            // Firestore does not like undefined values. Transform to avoid crashes.
            const cleanProfile = JSON.parse(JSON.stringify(profile));
            
            // Use student ID as the document ID
            await setDoc(doc(db, COLLECTION_NAME, profile.id), cleanProfile);
        } catch (error) {
            console.error("Error saving profile to Firestore:", error);
            throw error;
        }
    },

    /**
     * Delete a student profile from Firestore
     */
    async deleteProfile(profileId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, profileId));
        } catch (error) {
            console.error("Error deleting profile from Firestore:", error);
            throw error;
        }
    },

    /**
     * Listen for real-time updates to profiles
     */
    subscribeToProfiles(callback: (profiles: StudentProfile[]) => void, onError?: (error: any) => void) {
        return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
            const profiles = snapshot.docs.map(doc => doc.data() as StudentProfile);
            callback(profiles);
        }, (error) => {
            console.error("Firestore subscription error:", error);
            if (onError) onError(error);
        });
    },

    /**
     * Reset progress for multiple student profiles in a single batch
     */
    async resetProfiles(profiles: StudentProfile[]): Promise<void> {
        try {
            const batch = writeBatch(db);

            profiles.forEach(profile => {
                const docRef = doc(db, COLLECTION_NAME, profile.id);
                const resetProfile: StudentProfile = {
                    ...profile,
                    progress: {
                        studentName: profile.name,
                        emotionalState: 'happy',
                        totalCoins: 0,
                        level: 1,
                        xp: 0,
                        completedQuests: [],
                        currentQuestId: 1,
                        questProgress: {} as any,
                    }
                };
                batch.set(docRef, resetProfile);
            });

            await batch.commit();
        } catch (error) {
            console.error("Error resetting profiles in Firestore:", error);
            throw error;
        }
    },

    /**
     * Batch save multiple profiles (used for initial seeding)
     */
    async saveProfilesBatch(profiles: StudentProfile[]): Promise<void> {
        try {
            const batch = writeBatch(db);
            profiles.forEach(profile => {
                const docRef = doc(db, COLLECTION_NAME, profile.id);
                batch.set(docRef, profile);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error saving profiles batch:", error);
            throw error;
        }
    },

    /**
     * Check if Firebase is likely configured with real keys
     */
    isConfigured(): boolean {
        const config = (db as any)._app?.options;
        if (!config || !config.apiKey || config.apiKey === "YOUR_API_KEY" || config.apiKey === "your-api-key") {
            return false;
        }
        return true;
    }
};
