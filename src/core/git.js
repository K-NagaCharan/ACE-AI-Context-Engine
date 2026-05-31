const simpleGit = require("simple-git");

const git = simpleGit();

// Check if current directory is a git repo
async function isGitRepo() {
  return await git.checkIsRepo();
}

// Check if repo has commits
async function hasCommits() {
  try {
    await git.revparse(["HEAD"]);
    return true;
  } catch {
    return false;
  }
}

// Get latest commit hash
async function getLatestCommit() {
  const log = await git.log({ maxCount: 1 });

  if (log.total === 0) {
    return null;
  }

  return log.latest.hash;
}

// Get commits since last processed commit
async function getCommitsSince(lastCommit, limit = 5) {
  let log;

  // First run
  if (!lastCommit) {
    log = await git.log({ maxCount: limit });
  } else {
    log = await git.log({
      from: lastCommit,
      to: "HEAD",
    });
  }

  let commits = log.all;

  // Remove merge commits
  commits = commits.filter((commit) => {
    return commit.refs.indexOf("Merge") === -1;
  });

  // Limit commit count
  if (commits.length > limit) {
    console.log(
      `Warning: ${commits.length} commits found, processing only oldest ${limit}`
    );

    commits = commits.slice(-limit);
  }

  return commits;
}

// Get names of the files to which changes are done
async function getCommitFiles(commitHash) {
  const result = await git.show([
    "--name-only",
    "--pretty=",
    commitHash,
  ]);

  return result
  .split("\n")
  .map((f) => f.trim())

  // Remove empty lines
  .filter(Boolean)

  // Ignore ACE internal files
  .filter((file) => {
    return !file.startsWith(".ace/");
  });
}

// The actual code diff
async function getCommitDiff(commitHash) {
  const rawDiff = await git.show([
    "--format=",
    "--unified=2",
    commitHash,
  ]);

  const lines = rawDiff.split("\n");
  const result = [];

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      // Extract filename and add as separator
      const filename = line.split(" b/")[1] || "";
      result.push(`\n### ${filename}`);
    } else if (
      line.startsWith("+") ||
      line.startsWith("-") ||
      line.startsWith("@@")
    ) {
      result.push(line);
    }
  }

  const trimmed = result.slice(0, 80).join("\n");
  return trimmed.slice(0, 1500);
}

module.exports = {
  isGitRepo,
  hasCommits,
  getLatestCommit,
  getCommitsSince,
  getCommitFiles,
  getCommitDiff,
};