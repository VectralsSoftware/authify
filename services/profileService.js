import {Profile} from '../models/Profile.js'

/**  =================================================
 * Create or update a user profile.
 * @param {Object} profileData
 * @param {string} profileData.user - The user identifier.
 * @param {string} [profileData.given_name] - The given name of the person.
 * @param {string} [profileData.family_name] - The family name of the person.
 * @param {string} [profileData.picture] - The URL of the profile picture (optional).
 * @returns {Promise<Object>} - A promise that resolves to the created or updated profile.
 ===================================================== */
const createOrUpdateProfile = async (profileData) => {
  // Check if a profile already exists for the user
  const existingProfile = await Profile.findOne({ user: profileData.user });

  if (existingProfile) {
    // If a profile exists, update it with the new information
    const profile = await Profile.findOneAndUpdate(
      { user: profileData.user },
      {
        // If the profile already has been completed, we don't want to override the info.
        // We only want to complete the information that is missing with the information coming from the oAuth provider
        $set: {
          given_name: existingProfile.given_name || profileData.given_name,
          family_name: existingProfile.family_name || profileData.family_name,
          picture: existingProfile.picture || profileData.picture,
        },
      },
      { new: true }
    );

    return profile;
  } else {
    // If no profile exists, create a new one
    const profile = new Profile(profileData);
    const newProfile = await profile.save();
    return newProfile;
  }
};

/**
 * Get a user profile by userId.
 * @param {string} userId - The user identifier.
 * @returns {Promise<Object|null>} - A promise that resolves to the user profile or null if not found.
 */
const getProfileByUserId = async (userId) => {
  try {
    const profile = await Profile.findOne({ user: userId });
    return profile;
  } catch (error) {
    // Log the error or handle it in any appropriate way
    console.error(`Error fetching profile for userId ${userId}:`, error.message);
    // Reject the promise with the error
    return Promise.reject(error);
  }
};


export const ProfileService = {
  createOrUpdateProfile,
  getProfileByUserId
};
