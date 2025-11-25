import apiClient from "./api-client";

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  rollNo?: string;
  year?: string;
  hostel?: string;
  roomNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch user data by ID from the backend
 * @param userId - The user ID to fetch
 * @returns User data or null if not found/error
 */
export async function fetchUserById(userId: string): Promise<UserData | null> {
  try {
    const response = await apiClient.get(`/user/${userId}`);
    if (response.data?.success && response.data?.user) {
      return response.data.user as UserData;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return null;
  }
}

/**
 * Fetch multiple users by their IDs
 * @param userIds - Array of user IDs to fetch
 * @returns Map of userId to UserData
 */
export async function fetchUsersByIds(
  userIds: string[]
): Promise<Map<string, UserData>> {
  const userMap = new Map<string, UserData>();
  
  // Remove duplicates
  const uniqueIds = Array.from(new Set(userIds));
  
  // Fetch all users in parallel
  const results = await Promise.allSettled(
    uniqueIds.map((id) => fetchUserById(id))
  );
  
  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      userMap.set(uniqueIds[index], result.value);
    }
  });
  
  return userMap;
}

