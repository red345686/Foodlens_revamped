import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import NavBar from './components/NavBar';
import { initializeUserProfile, updateProfileSection, getUserProfile } from './services/firestore';

const Profile = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('basic');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profileData, setProfileData] = useState({
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
        }
    });

    // Load profile data when component mounts
    useEffect(() => {
        const loadProfileData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // First try to get existing profile
                let profile = await getUserProfile(user.uid);

                // If no profile exists, initialize one
                if (!profile) {
                    profile = await initializeUserProfile(user.uid);
                }

                if (profile) {
                    // Ensure all sections exist with default values if missing
                    const updatedProfile = {
                        basic: {
                            name: profile.basic?.name || user?.displayName || '',
                            age: profile.basic?.age || '',
                            gender: profile.basic?.gender || '',
                            height: profile.basic?.height || '',
                            weight: profile.basic?.weight || '',
                            activityLevel: profile.basic?.activityLevel || 'moderate'
                        },
                        goals: {
                            primaryGoal: profile.goals?.primaryGoal || '',
                            dietPreferences: profile.goals?.dietPreferences || [],
                            allergies: profile.goals?.allergies || [],
                            mealPreferences: profile.goals?.mealPreferences || []
                        },
                        lifestyle: {
                            sleepHours: profile.lifestyle?.sleepHours || 7,
                            waterIntake: profile.lifestyle?.waterIntake || 8,
                            smokingHabits: profile.lifestyle?.smokingHabits || 'none',
                            workNature: profile.lifestyle?.workNature || 'desk',
                            stressLevel: profile.lifestyle?.stressLevel || 'medium'
                        },
                        health: {
                            medicalConditions: profile.health?.medicalConditions || [],
                            medications: profile.health?.medications || '',
                            dietHistory: profile.health?.dietHistory || '',
                            useForAI: profile.health?.useForAI ?? true
                        }
                    };
                    setProfileData(updatedProfile);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfileData();
    }, [user]);

    const handleInputChange = (e, section) => {
        const { name, value, type, checked } = e.target;
        setProfileData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleMultiSelect = (section, field, value) => {
        setProfileData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: Array.isArray(prev[section][field]) ?
                    prev[section][field].includes(value)
                        ? prev[section][field].filter(item => item !== value)
                        : [...prev[section][field], value]
                    : [value]
            }
        }));
    };

    const handlePrimaryGoalSelect = (goal) => {
        setProfileData(prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                primaryGoal: goal
            }
        }));
    };

    const handleSave = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Save the current section data
            await updateProfileSection(user.uid, activeSection, profileData[activeSection]);

            // Get the updated profile to ensure we have the latest data
            const updatedProfile = await getUserProfile(user.uid);
            if (updatedProfile) {
                setProfileData(prev => ({
                    ...prev,
                    [activeSection]: updatedProfile[activeSection]
                }));
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSectionContent = () => {
        const sections = {
            basic: (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Basic Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileData.basic.name}
                                onChange={(e) => handleInputChange(e, 'basic')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={profileData.basic.age}
                                onChange={(e) => handleInputChange(e, 'basic')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Gender</label>
                            <select
                                name="gender"
                                value={profileData.basic.gender}
                                onChange={(e) => handleInputChange(e, 'basic')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Height</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    name="height"
                                    value={profileData.basic.height}
                                    onChange={(e) => handleInputChange(e, 'basic')}
                                    disabled={!isEditing}
                                    className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                                    placeholder="Height"
                                />
                                <select
                                    className="p-2 border rounded-lg disabled:bg-gray-100"
                                    disabled={!isEditing}
                                >
                                    <option>cm</option>
                                    <option>ft</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Weight</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    name="weight"
                                    value={profileData.basic.weight}
                                    onChange={(e) => handleInputChange(e, 'basic')}
                                    disabled={!isEditing}
                                    className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                                    placeholder="Weight"
                                />
                                <select
                                    className="p-2 border rounded-lg disabled:bg-gray-100"
                                    disabled={!isEditing}
                                >
                                    <option>kg</option>
                                    <option>lbs</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Activity Level</label>
                            <select
                                name="activityLevel"
                                value={profileData.basic.activityLevel}
                                onChange={(e) => handleInputChange(e, 'basic')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            >
                                <option value="sedentary">Sedentary</option>
                                <option value="light">Lightly Active</option>
                                <option value="moderate">Moderately Active</option>
                                <option value="very">Very Active</option>
                                <option value="extra">Extra Active</option>
                            </select>
                        </div>
                    </div>
                </div>
            ),
            goals: (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Health & Nutrition Goals</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Primary Goal</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {['Weight Loss', 'Muscle Gain', 'Maintenance', 'Better Health', 'Specific Diet'].map((goal) => (
                                    <button
                                        key={goal}
                                        type="button"
                                        onClick={() => isEditing && handlePrimaryGoalSelect(goal)}
                                        disabled={!isEditing}
                                        className={`relative w-full rounded-lg border p-4 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                                            ${profileData.goals.primaryGoal === goal
                                                ? 'border-green-600 bg-green-50 text-green-800'
                                                : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'} 
                                            ${!isEditing && 'opacity-75 cursor-not-allowed'}`}
                                    >
                                        {goal}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Diet Preferences</h3>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free'].map((pref) => (
                                    <button
                                        key={pref}
                                        type="button"
                                        onClick={() => isEditing && handleMultiSelect('goals', 'dietPreferences', pref)}
                                        disabled={!isEditing}
                                        className={`rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                                            ${profileData.goals.dietPreferences.includes(pref)
                                                ? 'bg-green-800 text-white'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                                            ${!isEditing && 'opacity-75 cursor-not-allowed'}`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
                            <input
                                type="text"
                                name="allergies"
                                placeholder="Add allergies (comma separated)"
                                value={profileData.goals.allergies.join(', ')}
                                onChange={(e) => {
                                    if (!isEditing) return;
                                    const allergiesArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                                    setProfileData(prev => ({
                                        ...prev,
                                        goals: {
                                            ...prev.goals,
                                            allergies: allergiesArray
                                        }
                                    }));
                                }}
                                disabled={!isEditing}
                                className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm ${!isEditing && 'bg-gray-50 cursor-not-allowed'}`}
                            />
                        </div>
                    </div>
                </div>
            ),
            lifestyle: (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Lifestyle Snapshot</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Sleep (hours/night)</label>
                            <input
                                type="range"
                                min="4"
                                max="12"
                                value={profileData.lifestyle.sleepHours}
                                onChange={(e) => handleInputChange(e, 'lifestyle')}
                                name="sleepHours"
                                disabled={!isEditing}
                                className="w-full disabled:opacity-75"
                            />
                            <div className="text-center">{profileData.lifestyle.sleepHours} hours</div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Water Intake (cups/day)</label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={profileData.lifestyle.waterIntake}
                                onChange={(e) => handleInputChange(e, 'lifestyle')}
                                name="waterIntake"
                                disabled={!isEditing}
                                className="w-full disabled:opacity-75"
                            />
                            <div className="text-center">{profileData.lifestyle.waterIntake} cups</div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Smoking Habits</label>
                            <select
                                name="smokingHabits"
                                value={profileData.lifestyle.smokingHabits}
                                onChange={(e) => handleInputChange(e, 'lifestyle')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            >
                                <option value="none">None</option>
                                <option value="occasional">Occasional</option>
                                <option value="regular">Regular</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Work Nature</label>
                            <select
                                name="workNature"
                                value={profileData.lifestyle.workNature}
                                onChange={(e) => handleInputChange(e, 'lifestyle')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            >
                                <option value="desk">Desk Job</option>
                                <option value="field">Field Work</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Stress Level</label>
                            <div className="flex justify-between">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => isEditing && handleMultiSelect('lifestyle', 'stressLevel', level.toLowerCase())}
                                        disabled={!isEditing}
                                        className={`px-4 py-2 rounded-lg ${profileData.lifestyle.stressLevel === level.toLowerCase()
                                            ? 'bg-[#294c25] text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            } ${!isEditing && 'opacity-75 cursor-not-allowed'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            health: (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Health Background</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-[#294c25] text-white px-4 py-2 rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Medical Conditions</label>
                            <div className="flex flex-wrap gap-2">
                                {['Diabetes', 'Hypertension', 'Heart Disease', 'Allergies'].map((condition) => (
                                    <button
                                        key={condition}
                                        onClick={() => isEditing && handleMultiSelect('health', 'medicalConditions', condition)}
                                        disabled={!isEditing}
                                        className={`px-4 py-2 rounded-full ${profileData.health.medicalConditions.includes(condition)
                                            ? 'bg-[#294c25] text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            } ${!isEditing && 'opacity-75 cursor-not-allowed'}`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Medications/Supplements</label>
                            <textarea
                                name="medications"
                                value={profileData.health.medications}
                                onChange={(e) => handleInputChange(e, 'health')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                                rows="3"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Diet History</label>
                            <textarea
                                name="dietHistory"
                                value={profileData.health.dietHistory}
                                onChange={(e) => handleInputChange(e, 'health')}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="useForAI"
                                checked={profileData.health.useForAI}
                                onChange={(e) => handleInputChange(e, 'health')}
                                disabled={!isEditing}
                                className="mr-2 disabled:opacity-75"
                            />
                            <label>Use this information for AI personalization</label>
                        </div>
                    </div>
                </div>
            ),
            insights: (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Nutrition Score</h3>
                            <div className="w-32 h-32 mx-auto">
                                {/* Placeholder for circular progress */}
                                <div className="w-full h-full rounded-full border-8 border-[#294c25] flex items-center justify-center">
                                    <span className="text-2xl font-bold">85%</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Progress Tracker</h3>
                            <div className="space-y-4">
                                <div>
                                    <label>Weight</label>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div className="h-full w-3/4 bg-[#294c25] rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <label>Hydration</label>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div className="h-full w-2/3 bg-[#294c25] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button className="w-full bg-[#294c25] text-white py-3 rounded-lg">
                            View My Custom Meal Plan
                        </button>
                    </div>
                </div>
            )
        };

        return sections[activeSection];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar page="profile" />

            {/* Top Section */}
            <div className="pt-24 pb-8 bg-gradient-to-r from-[#294c25] to-[#1a3317] text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                                <span className="text-4xl text-[#294c25]">👤</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{user?.displayName || 'Welcome!'}</h1>
                                <p className="text-gray-200">Complete your profile to get personalized recommendations</p>
                            </div>
                        </div>
                        <div className="w-64 bg-white bg-opacity-20 rounded-full h-2">
                            <div className="w-3/4 h-full bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-4 mb-8 overflow-x-auto">
                    {['basic', 'goals', 'lifestyle', 'health', 'insights'].map((section) => (
                        <button
                            key={section}
                            onClick={() => {
                                setActiveSection(section);
                                setIsEditing(false);
                            }}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeSection === section
                                ? 'bg-[#294c25] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Section Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#294c25]"></div>
                    </div>
                ) : (
                    renderSectionContent()
                )}
            </div>
        </div>
    );
};

export default Profile; 