const simpleGit = require("simple-git");

// Mock simple-git module
const mockGit = {
  checkIsRepo: jest.fn(),
  revparse: jest.fn(),
  log: jest.fn(),
  show: jest.fn()
};

jest.mock("simple-git", () => {
  return jest.fn().mockImplementation(() => mockGit);
});

const { getCommitsSince } = require("../src/core/git");

describe("Git Core Log Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch the correct limit on first run when lastCommit is null", async () => {
    mockGit.log.mockResolvedValue({
      all: [{ hash: "123", message: "Initial commit", refs: "" }]
    });

    const commits = await getCommitsSince(null, 5);

    expect(mockGit.log).toHaveBeenCalledWith({ maxCount: 5 });
    expect(commits).toHaveLength(1);
    expect(commits[0].hash).toBe("123");
  });

  test("should fetch commits from lastCommit to HEAD when lastCommit is provided", async () => {
    mockGit.log.mockResolvedValue({
      all: [
        { hash: "3", message: "Third commit", refs: "" },
        { hash: "2", message: "Second commit", refs: "" }
      ]
    });

    const commits = await getCommitsSince("1", 5);

    expect(mockGit.log).toHaveBeenCalledWith({ from: "1", to: "HEAD" });
    expect(commits).toHaveLength(2);
    expect(commits[0].hash).toBe("3");
  });

  test("should slice oldest limit commits and warning when total exceeds limit", async () => {
    // git log returns newest to oldest: [C6, C5, C4, C3, C2, C1]
    const mockAll = [
      { hash: "C6", message: "Commit 6", refs: "" },
      { hash: "C5", message: "Commit 5", refs: "" },
      { hash: "C4", message: "Commit 4", refs: "" },
      { hash: "C3", message: "Commit 3", refs: "" },
      { hash: "C2", message: "Commit 2", refs: "" },
      { hash: "C1", message: "Commit 1", refs: "" }
    ];

    mockGit.log.mockResolvedValue({ all: mockAll });

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Slicing oldest 3 commits from a batch of 6: should return [C3, C2, C1]
    const commits = await getCommitsSince("C0", 3);

    expect(commits).toHaveLength(3);
    // Since mockAll is sorted newest to oldest:
    // C6 is index 0 (newest), C1 is index 5 (oldest).
    // Slicing from the end with .slice(-3) should yield [C3, C2, C1]
    expect(commits[0].hash).toBe("C3");
    expect(commits[1].hash).toBe("C2");
    expect(commits[2].hash).toBe("C1");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Warning: 6 commits found, processing only oldest 3"
    );

    consoleSpy.mockRestore();
  });

  test("should remove merge commits correctly", async () => {
    mockGit.log.mockResolvedValue({
      all: [
        { hash: "C3", message: "Commit 3", refs: "" },
        { hash: "C2", message: "Merge branch 'main'", refs: "Merge" },
        { hash: "C1", message: "Commit 1", refs: "" }
      ]
    });

    const commits = await getCommitsSince("C0", 5);

    expect(commits).toHaveLength(2);
    expect(commits[0].hash).toBe("C3");
    expect(commits[1].hash).toBe("C1");
  });
});
