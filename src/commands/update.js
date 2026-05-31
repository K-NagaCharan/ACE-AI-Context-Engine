const fs = require("fs");


const {
  isGitRepo,
  hasCommits,
  getCommitsSince,
} = require("../core/git");

const {
  buildContext,
  buildEntry,
} = require("../core/context");

const {
  summarizeContext,
} = require("../core/ai");

const {
  readJSON,
  writeJSON,
  getACEPaths,
} = require("../utils/storage");

// Main update command
module.exports = async function update(options) {

    // Validate ACE initialization
  if (!fs.existsSync(".ace")) {
    console.log("Error: ACE not initialized. Run `ace-track init`.");

    return;
  }
  
  // Validate repo
  const validRepo = await isGitRepo();

  if (!validRepo) {
    console.log("Error: Not a Git repository.");
    return;
  }

  // Validate commits
  const commitsExist = await hasCommits();

  if (!commitsExist) {
    console.log("Error:  No commits found. Make your first commit.");

    return;
  }

  // Load ACE files
  const {
    projectFile,
    configFile,
  } = getACEPaths();

  const projectData =
    readJSON(projectFile);

  const config =
    readJSON(configFile);

  // Fetch commits
  const commits =
    await getCommitsSince(
      config.last_processed_commit,
      config.max_commits_per_update
    );

  if (commits.length === 0) {
    console.log("No new commits to process.");

    return;
  }

  // Reverse commits to process in chronological order (oldest first)
  commits.reverse();

  // Process commits
  let processedCount = 0;
  for (const commit of commits) {

    console.log(`Processing ${commit.hash.slice(0, 7)}...`);

    // Build structured context
    const context =
      await buildContext(
        commit,
        options.note || ""
      );

      if (!context) {
        console.log(`Skipping ${commit.hash.slice(0, 7)} (ACE internal files only)`);

        continue;
      }

    // AI summarization
    const aiSummary =
      await summarizeContext(context);

    // Build final entry
    const entry =
      buildEntry(context, aiSummary);

    // Store entry
    projectData.entries.push(entry);
    processedCount++;
  }

  // Update config to the newest commit in the batch
  config.last_processed_commit =
    commits[commits.length - 1].hash;

  // Save files
  writeJSON(projectFile, projectData);

  writeJSON(configFile, config);

  if (processedCount === 0) {
    console.log("No meaningful commits found.");

    return;
  }

  console.log(`ACE update completed. Processed ${processedCount} commit(s).`);
};