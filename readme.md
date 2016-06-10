# Sprint Replay #

## Feature ##

Feature Description

## Development ##

### Structure ###

```
/scripts            - Typescript code for extension
/img                - Image assets for extension and description
/typings            - Typescript typings

details.md          - Description to be shown in marketplace   
index.html          - Main entry point
vss-extension.json  - Extension manifest
```

### Usage ###

1. Clone the repository
1. `npm install` to install required local dependencies
2. `npm install -g grunt` to install a global copy of grunt (unless it's already installed)
2. `grunt` to build and package the application

#### Grunt ####

Three basic `grunt` tasks are defined:

* `build` - Compiles TS files in `scripts` folder
* `package` - Builds the vsix package
* `publish` - Publishes the extension to the marketplace using `tfx-cli`

Note: To avoid `tfx` prompting for your token when publishing, login in beforehand using `tfx login` and the service uri of ` https://market.visualstudio.com`.

#### Including framework modules ####

The VSTS framework is setup to initalize the requirejs AMD loader, so just use `import Foo = require("foo")` to include framework modules.

#### VS Code ####

The included `.vscode` config allows you to open and build the project using [VS Code](https://code.visualstudio.com/).
