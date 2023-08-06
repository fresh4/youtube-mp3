# YouTube to Discord Soundboard File

This application is a simple tool that allows you to take a YouTube video, trim it, and download the trimmed audio file.

It is written using React + Express with Vite.

The backend server is under `server/app.js` and uses the `nodemon` npm package to run it with hot reloading.

Installed `nodemon` globally via `npm install -g nodemon`, with administrator rights if necessary.

To run locally, cd into the directory and run:

```
npm install
nodemon server/app.js
```

In a separate terminal:

```
npm run dev
```

This will start up a local development server on a specific localhost port, as well as the Express API on port 3000
