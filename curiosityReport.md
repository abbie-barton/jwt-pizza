# Curiosity Report: Shell Scripts
### Why I Was Curious
For my curiosity report I decided to focus on shell scripts. A couple of times in this class we've used shell scripts to populate the 
database or deploy the service, and I was curious about what the other possibilities were with shell scripts. Since one of the creeds
of this class is automation, I was wondering how far shell scripts could take that and how I could use it in my day to day. I want to dive 
into what can be automated with shell scripts and what some of their potential benefits and drawbacks are.

### What are Shell Scripts?
Shell scripts are scripts that can run inside the shell, which is what runs commands inside the terminal. There are different kinds of shells, like bash or zsh that work on different operating systems. A shell script can be a string or a document filled with the commands that one would type into the shell one at a time, so that you can save it and run them with one command - an example is the deployService.sh file in this repository. They are great at automating exact, long tasks that you would usually do by hand. 

There are some things that are more common uses for shell scripts, such as scheduled jobs, testing, or for use with GitHub Actions (where the run jobs in our ci.yml are all shell scripts). They can be used for testing by running test commands as well as potentially changing environment variables when running, so you can test multiple versions of your app with different information. Since they have user access, they can also automate health checks like checking disk space, memory usage, and CPU use. They can also be helpful in creating scheduled file backups and doing data processing - a lot of things that can be rote and take a long time by hand.


### Risks
Since shell scripts run with all of the permissions of the user, they have inherent security risks - it's dangerous to run one where you don't know exactly what it does. The Google shell style guide mentions that in most cases, shell scripts aren't the best choice - they don't have the best performance and shouldn't be doing tasks dealing with a lot of data manipulation, and shouldn't be used when the script is longer than about 100 lines. The GitLab shell scripting docs recommend avoiding shell scripts where possible (though they are still used in development) because higher level languages usually have more capability and understandability. 

### Sources
https://www.gnu.org/software/bash/manual/bash.html#What-is-Bash_003f 
https://pranabdas.github.io/drive/documents/technical-articles/shell-style-guide--Google.pdf 
https://www.spinellis.gr/blog/20200827/ 
