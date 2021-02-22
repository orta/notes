# User Font Choices on a Web Page

During the creation of the TypeScript website, we debated the font for code for quite a while. I'm not sure anyone was individually happy with the outcome to use [Cascadia](https://github.com/microsoft/cascadia-code#readme), but it felt like the right thing for the website. Cut to a year after shipping, and I came back to this problem in a way that makes everyone happy.

Things we don't want:

1. New fancy web tech
2. Flashes of unstyled content (FOAC)
3. Forcing JS in the app
4. Loading every possible font ahead of time

Let's go through these incrementally.

## 1. CSS Vars are OK to Use

I didn't really get past the first hurdle when I considered this approach last year because I thought that
[CSS variables](https://caniuse.com/css-variables) were too modern to use in the TypeScript website. I have since
changed my mind. I explored their feasibility when building the dark/light mode support for the website and determined,
CSS variables are here to stay and are supported in enough browsers.

## 2. ASAP Sync `<script>`

Next up is "no flashing of un-styled content", this technique means adding a synchronous `<script>` tag as early as
possible in the HTML to check for a font in local storage:

```html
<html>
  <head>
    <body>
      <script>
        (function () {
          let hasLocalStorage = false;
          try {
            // Accessing throws in browsers with stricter security settings
            hasLocalStorage = typeof localStorage !== "undefined";
          } catch (error) {}

          const systemIsDark =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

          const hasSetColorTheme = hasLocalStorage && localStorage.getItem("force-color-theme");
          const customThemeOverride = hasLocalStorage && localStorage.getItem("force-color-theme");

          if (!hasSetColorTheme && systemIsDark) {
            document.documentElement.classList.add("dark-theme");
          } else if (customThemeOverride) {
            document.documentElement.classList.add(customThemeOverride.replace("force-", "") + "-theme");
          }

          const customFontOverride = (hasLocalStorage && localStorage.getItem("force-font")) || "cascadia";
          document.documentElement.classList.add("font-" + customFontOverride);
        })();
      </script>

      <.../>
    </body>
  </head>
</html>
```

Basically, if you can, set a class on the `body` before anything is rendered. This saves the browser from triggering
re-layouts due to fonts switching from the default to the user's custom one.

## 3. Scoped CSS

I've used SCSS everywhere since it came out in 2006, primarily for nesting queries, still kinda mind-blown that it's not
a native feature. It's being looked at [again though](https://drafts.csswg.org/css-nesting/).

This CSS however isn't too fancy, it just handles each potential class on the `<html>` element.

```css
html {
  --code-font: "Cascadia Mono-SemiLight", Menlo, Monaco, Consolas, monospace;
  --body-font: "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
}

// These match the ids from the select in SiteFooter-Customize.tsx

html.font-cascadia-ligatures {
  --code-font: "Cascadia Code-SemiLight", Menlo, Monaco, Consolas, monospace;
}

html.font-consolas {
  --code-font: Consolas, monospace;
}

html.font-dank-mono {
  --code-font: "Dank Mono Regular", Menlo, Monaco, Consolas, monospace;
}

html.font-jetbrains-mono {
  --code-font: "JetBrains Mono-Regular", Menlo, Monaco, Consolas, monospace;
}

html.font-fira-code {
  --code-font: "FiraCode-Regular", Menlo, Monaco, Consolas, monospace;
}

html.font-sf-mono {
  --code-font: "SF Mono", Menlo, Monaco, Consolas, monospace;
}

html.font-source-code-pro {
  --code-font: "SourceCode Pro Regular", Menlo, Monaco, Consolas, monospace;
}

html.font-open-dyslexic {
  --code-font: "OpenDyslexicMono Regular", Menlo, Monaco, Consolas, monospace;
  --body-font: "OpenDyslexic Regular", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto,
    "Helvetica Neue", sans-serif;
}
```

If you have this CSS file imported _after_ the inline `<script>` from #2 then by the time this file is being parsed,
`<html>` will already have a class set.

This CSS variable technique is kind cool, because later in the playground I do this:

```ts
const sandboxEnv = await sandbox.createTypeScriptSandbox(
  {
    monacoSettings: {
      fontFamily: "var(--code-font)",
      fontLigatures: true,
    },
  },
  main,
  ts
);
```

Which means the browser does the work and monaco picks up the font when they change. Next you need to hook up your font
names to the font files:

```css
// Default

@font-face {
  font-family: "Cascadia Mono-SemiLight";
  src: url("/fonts/CascadiaMono-SemiLight.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

// Custom options

@font-face {
  font-family: "Cascadia Code-SemiLight";
  src: url("/fonts/CascadiaCode-SemiLight.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "JetBrains Mono-Regular";
  src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "FiraCode-Regular";
  src: url("/fonts/FiraCode-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Dank Mono Regular";
  src: url("/fonts/DankMono-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "SourceCode Pro Regular";
  src: url("/fonts/SourceCodePro-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "OpenDyslexicMono Regular";
  src: url("/fonts/OpenDyslexicMono-Regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "OpenDyslexic Regular";
  src: url("/fonts/OpenDyslexic-Regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
```

That should hook up the download of your fonts to only be the necessary files. Browsers are good at only doing work when
they need to, especially networking requests.

## 4. Don't Require JS

This isn't too difficult based on the code in the previous examples, basically just make sure the defaults are right and
JS only makes differences from that. You can't set the `localStorage` without JS, so it's fine to use JS to control the
theme selection. I use React here, but the code can just be DOM + JS.

```tsx twoslash
import React, {  useState } from "react"

let hasLocalStorage = false
try { hasLocalStorage = typeof localStorage !== `undefined` } catch {}

export const Customize = () => {
  const customFontOverride = (hasLocalStorage && localStorage.getItem("force-font")) || "cascadia";
  const [fontValue, setFont] = useState(customFontOverride);

  const switchFont = (newStyle: string, old?: string) => {
    if (old) document.documentElement.classList.remove("font-" + old)
    document.documentElement.classList.add("font-" + newStyle)
  }

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.setItem("force-font", event.target.value);
    switchFont(event.target.value, customFontOverride);
    setFont(event.target.value);

    if ("playground" in window) document.location.reload();
  };

  return (
    <section id="customize">
      <article>
        <h3>Customize</h3>

        <label>
          <p>Code Font:</p>
          <div className="switch-wrap">
            <select name="font" value={fontValue} onChange={handleFontChange}>
              <option value="cascadia">Cascadia</option>
              <option value="cascadia-ligatures">Cascadia (ligatures)</option>
              <option value="consolas">Consolas</option>
              <option value="dank-mono">Dank Mono</option>
              <option value="fira-code">Fira Code</option>
              <option value="jetbrains-mono">JetBrains Mono</option>
              <option value="open-dyslexic">OpenDyslexic</option>
              <option value="sf-mono">SF Mono</option>
              <option value="source-code-pro">Source Code Pro</option>
            </select>
          </div>
        </label>
      </article>
    </section>
  );
};
```

That's it, all the pieces. Now you can have solid font switching in your webapp.
