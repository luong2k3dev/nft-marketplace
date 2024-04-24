export interface UserInfo {
  email?: string;
  username?: string;
  profileImage?: string;
  profileBanner?: string;
  profileBio?: string;
  profileLink?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  wallet?: string;
  balance?: number;
  roles?: string[];
  isEmailVerified?: boolean;
  isLocked?: boolean;
  numberLogined?: number;
  dateLastLogined?: Date;
}
