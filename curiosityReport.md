# Curiosity Report: Shell Scripts
### Why I Was Curious
For my curiosity report I decided to focus on shell scripts. A couple of times in this class we've used shell scripts to populate the 
database or deploy the service, and I was curious about what the other possibilities were with shell scripts. Since one of the creeds
of this class is automation, I was wondering how far shell scripts could take that and how I could use it in my day to day. I want to dive 
into what can be automated with shell scripts and what some of their potential benefits and drawbacks are.

### What are Shell Scripts?
Shell scripts are scripts that can run inside the shell, which is what runs commands inside the terminal. There are different kinds of shells, like bash or zsh that are native on different operating systems. A shell script is a text file filled with the commands that one would type into the shell one at a time, so that you can save it and run them with one command - an example is the deployService.sh file in this repository. They are great at automating exact, long tasks that you would usually do by hand. 

There are some things that are more common uses for shell scripts, such as scheduled jobs, testing, or for use with GitHub Actions (where the run jobs in our ci.yml are all shell scripts). They can be used for testing by running test commands as well as potentially changing environment variables when running, so you can test multiple versions of your app with different information. Since they have user access, they can also automate health checks like checking disk space, memory usage, and CPU use. They can also be helpful in creating scheduled file backups and doing data processing - a lot of things that can be rote and take a long time by hand.


### Risks
Since shell scripts run with all of the permissions of the user, they have inherent security risks - it's dangerous to run one where you don't know exactly what it does. The Google shell style guide mentions that in most cases, shell scripts aren't the best choice - they don't have the best performance and shouldn't be doing tasks dealing with a lot of data manipulation, and shouldn't be used when the script is longer than about 100 lines. The GitLab shell scripting docs recommend avoiding shell scripts where possible (though they are still used in development) and to use them only where needed to keep dependencies small.


### Current state of the art
Bash has been used for a long time and likely won't go away anytime soon since it's nearly every Linux and Mac computer. There are new updates coming out still as it's an active project, with the recent update coming out in 2025 containing script performance improvements (https://www.linux-magazine.com/index.php/Issues/2026/305/Bash-5.3/(tagID)/32). There are also structured shells such as Nushell, which operates on data like tables and lists so you don't have to do so much string parsing - though they don't work with the same bash commands as normal shell scripts. You can also write scripts very similar to shell scripts in Javascript and Typescript using Bun Shell that works across Linux, Windows, and macOS. These updates and new tools coming out increase the safety and portability of shell scripts, so they can be used more often and more safely.

## Experiment
### Downloads Folder Management
This experiment deals with shell scripts and file management and cron jobs. The steps below are specifically for a Mac. 

This script can go anywhere on your computer, and will sort files in the given folder into several sections that can be customized to whatever names and file extensions you want. I put the script in a 'scripts' folder, and we will name it organize.sh. Line 10 ensures that the script sorts both lowercase and uppercase file extensions, like .PDF and .pdf. Line 13 looks at files that are currently downloading and skips them. The code uses a for loop to look at every file in the folder we're looking at and places them in the correct destination according to lines 13-18. These can be changed to different names or types. It then moves all of the files into the correct folder, without creating a new folder if the destination already exists. 
```bash
#!/bin/bash
# usage: ./organize.sh [folder]  

DIR="${1:-$HOME/Downloads}"

for file in "$DIR"/*; do
  [ -f "$file" ] || continue            

  ext="${file##*.}"
  ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"  

  case "$ext" in
    crdownload|part|download|tmp) continue ;;  
    pdf|docx|doc|txt|pptx|xlsx)  dest="Documents" ;;
    jpg|jpeg|png|gif|heic|webp)  dest="Pictures" ;;
    zip|tar|gz|rar)              dest="Archives" ;;
    dmg|pkg)                     dest="Installers" ;;
    *)                           dest="Other" ;;
  esac

  mkdir -p "$DIR/$dest"
  mv -n "$file" "$DIR/$dest/"          
  echo "$(date '+%F %T') moved $(basename "$file") -> $dest"
done
```
We then need to add permissions so that we can run the file: `chmod +x ~/scripts/organize.sh`, where you replace the directory with where you put your organize.sh script. After this, I tested on a test folder with multiple file types to make sure the script worked - the following code is targeting a `test-downloads` folder in the same directory as the `scripts` folder.
```bash
mkdir -p ~/scripts ~/test-downloads
cd ~/test-downloads
touch report.pdf photo.JPG notes.txt app.dmg stuff.zip random.xyz halfdone.crdownload
~/scripts/organize.sh ~/test-downloads
ls -R ~/test-downloads
```
Each file should be moved into a matching folder (Documents, Pictures, Installers, Archives, Other), and `halfdone.crdownload` should stay where it is, since it represents a file that's still downloading.

To add scheduling to this script, I first tried cron, but it couldn't access my folder because of macOS privacy restrictions, and Apple recommends launchd instead, so I switched. To do this, run `nano ~/Library/LaunchAgents/com.NAME.organize.plist` and paste in the following code, replacing `/Users/YOURNAME` with your correct path (lines 11-12, 17) and `com.NAME.organize` on line 6 with the name you put in the command above. 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.NAME.organize</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/YOURNAME/scripts/organize.sh</string>
    <string>/Users/YOURNAME/test-downloads</string>
  </array>

  <key>WatchPaths</key>
  <array>
    <string>/Users/YOURNAME/test-downloads</string>
  </array>

  <key>StandardOutPath</key>
  <string>/tmp/organize.out</string>
  <key>StandardErrorPath</key>
  <string>/tmp/organize.err</string>
</dict>
</plist>
```
Run this command to turn on the job: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.NAME.organize.plist`. Now, when we put a new file into our test-downloads folder, the code will automatically sort it into the folders specified by the shell script. Drag a file into the test-downloads folder and run `cat /tmp/organize.out` and `cat /tmp/organize.err` to see if it worked. If it doesn't work (this happened to me), you might need to add `/bin/bash` to the access list for Full Disk Access in System Settings (this does give every bash script full disk access, so it is something to be careful with). `cat /tmp/organize.out` should show which files got sorted into which folders. At this point, we have a working shell script and launchd job.

To turn it off, run the below code and turn off `/bin/bash` access in your disk access settings.
```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.NAME.organize.plist
rm ~/Library/LaunchAgents/com.NAME.organize.plist
```

### What I Learned
Shell scripts seem like they might be simple or not used for much on the surface, but it would take a lot to become an expert on how to use them and the multitude of different ways they can be used. Even this short script required a lot of messing with settings and bug hunting, which is more difficult since it's not a high level language in a code editor. The code needed can also vary between which OS you're using, so that's another thing to keep in mind. Overall, I learned a lot about some of the complexities of shell scripting and touched the surface on the sorts of things you can do, as well as the benefits and drawbacks of doing so. For example, my first version only sorted lowercase extensions and moved files while they were still downloading. I also learned that macOS can use cron, but prefers launchd which watches a folder instead of running the script at a certain time - but to get it to work I had to give `/bin/bash` full access to the disk which I wasn't super comfortable with leaving on.


### Sources & Research
To research this topic, I first looked at some blog posts talking about what shell scripting was and what it could do as well as the gnu guide for syntax and definition. I also asked AI for some high level definitions and what some possible things you can do with shell scripts are, so I could see the possibilities of what one could do with them. I also went back to the scripts used in the course to delve deeper and understand further what they do. <br/>
https://www.coursera.org/articles/what-is-shell-scripting <br/>
https://www.gnu.org/software/bash/manual/bash.html#What-is-Bash_003f <br/>
https://pranabdas.github.io/drive/documents/technical-articles/shell-style-guide--Google.pdf  <br/>
https://www.spinellis.gr/blog/20200827/ <br/>
https://docs.gitlab.com/development/shell_scripting_guide/
