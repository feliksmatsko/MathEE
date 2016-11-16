'use strict';

var GulpConfig = (function () {
    function gulpConfig() {
        this.source = './src/';
        this.allTypeScript = this.source + 'ts/**/*.ts';
        this.tsOutputPath = this.source + 'js/';
        this.output = './dist/';

        this.test = './test/'
        this.specPath = this.test + '**/*.spec.js'
        this.testCoverage = this.test + 'coverage/'

        this.banner = {
            full :
                '/**\n' +
                ' * <%= pkg.name %> v<%= pkg.version %>\n' +
                ' * <%= pkg.description %>, by <%= pkg.author %>.\n' +
                ' * <%= pkg.repository.url %>\n' +
                ' */\n\n',
            min :
                '/**' +
                ' <%= pkg.name %> v<%= pkg.version %>, by <%= pkg.author %>' +
                ' | <%= pkg.repository.url %>' +
                ' */\n'
        };
    }
    return gulpConfig;
})();

module.exports = GulpConfig;
