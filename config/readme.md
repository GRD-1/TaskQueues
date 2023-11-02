# configs

The configs in this application are organized using the node-config library: https://www.npmjs.com/package/config. 
It lets you define a set of default parameters, and extend them for different deployment environments (development, qa, staging, production, etc.).

* The name of current application's deployment (dev, prod e t.c.) is stored in the __[process.env.NODE_ENV]__ variable. 
It is defined in the application start script: npm run start-dev (start-prod).


* Files in the config directory are loaded in the following order:
  * default.EXT             - base configuration parameters
  * {deployment}.EXT        - parameters specified for deployment (development, production e t.c.)
  * local-{deployment}.EXT  - credentials. Not tracked by the version control system


* Each file overwrites the parameters with the same keys in the previous one. 
For example: parameter __[Host]__ from default.ext will be overwritten by parameter __[Host]__ from deployment.EXT. 
The details are here: https://github.com/node-config/node-config/wiki/Configuration-Files


* To get the configs from the code import it: [ import config from 'config' ]
* To get the specific value use: [ config.get('VariableName') ] or you can use the dot notation [ config.VariableName ]
* To check if the config parameter exists use: config.has('VariableName') 


# git tracking

git tracking has been disabled for these files:
  * config/local-development.cjs
  * config/local-production.cjs
  * config/local-test.cjs

It was done not by the gitignore file, but with the help of a special git command
Otherwise, git will delete such files while downloading the updates from the repository.
So, the current files will not be updated from git, but if we change it, git will not allow to update the project using the [ pull ] command.
it will warn us, that there are unsaved files. In order to avoid it:
• before changes enable the change tracking using the command:

    git update-index --no-assume-unchanged <filepath/filename>

• change the file
• and disable the tracking again: 

    git update-index --assume-unchanged <filepath/filename>
