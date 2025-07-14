# YouTube to Discord Soundboard File

[The official hosted version of the app can be found here](https://youtube-soundbyte.com)

This application is a simple tool that allows you to take a YouTube video, trim it, and download the trimmed audio file.

It is written using React + Vite for front end + Express for file processing on the backend server.

The backend server is under `server/app.js` and uses the `nodemon` npm package to run it with hot reloading. But you can run normally with `node`.

> [!NOTE]
> Install the latest NodeJS version (or 20.18) for best results. You can check which version you have in the terminal with `node -v`.

Install `nodemon` globally via `npm install -g nodemon`, with administrator rights if necessary.

To run locally, cd into the directory and run:

```
npm install
```
This will install dependencies.

```
nodemon server/app.js
```
This will run the backend Express server

In a separate terminal:

```
npm run dev
```

This will start up a local development server on a specific localhost port, as well as the Express API on port 3000.
