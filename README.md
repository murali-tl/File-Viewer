#                                              Study

1. `File API`

#                                           FileViewer

Write a class named `FileViewer`, capable of

1. `cd <DIR>`          - Change Directory

        a. Cases:

            i. <DIR> missing: “Please specify directory”

            ii. <DIR> invalid: “Directory invalid”

            iii. <DIR> = ‘..’ - Move to parent directory

2. `pwd`                - Present Working Directory (last ‘cd’ location)

        a. Cases:

            i. User did not use ‘cd’: “Not specified directory yet”

3. `ls <ARG>`           - List folders/files in ‘pwd’

        a. Cases

            i. <ARG> not specified - Show all folders and files

            ii. <ARG> = ‘-a’ - Show just the hidden files

            iii. <ARG> = ‘-G’ - Group folders & files separately Output: Folders: -----
                ----- “dir1"/ “dir2”/ “dir3”/ “dir4”/ Files: ------ “File1.pdf” “Group1 
                Results.txt”

            iv. <ARG> = ‘-fi’ - List just the files

            v. <ARG> = ‘-dir’ - List just the directories/folders

            vi. <ARG> = ‘-fiG’ - List just the files in groups of their extensions

        b. Error Cases:

            i. All cases of ‘pwd’

            ii. Preferably 2 items per row

4. `cat <FIL> -<ARG>`   - List first <ARG> lines of file (Support for only .TXT files)

        a. Cases:

            i. <ARG> not specified - List first 5 lines of file

            ii. <ARG> specified - List <ARG> lines (if exist)

            iii. <FIL> missing: “Please specify file”

            iv. <FIL> invalid: “File invalid”

5. `find <NAME> -<ARG>` - Find the files containing <NAME> 

    a. Cases:

            i.  <NAME> missing - ‘Please specify name to search’

            ii. <ARG> missing or is ‘c’- Return files/folders containing <NAME>

            iii. <ARG> = ‘s’ - Return files starting with <NAME>

            iv. <ARG> = ‘e’ - Return files ending with <NAME>

6. All the commands must handle `--help` argument, it should print the usage description of the command.

    a. Example:

    i. `$ cd --help`

        1. Prints -> `User’s current directory`

7. `history <count>`:

    a. print <count> latest commands (no need to persist), default count is 5

8. `log <options>` - Logs commands from the log file location

    a. `log --start <path>` - start logging and the save the log at given path. Ex: log --start         
        C:/Users/UserName/log.txt

    b. `log --all` - print all commands from the current log file

    c. `log --tail 9` - print last 9 commands from the current log file

    d. `log --head 9` - print first 9 commands from the current log file

    e. `log --clear` - clears all logs from the current log file

    f. `log --stop` - stops logging commands but keep the current log file
