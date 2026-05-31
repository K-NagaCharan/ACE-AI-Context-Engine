function generateMarkdown(projectData) {

  const project = projectData.project;

  const entries =
    projectData.entries.slice(-5);

    if (entries.length === 0) {
        return `# ACE Project Export

## Project Information

Name: ${project.name}

Description:
${project.description}

Tech Stack:
${project.tech_stack.join(", ")}

---

No development history available yet.

Run:
ace-track update

after making real project commits.
`;
    }

  let output = `# ACE Project Export

## Project Information

Name: ${project.name}

Description:
${project.description}

Tech Stack:
${project.tech_stack.join(", ")}

---

## Recent Development History
`;

  for (const entry of entries) {

    output += `
### Commit ${entry.commit}

Message:
${entry.message}

Summary:
${entry.summary}

Key Changes:
${entry.key_changes
  .map((c) => `- ${c}`)
  .join("\n")}

Impact:
${entry.impact}

Developer Note:
${entry.note || "None"}

---
`;
  }

  output += `
## Next Steps

Continue development based on:
- recent summaries
- key changes
- project direction
`;

  return output;
}

module.exports = {
  generateMarkdown,
};