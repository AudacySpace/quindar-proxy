# Contributing to Quindar Proxy

This guide covers ways in which you can become a part of the ongoing development of Quindar Proxy. Outlined in this file are:
* Reporting an Issue
* Contributing to the Quindar code

## Code of Conduct

Quindar is committed to fostering a welcoming, collaborative and passionate community. If you encounter any unacceptable behavior, follow these steps to report the issue to the Quindar team. We are here to help. Our standards is to use welcoming and inclusive language, being respectful of differing viewpoints, accepting constructive criticism, showing empathy towards other community members, and focusing on what is best for the community. As contributors and maintainers of the Quindar, we pledge to respect everyone who contributes by posting issues, updating documentation, submitting pull requests, providing feedback in comments, and any other activities.

Communication through any of Quindar's channels (GitHub, IRC, mailing lists, Google+, Twitter, etc.) must be constructive and never resort to personal attacks, trolling, public or private harassment, insults, or other unprofessional conduct. We promise to extend courtesy and respect to everyone involved in this project regardless of gender, gender identity, sexual orientation, disability, age, race, ethnicity, religion, or level of experience. We expect anyone contributing to Quindar to do the same. If any member of the community violates this code of conduct, the maintainers of Quindar may take action, removing issues, comments, and PRs or blocking accounts as deemed appropriate.

If you are subject to or witness unacceptable behavior, or have any other concerns, please email us at quindar@quindar.space.


## Reporting an Issue
Quindar uses GitHub Issue Tracking to track issues (primarily bugs). 
If you found a bug,
* Ensure that the bug was not previously reported by searching on Github under [Issues](https://github.com/quindar/quindar-proxy/issues).
* If you are unable to find an existing open issue, open a new issue. It should have a clear and descriptive title, steps to reproduce the issue, expected and actual behavior. Include code samples, screenshots wherever needed.

## Contributing to the Quindar code
### Folder Structure
* /app - NodeJS server folder
  * /app/model - stores MongoDB models
  * /app/routes - stores the API routes for the application
  * /app/scripts - stores scripts for parsing excel file and socket stream
  * /app/uploads - stores sample configuration excel file
* /public - static public folder
  * /css - stores CSS files of the application
  * /scripts - stores JS scripts(Bootstrap, Gridster)
* /views - stores the HTML pages

### Clone the Repositories
There are two repositories needed to deploy the Quindar Proxy project locally. 
* Quindar-deploy
* Quindar-proxy

Clone the two repositories in a single folder, such as ~/repositories

    cd ~
    mkdir repositories
    cd repositories
    git clone https://github.com/quindar/quindar-deploy.git
    git clone https://github.com/quindar/quindar-proxy.git
    
### Build and Run Docker container for Quindar GUI
Follow steps to build and deploy the container on localhost. Shared Drives feature of Docker is used to create a developer environment, where in the changes in your code are reflected on the docker container running locally on your computer.

    cd quindar-deploy/qsvr-backend
    docker build -t "quindar-qsvr" .
    cd ../../quindar-proxy
    npm install
    docker run -d -t --name qsvr --cap-add SYS_PTRACE -v /proc:/host/proc:ro -v /sys:/host/sys:ro -v $(pwd):/node/ -p 80:80 -p 443:443 -p 27017:27017 quindar-qsvr

The UI should be up and running on: http://localhost. Click on Login to get started. Use **mongodb://admin@localhost** as connection string to use the local Mongo database.

Notes:

1. $(pwd) is the present working directory which over here is the path on your local machine to quindar-proxy repository. Windows users can replace $(pwd) with the absolute path to the quindar-proxy directory. 

2. For Windows users, enable Shared Drives in Docker settings to use the above docker run command.

### Building new features/bug fixes for Quindar Proxy
1. Create your own branch

    git checkout -b <your_branch_name>

2. Write/Edit the code in your own branch.
3. Manually test the code as changes would be reflected in the browser (https://localhost).
4. Commit the changes using a descriptive commit message.
        
        git add <filename(s)>
        git commit -m "<commit message>"

5. Update your branch, as they are likely to be changes in the base branch since you started working.

        git checkout master
        git pull --rebase
        git checkout <your_branch_name>
        git rebase master

    Check for the conflicts after rebasing with the latest changes on master.
6. Fork the Quindar repository and push your branch to remote.
7. Issue a pull request for your code changes to be merged with the Quindar repository. Refer this [link](https://help.github.com/articles/creating-a-pull-request-from-a-fork/) for the documentation.


## To Do

* improved user interface based on Angular
* QUindar netdash telemetry as a data source
* security hardening
* admin / user management functions


