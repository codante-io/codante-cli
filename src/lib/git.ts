import { execa } from "execa";

export async function cloneRepo(
  cloneUrl: string,
  directory?: string
): Promise<string> {
  const args = ["clone", cloneUrl];
  if (directory) args.push(directory);

  const result = await execa("git", args);
  // git clone outputs to stderr
  return directory || cloneUrl.split("/").pop()?.replace(".git", "") || "repo";
}

export async function isGitInstalled(): Promise<boolean> {
  try {
    await execa("git", ["--version"]);
    return true;
  } catch {
    return false;
  }
}
