# Contributing

## Release

To release a new version (using [semver](http://semver.org/), obviously):

```sh
git flow release start x.y.z
npm version x.y.z
# edit any other file / last minute fix
git add .
git commit -m 'bump version'
git flow release finish x.y.z
git push
git push --tags
```

> Note: there is a `postversion` rule in the *package.json* file that does the bump magic for you (updates REAME.md and CHANGELOG.md)

