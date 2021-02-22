const path = require("path");

module.exports = {
  pathPrefix: `/notes`,
  siteMetadata: {
    title: `Notes`, // Replace it with your site's title
    author: `Orta Therox`, // Replace it with your name
    description: `Notes and things`, // Replace it with your site's description
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
              ignoreFileExtensions: ["md", "mdx"],
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

          defaultPluginMdx.options.gatsbyRemarkPlugins.push({
            resolve: "gatsby-remark-opengraph",
            options: {
              background: path.join(__dirname, "src", "assets", "bg.png"),
              outputPath: (markdownNode) => {
                const base = path.join(__dirname, "..")
                return path.join(
                  "./public",
                  markdownNode.fileAbsolutePath.replace(base, "").replace(".md", "")
                )
              },
              texts: (mdNode) => {
                const md = mdNode.internal.content;
                const title = md.split("\n")[0].replace(/#/g, "").trim();
                const preview = md.split("\n")[2].trim().replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')

                return [
                  {
                    text: title,
                    y: 120,
                    x: 18,
                    maxWidth: 1200 - 18 * 2,
                    color: "#ffffff",
                    font: require.resolve("./src/assets/Roboto-Bold.ttf"),
                  },
                  {
                    text: preview.slice(0, 300),
                    fontSize: 30,
                    maxWidth: 1200 - 18 * 2,
                    font: require.resolve("./src/assets/Roboto-Regular.ttf"),
                    y: 200,
                    x: 18,
                    color: "#ffffff",
                  },
                ];
              },
            },
          });

          return defaultPluginMdx;
        },
      },
    }
  ],
};
