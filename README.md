1. Replace the empty /craft/ directory with your craft install
2. Optionally configure apache/etc to point to your /site/ directory


## Craft Foundation 6 Sass/Gulp Starter Config
#### Configuration starter kit for Sassy  [Foundation 6](http://foundation.zurb.com/sites/docs/) with [CraftCMS](http://craftcms.com/) 2 OR 3  

With this simple configuration you will be able to
- add Foundation 6 to your Craft site
- save hours of time in your front-end development
- get live previews in the browser while developing without ever hitting reload (browser-sync)

You can get Foundation 6 a plethora of ways, we use the foundation-cli as a dependency because it plays well with the new es2015 transforms and babel.

You can `$ npm install --global foundation-cli` and then use this repository in your vhost dir or you can grab/setup Foundation 6 one of the many other ways and copy over the `_settings.scss` file into your `/src/` yourself.

[Foundation Cli Installation Guide](http://foundation.zurb.com/sites/docs/installation.html)  
[foundation-sites on github](https://github.com/zurb/foundation-sites)  

**Note**: this is simply a jumping off point for those looking to work with Foundation in Craft. there are hundreds of ways to do this, if you have an idea - please feel free to add to or correct this repo.   

#### Setup:  
#####Step 1.

    git clone https://github.com/fndaily/craft-foundation-6 your_project_dir
    cd your_project_dir
    bower install
    npm install
    cp bower_components/foundation-sites/scss/settings/_settings.scss src/scss/_settings.scss

#####Step 2.
    Grab a copy of Craft CMS and replace the /craft/ directory with your newly downloaded copy.

#####Step 3.
    Optionally, update "http://YOURDOMAIN.dev" in `gulfile.babel.js`

********************

**Directory Structure**:

- `/bower_components`
    - `/foundation-sites`
    - `/jquery`
    - `/motion-ui`
    - `/what-input`
- `/craft/` - where you put your craftcms installation    
- `/site/` - where you point apache
    - `/lib` - compiled when you run `foundation watch` or `foundation build`
- `/src`
    - `/fonts`
    - `/gr`
    - `/js`
        - `/app.js` - adds $(document).foundation(); at the end of your compiled js
    - `/scss` - source foundation 6 sass files
        - `/components` - your custom sass/css goes inside here
        - `/mixins` - your custom mixins go inside here
        - `/_settings.scss`  
        - `/app.scss`
    - `/svg`
- `/bower.json` - build configuration for your `/bower_components/`
- `/config.yml` - central config file to manage your build paths and foundation modules
- `/gulpfile.babel.js` - where it all comes together - update according to your needs
- `/package.json` - build configuration for your `/node_modules/`
- `/README.md` - this file =)
