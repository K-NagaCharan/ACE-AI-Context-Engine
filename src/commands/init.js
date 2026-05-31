const path = require("path");
const readline = require("readline");
const {
  getProjectRoot,
  exists,
  createDir,
  writeJSON,
} = require("../utils/file");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

module.exports = async function init(options) {
  const root = getProjectRoot();

  const gitPath = path.join(root, ".git");
  const acePath = path.join(root, ".ace");

  // Validate Git repo
  if (!exists(gitPath)) {
    console.log("Error: Not a Git repository.");
    console.log("Run `git init` first.");
    return;
  }

  // Already initialized
  if (exists(acePath)) {
    console.log("Warning: ACE already initialized.");
    return;
  }

  let description = "";
  let techStack = [];

  //  Interactive mode (default)
  if (!options.y) {
    description = await askQuestion("Project description: ");
    const tech = await askQuestion(
      "Tech stack (comma separated): "
    );
    techStack = tech.split(",").map((t) => t.trim());
  }

  // Create .ace
  createDir(acePath);

  // project.ai.json
  writeJSON(path.join(acePath, "project.ai.json"), {
    version: "1.0",
    project: {
      name: path.basename(root),
      description,
      tech_stack: techStack,
      created_at: new Date().toISOString(),
    },
    entries: [],
  });

  // config.json
  writeJSON(path.join(acePath, "config.json"), {
    last_processed_commit: null,
    max_commits_per_update: 5,
  });

  // Handle .gitignore to prevent committing .ace/
  const gitignorePath = path.join(root, ".gitignore");
  const fs = require("fs");
  try {
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, "utf8");
      const lines = content.split(/\r?\n/).map(line => line.trim());
      const isIgnored = lines.some(line => line === ".ace" || line === ".ace/");
      if (!isIgnored) {
        // Ensure we append with proper newlines
        const prefix = content.endsWith("\n") ? "" : "\n";
        fs.appendFileSync(gitignorePath, `${prefix}\n# ACE Project Memory\n.ace/\n`);
        console.log(" Added .ace/ to .gitignore");
      }
    } else {
      fs.writeFileSync(gitignorePath, "# ACE Project Memory\n.ace/\n");
      console.log(" Created .gitignore and added .ace/");
    }
  } catch (err) {
    console.log("Warning: Failed to update .gitignore automatically. Please add '.ace/' to .gitignore manually.");
  }

  console.log(" ACE initialized successfully!");
};