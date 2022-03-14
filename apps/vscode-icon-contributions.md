### VS Code Icon Contributions Guide

In the [Feb 2022](https://code.visualstudio.com/updates/v1_65#_icon-contribution-point-is-now-final) release of VS Code, the team finalized a way to add a custom icon to VS Code's UI.

I wanted to use this in [the GraphQL extension](https://github.com/graphql/graphiql/pull/2239#issuecomment-106668953) but couldn't find much on the process. You need to create an 'icon font' as a .woff file, but you have an SVG of a logo. What do you do from there?

I used the site https://icomoon.io/ to generate the GraphQL icons. Font rendering is quite different from SVG rendering in that you only really have a few primitives, and they have 3 rendering modes: neutral, negative and positive (they act a bit like the clipping tools in vector editors). What this means in practice is that a logo might not transfer over elegantly.

The GraphQL logo first didn't load because it used strokes, so I replaced those with rects. Next the parts of the rects which overlapped the circles were causing issues because they weren't additive. So, after a few attempts, I just made the rects long enough to touch but not overlap.

After that I made a few variants, and uploaded them into icomoon:

![An example of the UI](/notes/assets/img/iconfonts.png)

These numbers under the icon are then used in JSON:

```json
{
  // ...
  "icons": {
    "graphql-logo": {
      "description": "GraphQL Icon",
      "default": {
        "fontPath": "assets/graphql-fonts.woff",
        "fontCharacter": "\\E900"
      }
    },
    "graphql-loading": {
      "description": "GraphQL Loading Icon",
      "default": {
        "fontPath": "assets/graphql-fonts.woff",
        "fontCharacter": "\\E902"
      }
    },
    "graphql-failed": {
      "description": "GraphQL Failed Icon",
      "default": {
        "fontPath": "assets/graphql-fonts.woff",
        "fontCharacter": "\\E901"
      }
    }
  }
}
```

Then you can refer to the keys in your UI.