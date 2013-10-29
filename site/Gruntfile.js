module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat:{
    	vendor:{
    		src:['src/js/vendor/*.js'],
    		dest:'build/js/vendor.js'
    	},
    	app:{
    		src:['src/js/*.js'],
    		dest:'build/js/app.js'
    	}
    },
    sass:{
    	dist:{
        	options:{style:'compressed'},
        	files:{
          		'build/css/app.css':'src/css/app.scss',
          		'build/css/bootstrap.css':'src/css/bootstrap.scss',
        	}
        }
    },
    uglify:{
    	js:{
	    	files:{
	    		'build/js/vendor.js':'build/js/vendor.js',
	    		'build/js/app.js':'build/js/app.js',
	    	}
    	}
    },
    copy:{
    	html:{
          'cwd':'src/',
          'src':'*.html',
          'dest':'build',
          'expand':true
      	},
      	data:{
          'cwd':'src/data',
          'src':'**',
          'dest':'build/data',
          'expand':true
      	},
    },
    watch: {
  		scripts: {
    		files: ['src/**'],
    		tasks: ['default'],
    		options: {spawn: false}
  		}
	}
 });


  	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('default', ['concat', 'copy', 'sass']);
	grunt.registerTask('dev', ['default','watch']);
};

