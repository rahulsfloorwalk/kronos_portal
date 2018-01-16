
## frontend

1 first install all dependencies using `npm install`
2 execute `npm run build-prod` to run webpack and generate production ready bundles in the `dist` directory.
3 execute `npm run dev-server-hot` to run webpack dev server and serve the app at `http://0.0.0.0:8080`.
4 execute `npm run build` to run webpack and generate bundles in the `dist` directory and watch all project files for changes.

*Note*: make sure your editor overwrites the file in-place, instead of making a new file each time otherwise webpack wont be aable to watch for changes.
In Vim, this is achieved by `set backupcopy=yes`.
Please refer to your editor's documentation on how to do this.
