import { ofetch } from "ofetch";
import { getToken } from "./config.js";
import type {
  ApiDetailResponse,
  ApiListResponse,
  AuthResponse,
  Challenge,
  ChallengeCard,
  ChallengeUser,
  User,
} from "../types.js";

const BASE_URL = process.env.CODANTE_API_URL || "https://api.codante.io/api";

function createClient() {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return { headers };
}

export async function getUser(includeGithubToken = false): Promise<User & { github_token?: string }> {
  const { headers } = createClient();
  const params = includeGithubToken ? "?include_github_token=1" : "";
  return ofetch<User & { github_token?: string }>(`${BASE_URL}/user${params}`, { headers });
}

export interface ChallengeFilters {
  difficulty?: string;
  tech?: string;
}

interface ChallengesResponse {
  data: {
    challenges: ChallengeCard[];
    featuredChallenge: ChallengeCard | null;
    totalChallenges: number;
  };
}

export async function getChallenges(
  filters?: ChallengeFilters
): Promise<ChallengeCard[]> {
  const params = new URLSearchParams();
  if (filters?.difficulty) params.set("dificuldade", filters.difficulty);
  if (filters?.tech) params.set("tecnologia", filters.tech);

  const { headers } = createClient();
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await ofetch<ChallengesResponse>(
    `${BASE_URL}/challenges${query}`,
    { headers }
  );
  return res.data.challenges;
}

export async function getChallenge(slug: string): Promise<Challenge> {
  const { headers } = createClient();
  const res = await ofetch<ApiDetailResponse<Challenge>>(
    `${BASE_URL}/challenges/${slug}`,
    { headers }
  );
  return res.data;
}

export async function joinChallenge(slug: string): Promise<void> {
  const { headers } = createClient();
  await ofetch(`${BASE_URL}/challenges/${slug}/join`, {
    method: "POST",
    headers,
  });
}

export async function submitChallenge(
  slug: string,
  submissionUrl: string
): Promise<void> {
  const { headers } = createClient();
  await ofetch(`${BASE_URL}/challenges/${slug}/submit`, {
    method: "POST",
    headers,
    body: { submission_url: submissionUrl },
  });
}

export async function submitWithoutDeploy(
  slug: string,
  imagePath: string
): Promise<void> {
  const { headers } = createClient();
  const { readFile } = await import("node:fs/promises");
  const { basename } = await import("node:path");

  const fileBuffer = await readFile(imagePath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.append("submission_image", blob, basename(imagePath));

  // Remove Content-Type to let fetch set multipart boundary
  const { "Content-Type": _, ...restHeaders } = headers;
  await ofetch(`${BASE_URL}/challenges/${slug}/submit-without-deploy`, {
    method: "POST",
    headers: restHeaders,
    body: formData,
  });
}

export async function getStatus(slug: string): Promise<ChallengeUser> {
  const { headers } = createClient();
  const res = await ofetch<ApiDetailResponse<ChallengeUser>>(
    `${BASE_URL}/challenges/${slug}/joined`,
    { headers }
  );
  return res.data;
}

export async function verifyFork(slug: string): Promise<boolean> {
  const { headers } = createClient();
  const res = await ofetch<{ data: boolean }>(
    `${BASE_URL}/challenges/${slug}/forked`,
    { headers }
  );
  return res.data;
}

export async function markComplete(slug: string): Promise<void> {
  const { headers } = createClient();
  await ofetch(`${BASE_URL}/challenges/${slug}`, {
    method: "PUT",
    headers,
    body: { completed: true },
  });
}
