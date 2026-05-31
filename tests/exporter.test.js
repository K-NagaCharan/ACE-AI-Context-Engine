const { generateMarkdown } = require("../src/core/exporter");

describe("Markdown Exporter", () => {
  const project = {
    name: "test-project",
    description: "A test project",
    tech_stack: ["JS", "Node"]
  };

  test("should generate unindented markdown when there are no entries", () => {
    const data = {
      project,
      entries: []
    };

    const output = generateMarkdown(data);

    // Verify it starts with standard markdown and does not have leading spaces in headers
    expect(output).toContain("# ACE Project Export");
    expect(output).toContain("## Project Information");
    expect(output).toContain("Name: test-project");
    expect(output).toContain("No development history available yet.");
    
    // Check that we didn't add code block indenting (which is typically 4 or 8 spaces)
    const lines = output.split("\n");
    const infoLine = lines.find(l => l.includes("## Project Information"));
    expect(infoLine.startsWith("##")).toBe(true);
  });

  test("should generate correct markdown when entries exist", () => {
    const entries = [
      {
        commit: "abc1234",
        message: "Initial commit",
        summary: "Implemented setup",
        key_changes: ["Added configuration", "Added logic"],
        impact: "Enables initialization",
        note: "Note 1"
      }
    ];

    const data = {
      project,
      entries
    };

    const output = generateMarkdown(data);

    expect(output).toContain("# ACE Project Export");
    expect(output).toContain("## Recent Development History");
    expect(output).toContain("### Commit abc1234");
    expect(output).toContain("Summary:\nImplemented setup");
    expect(output).toContain("- Added configuration");
    expect(output).toContain("- Added logic");
    expect(output).toContain("Impact:\nEnables initialization");
    expect(output).toContain("Developer Note:\nNote 1");
  });
});
