#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var shelljs_1 = __importDefault(require("shelljs"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var chalk_1 = __importDefault(require("chalk"));
var clear_1 = __importDefault(require("clear"));
var CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
var QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES
    },
    {
        name: 'name',
        type: 'input',
        message: 'Project name:'
    },
    {
        name: 'packageManager',
        type: 'list',
        message: 'What packagemanager do you use',
        choices: [
            'NPM',
            'Yarn'
        ]
    },
    {
        name: 'npminstall',
        type: 'list',
        message: 'Do you wanna pre-install packages',
        choices: [
            'Yes',
            'No'
        ]
    }
];
var inquirer = __importStar(require("inquirer"));
var CURR_DIR = process.cwd();
inquirer.prompt(QUESTIONS)
    .then(function (answers) {
    var projectChoice = answers.template;
    var projectName = answers.name;
    var templatePath = path.join(__dirname, 'templates', projectChoice);
    var tartgetPath = path.join(CURR_DIR, projectName);
    var packageManager = answers.packageManager.toLocaleLowerCase();
    var npmInstall = answers.npminstall;
    if (!createProject(tartgetPath)) {
        return;
    }
    createDirectoryContents(templatePath, projectName);
    if (npmInstall !== 'Yes') {
        return;
    }
    installPackages(tartgetPath, packageManager, projectName);
});
function installPackages(tartgetPath, packageManager, projectName) {
    console.log(chalk_1.default.green('Installing packages'));
    shelljs_1.default.cd(tartgetPath);
    switch (packageManager) {
        case 'npm':
            shelljs_1.default.exec(packageManager + " install --no-progress");
        case 'yarn':
            shelljs_1.default.exec(packageManager + " install --silent");
    }
    clear_1.default();
    console.log(chalk_1.default.green('Packages are successfully installed'));
    console.log(chalk_1.default.blue('Running webpack compiler'));
    shelljs_1.default.exec('npm run dev');
    clear_1.default();
    console.log(chalk_1.default.green('Webpack compiler is done! You can build awesome apps!'));
}
function createProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk_1.default.red("Folder " + projectPath + " exists. Delete or use another name."));
        return false;
    }
    fs.mkdirSync(projectPath);
    return true;
}
var SKIP_FILES = ['node_modules', '.template.json', 'dist'];
function createDirectoryContents(templatePath, projectName) {
    var filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(function (file) {
        var origFilePath = path.join(templatePath, file);
        var stats = fs.statSync(origFilePath);
        if (SKIP_FILES.indexOf(file) > -1)
            return;
        if (stats.isFile()) {
            var contents = fs.readFileSync(origFilePath, 'utf8');
            var writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        }
        else if (stats.isDirectory()) {
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}
//# sourceMappingURL=index.js.map