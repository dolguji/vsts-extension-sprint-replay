module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            build: {
                src: ["scripts/**/*.ts", "scripts/**/*.tsx"],
                tsconfig: true
            },
            options: {
                fast: 'never'
            }
        },
        exec: {
            package: {
                command: "tfx extension create --manifest-globs vss-extension.json",
                stdout: true,
                stderr: true
            },
            publish: {
                command: "tfx extension publish --service-url http://marketplace.visualstudio.com --manifest-globs vss-extension.json",
                stdout: true,
                stderr: true
            },
            publishDev: {
                command: "tfx extension publish --service-url http://localhost:8080/tfs --manifest-globs vss-extension.json",
                stdout: true,
                stderr: true
            }
        },
        copy: {
            scripts: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ["node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js"],
                    dest: "dist",
                    filter: "isFile"
                }]
            },
            css: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ["node_modules/font-awesome/css/font-awesome.min.css"],
                    dest: "css",
                    filter: "isFile"
                }]
            },
            fonts: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ["node_modules/font-awesome/fonts/fontawesome-webfont.woff", "node_modules/font-awesome/fonts/fontawesome-webfont.eot"],
                    dest: "fonts",
                    filter: "isFile"
                }]
            }
        },

        watch: {
            scripts: {
                files: ["scripts/**/*.ts", "scripts/**/*.tsx", "index.html", "css/*.css"],
                tasks: ["publish"],
                options: {
                    spawn: false,
                },
            },
        },
        clean: ["scripts/**/*.js", "*.vsix", "dist"]
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("build", ["ts:build", "copy:scripts", "copy:css", "copy:fonts"]);
    grunt.registerTask("package", ["build", "exec:package"]);
    grunt.registerTask("publish", ["package", "exec:publishDev"]);

    grunt.registerTask("default", ["build"]);
};