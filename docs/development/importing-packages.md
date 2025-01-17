# Importing packages from other repos

This section describes how to import an existing package from another repository and keep its git commit history.

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [git-filter-repo](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md)

GH SSH authentication [has to be configured](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh) or alternatively the `--https` flag has to be used.

## Usage

Install `@exodus/migrate` globally (`npm i -g @exodus/migrate`), run `exodus-migrate` and specify the path to the repository, or subdirectory within the repository.

For the latter you can simply navigate to the subdirectory in the GH UI and copy the URL from your browser's
address bar. If the subdirectory does not contain a `package.json`, a basic `package.json` will be created on your
behalf. More info can be found in the [`@exodus/migrate` repository](https://github.com/ExodusMovement/exodus-migrate)

Examples:

```sh
# from a repository URL
exodus-migrate --url https://github.com/ExodusMovement/exodus-browser --target-dir modules/auto-enable-assets --scope @exodus --rename-tags


# from a subdirectory within a repository (can also be from a different branch than master)
exodus-migrate --url https://github.com/ExodusMovement/exodus-browser/tree/master/src/_local_modules/enabled-assets --target-dir modules/auto-enable-assets --scope @exodus --rename-tags
```

The script will replace the `repository`, `homepage`, and `bugs.url` properties in `package.json` to point to hydra
and set the homepage to the module's folder on master.

2. You should check for potentially broken badges in your README.md, no longer required ci folders,
   eslint configs, .gitignore files, and lockfiles on package level. `yarn postmigrate` can help to identify unwanted
   files and create new config files to extend the root configuration in this repository. If the last commit affects files inside the imported package's folder, `yarn postmigrate` will be able to determine the package automatically. Otherwise you can supply the module path manually: `yarn postmigrate modules/orders-monitor`.

3. Many `devDependencies` may no longer be required as they are hoisted to avoid duplication and use the same
   versions across all modules. Prune what you can from your imported module.

4. The changes cannot be merged using the GH UI without losing the history. Merging has to be done locally to `master`
   as fast-forward merge. This only works if no other PR has been merged in-between. Using the `--ff-only` flag will
   make git abort should a fast-forward merge not be possible. All the work was in vain then and you have to start over
   from `1.` Better be fast this time!

```bash
  git checkout master
  git merge $IMPORT_BRANCH --ff-only
```

5. Last, push to master directly.

Note: if your package is missing them you will most likely need to add `babel.config.js` and `jest.config.js`. `yarn postmigrate` also offers to add them (see 2.)
