const Configuration = {
	extends: ["@commitlint/config-conventional"],
	formatter: "@commitlint/format",
	rules: {
		"type-enum": [
			2,
			"always",
			["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "remove"],
		],
		"subject-case": [0],
		"header-max-length": [1, "always", 72],
		"body-empty": [1, "never", "建议添加提交详情说明，以便更好地理解变更内容"],
	},
};

export default Configuration;
