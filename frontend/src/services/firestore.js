import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Collection and document structure
const COLLECTIONS = {
    PROFILES: 'profiles',
    SECTIONS: {
        BASIC: 'basic',
        GOALS: 'goals',
        LIFESTYLE: 'lifestyle',
        HEALTH: 'health',
        INSIGHTS: 'insights'
    }
};

// Get user profile data
export const getUserProfile = async (userId) => {
    try {
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            return profileSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Initialize user profile with default values
export const initializeUserProfile = async (userId) => {
    try {
        const profileRef = doc(db, 'profiles', userId);
        const profileData = {
            basic: {
                name: '',
                age: '',
                gender: '',
                height: '',
                weight: '',
                activityLevel: 'moderate'
            },
            goals: {
                primaryGoal: '',
                dietPreferences: [],
                allergies: [],
                mealPreferences: []
            },
            lifestyle: {
                sleepHours: 7,
                waterIntake: 8,
                smokingHabits: 'none',
                workNature: 'desk',
                stressLevel: 'medium'
            },
            health: {
                medicalConditions: [],
                medications: '',
                dietHistory: '',
                useForAI: true
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(profileRef, profileData);
        return profileData;
    } catch (error) {
        console.error('Error initializing user profile:', error);
        throw error;
    }
};

// Update a specific section of the profile
export const updateProfileSection = async (userId, section, data) => {
    try {
        const profileRef = doc(db, 'profiles', userId);

        // First check if the profile exists
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
            // If profile doesn't exist, initialize it first
            await initializeUserProfile(userId);
        }

        // Update the specific section and timestamp
        await updateDoc(profileRef, {
            [section]: data,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating profile section:', error);
        throw error;
    }
};

// Get a specific section of the user's profile
export const getProfileSection = async (userId, section) => {
    const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
        const data = profileDoc.data();
        return data.sections[section] || {};
    }
    return {};
}; 