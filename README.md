
# Yuubib GitHub Pages Web

This project is now configured as a Vite + React single-page app that can be deployed to GitHub Pages from the repository `https://github.com/yuubib/yuubib.git`.

The site target URL is:

`https://yuubib.github.io/yuubib/`

## Local development

Run `npm i` to install dependencies.

Run `npm run dev` to start the development server.

## Build for GitHub Pages

Run `npm run build:pages` to generate a production build with the `/yuubib/` base path.

## Automatic deployment

A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.

Push to the `main` branch and GitHub will build and publish the `dist/` output to GitHub Pages.

If this is the first deployment for the repository, make sure Pages is enabled in the repository settings and the build source is set to `GitHub Actions`.
  
