import ViewMyProfile from "@/components/Dashboard/User/ViewMyProfile";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  profilePhoto: string | null;
  boi: string | null;
  role: UserRole;
  phone: string | null;
  country: string | null;
  status: UserStatus;
  isVerified: boolean;
  website: string | null;
  instagram: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileResponse = {
  success: boolean;
  message: string;
  data: UserProfile;
};

/**
 * 
 * {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
        "id": "ed936fb4-abfc-4610-b379-c34a8a9b1837",
        "email": "mia@yopmail.com",
        "name": "mia mia mia",
        "username": null,
        "profilePhoto": null,
        "boi": null,
        "role": "USER",
        "phone": null,
        "country": null,
        "status": "ACTIVE",
        "isVerified": false,
        "website": null,
        "instagram": null,
        "followersCount": 0,
        "followingCount": 0,
        "postsCount": 14,
        "createdAt": "2026-09-22T23:59:44.714Z",
        "updatedAt": "2026-10-07T04:51:55.896Z"
    }
}
*/

const MyProfilePage = async () => {
  const loginUrl = "/login?redirect=%2Fdashboard";

  const user = await getCurrentUser();

  if (!user) {
    redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect(loginUrl);
  }

  const response = await fetch("http://localhost:5000/api/v1/user/me", {
    headers: {
      Accept: "application/json",
      Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect(loginUrl);
  }

  if (!response.ok) {
    throw new Error(`Failed to load your profile: HTTP ${response.status}`);
  }

  const aboutMe: UserProfileResponse = await response.json();

  if (aboutMe.success !== true) {
    throw new Error("The backend could not retrieve your profile.");
  }

  return (
    <>
      <ViewMyProfile me={aboutMe.data}></ViewMyProfile>
    </>
  );
};

export default MyProfilePage;
