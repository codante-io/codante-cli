export interface ChallengeCard {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  status: string;
  difficulty: string;
  has_solution: boolean;
  estimated_effort: string;
  category: string;
  is_premium: boolean;
  main_technology: Tag | null;
  tags: Tag[];
  enrolled_users_count: number;
  current_user_is_enrolled: boolean;
}

export interface Challenge {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  video_url: string;
  status: string;
  difficulty: string;
  duration_in_minutes: number;
  repository_name: string;
  featured: string | null;
  short_description: string;
  description: string;
  has_solution: boolean;
  is_premium: boolean;
  resources: unknown[];
  enrolled_users_count: number;
  current_user_is_enrolled: boolean;
  current_user_status: string | null;
  tags: Tag[];
  stars: number;
  forks: number;
}

export interface ChallengeUser {
  id: number;
  user: User;
  challenge: ChallengeSummary;
  submission_url: string | null;
  fork_url: string | null;
  joined_discord: boolean;
  completed: boolean;
  submission_image_url: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  listed: boolean;
}

export interface ChallengeSummary {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  image_url: string;
  status: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  github_id: string | null;
  github_user: string | null;
  discord_user: string | null;
  linkedin_user: string | null;
  is_pro: boolean;
  is_admin: boolean;
  created_at: string;
  avatar: UserAvatar;
}

export interface UserAvatar {
  avatar_url: string | null;
  name: string | null;
  badge: string | null;
  github_user: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface AuthResponse {
  token: string;
  is_new_signup?: boolean;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiDetailResponse<T> {
  data: T;
}
