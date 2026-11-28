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


### Current state of the art
Bash has been used for a long time and likely won't go away anytime soon since it's on every computer. There are new updates coming out still as it's an active project, with the recent update coming out in 2025 containing script performance improvements (https://www.linux-magazine.com/index.php/Issues/2026/305/Bash-5.3/(tagID)/32). There are also structured shells such as Nushell, which operates on data like tables and lists so you don't have to do so much string parsing - though they don't work with the same bash commands as normal shell scripts. You can also write scripts very similar to shell scripts in Javascript and Typescript using Bun Shell that works across Linux, Windows, and macOS. These updates and new tools coming out increase the safety and portability of shell scripts, so they can be used more often and more safely.

## Experiment - 

### What I Learned


### Sources & Research
To research this topic, I first looked at some blog posts talking about what shell scripting was and what it could do as well as the gnu guide for syntax and definition. I also asked AI for some high level definitions and what some possible things you can do with shell scripts are, so I could see the possibilities of what one could do with them. I also went back to the scripts used in the course to delve deeper and understand further what they do. 
https://www.coursera.org/articles/what-is-shell-scripting <br/>
https://www.gnu.org/software/bash/manual/bash.html#What-is-Bash_003f <br/>
https://pranabdas.github.io/drive/documents/technical-articles/shell-style-guide--Google.pdf  <br/>
https://www.spinellis.gr/blog/20200827/ <br/>
https://docs.gitlab.com/development/shell_scripting_guide/
