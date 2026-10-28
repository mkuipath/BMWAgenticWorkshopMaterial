# BMW Agentic Automation Workshop – Materials Hub

A static website for workshop participants. It lists the five topics in order
(Cartographer, Delegate, Coding Agents, Coded App, Maestro Flow) and, for each one,
only the sections that exist: overview, prerequisites, setup, files, prompts, deploy.

Everything is served from this repository through GitHub Pages. No UiPath account is
needed to open the hub or download the files.

## Live site

https://maheshuipah.github.io/BMWAgenticWorkshopMaterial/

Every push to `main` rebuilds the site and publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves (see `.github/workflows/pages.yml`).

## Sign-in page

The first screen asks for a name and a workshop password. Any name and any non-empty
password are accepted. It is a name prompt, not an access control: the name is stored in
the participant's browser and used to label their progress. Progress, checklist ticks and
the "Your values" placeholders are also stored in the browser only.

## Editing content

| What | Where |
|---|---|
| Topic text, prerequisites, setup steps, prompts | `src/data/topics.ts` |
| Downloadable files | `public/files/<topic>/...` (the `path` field in `topics.ts` must match) |
| Colours and layout | `src/index.css` |
| Sign-in page | `src/components/Login.tsx` |

To add or replace a file: drop it under `public/files/<topic>/`, add or update its entry in
`topics.ts` (name, path, size, description), commit and push.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
```
