# Use 'npm run deploy' will build when predeploy
git checkout gh-pages
cp -r build/* .
git add -A . && git commit -a -m ':construction_worker: Update gh-pages'
git push origin gh-pages --force && git checkout main