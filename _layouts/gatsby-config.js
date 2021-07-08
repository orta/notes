const path = require("path");

module.exports = {
  pathPrefix: `/notes`,
  siteMetadata: {
    title: `Notes`, 
    author: `Orta Therox`, 
    description: `A growing wiki of linked notes from @orta`,
    siteUrl: "https://orta.io/notes"
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-theme-kb`,
      options: {
        rootNote: "/home",
        contentPath: `${__dirname}/..`,
        ignore: [
          "**/_layouts/**",
          "**/.git/**",
          "**/.github/**",
          "**/.vscode/**",
          "**/.cache/**",
          "**/readme.md",
          "**/LICENSE",
        ],
        // this is an option for extending `gatsby-plugin-mdx` options inside `gatsby-theme-kb`,
        // so you can have your relative referenced files served, e.g. '../assets/img.png'.
        getPluginMdx(defaultPluginMdx) {
          defaultPluginMdx.options.gatsbyRemarkPlugins.push({
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              // ignoreFileExtensions: ["md", "mdx"],
            },
          });

          defaultPluginMdx.options.gatsbyRemarkPlugins.push({
            resolve: "gatsby-remark-shiki-twoslash",
            options: {
              theme: "github-light",
              useNodeModules: true,
              nodeModulesTypesPath: path.join(__dirname, "..", "node_modules"),
            },
          });

          return defaultPluginMdx;
        },
      },
    },
    {
      // this plugin makes sure your static files will be served by gatsby,
      // if you have multiple directories, copy this plugin section and specify other directory
      // check https://github.com/csath/gatsby-plugin-copy-files-enhanced to find docs for this plugin
      resolve: 'gatsby-plugin-copy-files-enhanced',
      options: {
        source: path.resolve(__dirname, `../assets`),
        destination: '/assets',
        purge: false,
      },
    },
  ],
};
