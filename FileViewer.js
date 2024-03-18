class Log {
    constructor(filePath) {
        this.path = filePath;
        this.logList = [];
        this.fs = require('fs');
    }

    printTopNLines = (size) => {
        if (this.logList.length) {
            for (let count = 0; count < (Math.min(size, this.logList.length)); count++) {
                console.log(this.logList[count][0], this.logList[count][1], this.logList[count][2]);
            }
        }
        else {
            Console.log('No Logs found...\n');
        }
    }

    printLastNLines = (size) => {
        if (this.logList.length) {
            for (let count = this.logList.length - 1; count >= (Math.max(0, this.logList.length - size)); count--) {
                console.log(this.logList[count][0], this.logList[count][1], this.logList[count][2]);
            }
        }
        else {
            Console.log('No Logs found...\n');
        }
    }
    appendDataToFile = (data) => {
        try {
            this.fs.appendFileSync(this.path, data);
        }
        catch (err) {
            Console.log('Error: error writing to file at given path');
        }
    }
    clearFileData = () => {
        try {
            this.fs.writeFileSync(this.path, '');
        }
        catch (err) {
            Console.log('Error: error Clearing data in file at given path');
        }
        this.appendDataToFile('S.No.\tTimeStamp  \tCommand\n');
        this.logList = [];
    }
}

class Constants {
    static LOG = 'log';
    static HISTORY = 'history';
    static HELP = '--help';
    static HELP_SHORT = '-h';
    static HEAD = '--head';
    static TAIL = '--tail';
    static LOG_START = '--start';
    static LOG_STOP = '--stop';
    static LOG_CLEAR = '--clear';
    static LOG_ALL = '--all';
    static EXIT = 'exit';
    static CHANGE_DIR = 'cd';
    static LIST = 'ls';
    static FIND = 'find';
    static CAT = 'cat';
    static PRESENT_DIR = 'pwd';
    static HIDDEN_FILES = '-a';
    static FILES = '-fi';
    static DIRECTORIES = '-dir';
    static FILES_FOLDERS = '-G';
    static EXTENSION_GROUP = '-fiG';
    static FILE_START = 's';
    static FILE_END = 'e';
    static FILE_CONTAIN = 'c';
}

const path = require('path');

class FileViewer {
    constructor() {
        this.directoryPath = __dirname.replace('\\','/');
        //console.log(this.directoryPath,'\\');
        this.fs = require('fs');
        this.filesDict = { 'Files': [], 'Folders': [] };
        this.historyList = [];
        this.availableFiles = [];
        this.logIndex = 0;
        this.logFlag = 0;
        this.logObj = null;
        this.isLogUsedBefore = false;
        this.commandDesc = {
            [Constants.CHANGE_DIR]: 'cd <DIR>        - Change Directory \nCases: \n<DIR> missing: “Please specify directory” \n<DIR> invalid: "Directory invalid" \n<DIR> = ".." - Move to parent directory ',
            [Constants.PRESENT_DIR]: 'pwd         - Present Working Directory (last "cd" location) \nCases: \nUser did not use "cd": "Not specified directory yet" ',
            [Constants.LIST]: 'ls <ARG>       - List folders/files in "pwd"\nCases \n<ARG> not specified - Show all folders and files \n<ARG> = "-a" - Show just the hidden files \n<ARG> = "-G" - Group folders & files separately Output: Folders: ---------- "dir1"/ "dir2"/ "dir3"/ "dir4"/ Files: ------ "File1.pdf" "Group1 Results.txt" \n<ARG> = "-fi" - List just the files \n<ARG> = "-dir" - List just the directories/folders \n<ARG> = "-fiG" - List just the files in groups of their extensions ',
            [Constants.CAT]: 'cat <FIL> -<ARG>      - List first <ARG> lines of file (Support for only .TXT files \nCases:  \n<ARG> not specified - List first 5 lines of file \n<ARG> specified - List <ARG> lines (if exist) \n<FIL> missing: "Please specify file" \n<FIL> invalid: "File invalid" ',
            [Constants.FIND]: 'find <NAME> -<ARG> - Find the files containing <NAME>  \nCases: \n<NAME> missing - "Please specify name to search" \n<ARG> missing or is "c"- Return files/folders containing <NAME> \n<ARG> = "s" - Return files starting with <NAME> \n<ARG> = "e" - Return files ending with <NAME> ',
            [Constants.LOG]: '`log <options>` - Logs commands from the log file location \n  \u2023`log --start <path>` - start logging and the save the log at given path. Ex: log --start C:/Users/UserName/log.txt \n  \u2023`log --all`         - print all commands from the current log file \n  \u2023`log --tail 9`      - print last 9 commands from the current log file \n  \u2023`log --head 9`   - print first 9 commands from the current log file \n  \u2023`log --clear`      - clears all logs from the current log file \n  \u2023`log --stop`       - stops logging commands but keep the current log file ',
            [Constants.HISTORY]: '`history <count>`: \n  \u2023print <count> latest commands (no need to persist), default count is 5'
        };
        this.showFiles();
    }

    handleCommand(command) {
        if (command === '' || command === null) {
            console.log('Please enter some valid command\n');
            return false;
        }
        if (command === Constants.EXIT) { return true; }
        let commandArr = command.split(' ');
        commandArr = this.removeEmptys(commandArr);
        //console.log(commandArr);
        if (commandArr[commandArr.length - 1] === Constants.HELP || commandArr[commandArr.length - 1] === Constants.HELP_SHORT) {
            this.help(commandArr);
        }
        else if (commandArr[0] === Constants.CHANGE_DIR) {
            commandArr.shift();
            this.changeDirectory(commandArr);
        }
        else if (commandArr[0] === Constants.PRESENT_DIR) {
            if (this.directoryPath)
                console.log(this.directoryPath);
            else
                console.log('Not specified directory yet');
        }
        else if (commandArr[0] === Constants.LIST) {
            this.listFiles(commandArr[1]);
        }
        else if (commandArr[0] === Constants.CAT) {
            this.displayFile(commandArr);
        }
        else if (commandArr[0] === Constants.FIND) {
            this.findFile(commandArr);
        }
        else if (commandArr[0] === Constants.HISTORY) {
            this.getHistory(commandArr[1]);
        }
        else if (commandArr[0] === Constants.LOG) {
            this.logger(command);
        }
        else {
            console.log('Invalid Command!!!');
        }
        this.historyList.push(command);
        if (this.logIndex && this.logFlag) {
            this.logObj.logList.push([this.logIndex - 1, Date.now(), command]);
            if (this.logIndex !== 1)
                this.logObj.appendDataToFile(this.logObj.logList[this.logObj.logList.length - 1].join('\t') + '\n');
            else if (!this.isLogUsedBefore) { this.logObj.appendDataToFile('S.No.\tTimeStamp  \tCommand\n') }
            this.logIndex++;
        }
    }

    removeEmptys(commandArr) {
        let index = 0;
        while (index < commandArr.length) {
            if (commandArr[index] === '') {
                commandArr.splice(index, 1);
                index--;
            }
            index++;
        }
        return commandArr;
    }

    changeDirectory = (commandArr) => {
        if (commandArr.length === 0) { console.log('Please specify directory'); return; }
        try {
            if (this.fs.statSync(path.join(this.directoryPath, commandArr.join(' '))).isDirectory()) {
                this.directoryPath = path.join(this.directoryPath, commandArr.join(' '));
                this.showFiles();
            }
            else { console.log('Directory invalidd'); }
        }
        catch (err) {
            console.log('Directory invalid');
        }

    }

    listFiles = (args) => {
        if (args === undefined) {
            this.printArray(this.availableFiles);
        }
        else if (args === Constants.HIDDEN_FILES) {
            let result = this.showHiddenFiles();
            if (result.length) {
                this.printArray(this.showHiddenFiles());
            }
            else {
                console.log('No hidden files found');
            }
        }
        else if (args === Constants.FILES_FOLDERS) {
            this.printFilesAndFolders('Files');
            this.printFilesAndFolders('Folders');
        }
        else if (args === Constants.FILES) {
            this.printFilesAndFolders('Files');
        }
        else if (args === Constants.DIRECTORIES) {
            this.printFilesAndFolders('Folders');
        }
        else if (args === Constants.EXTENSION_GROUP) {
            let extensionDict = {};
            for (let file of this.filesDict['Files']) {
                if (path.extname(file) in extensionDict) { extensionDict[path.extname(file)].push(file); }
                else { extensionDict[path.extname(file)] = [file]; }
            }
            for (let key in extensionDict) {
                console.log(key, 'files:');
                this.printArray(extensionDict[key]);
                console.log('\n');
            }
            //console.log(extensionDict);
        }
        else {
            console.log('Invalid "ls" command.');
        }
    }

    showFiles = () => {
        this.filesDict = { 'Files': [], 'Folders': [] };
        try{
        const filenames = this.fs.readdirSync(this.directoryPath);
        filenames.forEach(file => {
            if (this.fs.statSync(path.join(this.directoryPath, file)).isFile()) { this.filesDict['Files'].push(file); }
            else if (this.fs.statSync(path.join(this.directoryPath, file)).isDirectory()) { this.filesDict['Folders'].push(file); }
        });
        this.availableFiles = filenames;
       }
       catch(err){
        //console.log('Directory invalid');
       }
        //return this.filesDict;
    }

    printArray(arr) {
        if(!arr.length){console.log('\u2023List Empty.'); return ;}
        for (let index = 0; index < arr.length; index += 2) {
            let str = '';
            str += (arr[index] + '\t');
            if (index + 1 < arr.length) {
                str += arr[index + 1];
            }
            console.log(str);
        }
    }

    printFilesAndFolders = (string) => {
        console.log(string, ':');
        this.printArray(this.filesDict[string]);
    }


    showHiddenFiles() {
        let hiddenList = [];
        for (let file of this.filesDict['Files']) {
            if (file.startsWith('.')) { hiddenList.push(file) };
        }
        return hiddenList;
    }

    displayFile(commandArr) {
        if (commandArr.length < 2) {
            console.log('Please specify file');
            return;
        }
        if (path.extname(commandArr[1]) !== '.txt') {
            console.log('File Invalid. Only .txt are supported');
            return;
        }
        this.readFile(commandArr[1], commandArr[2])
    }

    readFile(file, count = 5) {
        let fileData;
        if (this.filesDict['Files'].includes(file)) {
            fileData = this.fs.readFileSync(path.join(this.directoryPath, file)).toString();
        }
        else { console.log('File Missing.'); return; }
        let fileDataArr = fileData.split('\n');
        for (let index = 0; index < Math.min(fileDataArr.length, count); index++) { console.log(fileDataArr[index]); }
    }

    findFile(commandArr) {
        let filesList = [];
        if (commandArr.length === 1) {
            console.log('Please specify name to search');
            return;
        }
        if (commandArr.length === 2 || commandArr[2] === Constants.FILE_CONTAIN) {
            for (let file of this.filesDict['Files']) {
                if (file.includes(commandArr[1])) {
                    filesList.push(file);
                }
            }
        }
        else {
            if (commandArr[2] === Constants.FILE_START) {
                for (let file of this.filesDict['Files'])
                    if (file.startsWith(commandArr[1]))
                        filesList.push(file);
            }
            else if (commandArr[2] === Constants.FILE_END) {
                for (let file of this.filesDict['Files']) {
                    let fileName = file.replace(path.extname(file), '');
                    if (fileName.endsWith(commandArr[1]))
                        filesList.push(file);
                }
            }
            else {
                console.log('Invalid find command');
                return;
            }
        }
        (filesList.length) ? console.log(filesList) : console.log('No files Found');

    }

    getHistory = (count = 5) => {
        if (isNaN(count)) { console.log('Provide Numerics for history command.'); return; }
        if (this.historyList.length) {
            for (let index = 0; index < Math.min(count, this.historyList.length); index++) {
                console.log(this.historyList[this.historyList.length - 1 - index]);
            }
        }
        else {
            console.log('No History found...\n');
        }
    }

    logger = (command) => {
        let commandArr = command.split(' ');
        if (commandArr[1] === Constants.LOG_START) {
            if (commandArr.length < 3) {
                console.log('Path Not Specified');
            }
            else {
                this.logObj = new Log(commandArr[2]);
                if (!this.isLogUsedBefore) {
                    this.isLogUsedBefore = true;
                    this.logObj.clearFileData();
                    console.log('Log Started...');
                }
                else {
                    console.log('Log Resumed...');
                }
                this.logIndex = 1;
                this.logFlag = 1;
            }
        }
        else if (this.logIndex > 0) {
            if (commandArr[1] === Constants.LOG_STOP) {
                this.logFlag = 0;
                console.log('Log Stopped...');
            }
            else if (commandArr[1] === Constants.TAIL) {
                this.logObj.printLastNLines(commandArr[2]);
            }
            else if (commandArr[1] === Constants.HEAD) {
                this.logObj.printTopNLines(commandArr[2]);

            }
            else if (commandArr[1] === Constants.LOG_CLEAR) {
                this.logObj.clearFileData();
                console.log('Log cleared.');
                this.logIndex = 1;
            }
            else if (commandArr[1] === Constants.LOG_ALL) {
                this.logObj.printTopNLines(this.logObj.logList.length);
            }
            else {
                console.log('Invalid LOG Command.\n');
            }
        }
        else if (this.logIndex === 0) {
            console.log('NOTE: Log not yet Started.\n');
        }

    }

    help = (commandArr) => {

        if (commandArr.length === 1) {
            console.log(this.commandDesc);
        }
        else if (commandArr[0] in this.commandDesc) {
            console.log(this.commandDesc[commandArr[0]]);
        }
        else { console.log('Command not available.\nType "--help" to check available commands.\n') }
    }
}

const prompt = require('prompt-sync')();
const tool = new FileViewer();
let result = false;
while (result !== true) {
    let commandInput = prompt('Enter the command: ');
    result = tool.handleCommand(commandInput);
    tool.showFiles();
    console.log();
} 