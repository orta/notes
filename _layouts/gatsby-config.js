const path = require("path");

module.exports = {
  pathPrefix: `/notes`,
  siteMetadata: {
    title: `Notes`, // Replace it with your site's title
    author: `Orta Therox`, // Replace it with your name
    description: `Notes and things`, // Replace it with your site's description
  },
  plugins: [
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

          // defaultPluginMdx.options.gatsbyRemarkPlugins.push({
          //   resolve: "gatsby-remark-opengraph",
          //   options: {
          //     background: path.join(__dirname, "src", "assets", "bg.png"),
          //     // if you create post-specific open graph images, be sure to prefix `./public`
          //     outputPath: (markdownNode) =>
          //       path.join(
          //         "./public",
          //         path.basename(markdownNode.fileAbsolutePath, ".md")
          //       ),
          //     texts: (mdNode) => {
          //       const md = mdNode.internal.content;
          //       const title = md.split("\n")[0].replace(/#/g, "").trim();
          //       const preview = md.split("\n")[2].trim().replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')

          //       return [
          //         {
          //           text: title,
          //           y: 120,
          //           x: 18,
          //           maxWidth: 1200 - 18 * 2,
          //           color: "#ffffff",
          //           font: require.resolve("./src/assets/JMH Typewriter.ttf"),
          //         },
          //         {
          //           text: preview.slice(0, 300),
          //           fontSize: 80,
          //           maxWidth: 1200 - 18 * 2,
          //           font: require.resolve("./src/assets/Hai California.ttf"),
          //           y: 200,
          //           x: 18,
          //           color: "#ffffff",
          //         },
          //       ];
          //     },
          //   },
          // });

          return defaultPluginMdx;
        },
      },
    },
    {
      // this plugin makes sure your static files will be served by gatsby,
      //   but of course you need to reference them by absolute path, e.g. '/assets/img.png'.
      // if you have multiple directories, copy this plugin section and specify other directory
      // check https://github.com/csath/gatsby-plugin-copy-files-enhanced to find docs for this plugin
      resolve: "gatsby-plugin-copy-files-enhanced",
      options: {
        source: path.resolve(__dirname, `../assets`),
        destination: "/assets",
        purge: false,
      },
    },
  ],
};
