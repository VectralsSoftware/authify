import { User } from '../models/User.js'

/** =================================================
 * Find a user by their email address.
 * @param {string} email - The email address of the user.
 * @returns {Promise<any|null>} - A promise that resolves to the found user or null if not found.
===================================================== */

const findByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user || null;
};


/** =================================================
 * Find a user by their user ID.
 * @param {string} id - The user ID.
 * @returns {Promise<any|null>} - A promise that resolves to the found user or null if not found.
===================================================== */
const findById = async (id) => {
  const user = await User.findById(id, '-password').lean();
  return user || null;
};

/** =================================================
 * Create a new user.
 * @param {Object} userData 
 * @param {string} userData.email - The new username for the user (optional).
 * @param {string} [userData.username] - The username for the user (optional).
 * @param {Array} [userData.providers] - The provider for the user (optional).
 * @param {string} [userData.password] - The password for the user (optional).
 * @returns {Promise<any|null>} - A promise that resolves to the updated user or null if not found.
 * @throws {Object} - An object with a code property indicating the error code (e.g., 11000 for duplicate key).
===================================================== */
const createUser = async (userData) => {
  // Create user instance
  const user = new User(userData);

  // Check if user is already registered and exit the process
  const userExists = await findByEmail(user.email);

  if (userExists) {
    throw { code: 11000, message: 'User already exists' };
  }

  // Save the user and return the user saved
  return await user.save();
};

/** =================================================
 * Generate a unique username.
 * @returns {Promise<string>} - A promise that resolves to the generated unique username.
===================================================== */
const generateUsername = async () => {
  let username;
  let usernameExists = true;

  while (usernameExists) {
    // Generate a random username
    username = 'user' + Math.floor(Math.random() * 100000);

    // Check if the generated username already exists in the database
    const existingUser = await User.findOne({ username });

    // If the username doesn't exist, set usernameExists to false to exit the loop
    if (!existingUser) {
      usernameExists = false;
    }
  }

  return username;
};

/** =================================================
 * Update a user's information.
 * @param {Object} data - The data for updating a user.
 * @param {string} data.userId - The ID of the user to update.
 * @param {string} [data.newUserName] - The new username for the user (optional).
 * @param {string} [data.newProvider] - The new provider for the user (optional).
 * @param {string} [data.newPassword] - The new password for the user (optional).
 * @returns {Promise<any|null>} - A promise that resolves to the updated user or null if not found.
===================================================== */
const updateUser = async (data) => {
  const user = await findById(data.userId);

  if (!user) {
    return null;
  }

  const updatedUser = await User.findByIdAndUpdate(
    data.userId,
    {
      $set: {
        username: data.newUserName || user.username,
        password: data.newPassword || user.password,
      },
      $addToSet: {
        // Add newProvider to providers array if provided and not already present
        providers: data.newProvider && { $each: [data.newProvider] },
      },
    },
    { new: true } // Return the updated document
  );

  return updatedUser;
};

// Export the UserService object with the functions
export const UserService = {
  findByEmail,
  findById,
  createUser,
  generateUsername,
  updateUser,
};
