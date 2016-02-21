module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
            dist: {
                files: {
                    'assets/stylesheets/bootstrap.css': 'assets/bootstrap/stylesheets/bootstrap.scss',
                    'assets/stylesheets/base.css': 'assets/stylesheets/base.scss'
                }
            }
        },
        autoprefixer: {
            single_file: {
                src: 'assets/stylesheets/base.css',
                dest: 'assets/stylesheets/base.css'
            }
        },
        watch: {
            source: {
                files: ['assets/**/*.scss'],
                tasks: ['sass', 'autoprefixer'],
                options: {
                    livereload: true, // needed to run LiveReload
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-livereload');
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.registerTask('default', ['sass', 'autoprefixer']);
};