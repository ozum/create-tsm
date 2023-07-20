module.exports = {
  exclude: ["**/*+(.test|.spec|.e2e).ts", "*/util/**/*", "*/helper/**/*"],
  plugin: ["typedoc-plugin-markdown"],
  cleanOutputDir: true,
  readme: "none",
  entryPoints: ["src/index.ts"],
  out: "./docs (api)",
};
