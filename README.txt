DEPLOY (important - drag-and-drop of the unzipped folder will NOT build the backend):
1. Put this folder on GitHub (or use Netlify CLI: npm i -g netlify-cli, then `netlify deploy --prod`).
2. Netlify > Add new site > Import from Git > pick the repo. No build command needed. Publish dir: .
3. Netlify installs @netlify/blobs and the upload/storage backend works automatically.
