#!/usr/bin/env node
import shell from 'shelljs';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import clear from 'clear';

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
const QUESTIONS = [
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

import * as inquirer from 'inquirer';

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS)
.then((answers: { template: string, name: string, packageManager: string, npminstall: string }) => {
    const projectChoice = answers.template;
    const projectName = answers.name;
    const templatePath = path.join(__dirname, 'templates', projectChoice);
    const tartgetPath = path.join(CURR_DIR, projectName);
    const packageManager = answers.packageManager.toLocaleLowerCase()
    const npmInstall = answers.npminstall
    if (!createProject(tartgetPath)) {
        return;
    }
    createDirectoryContents(templatePath, projectName);

    if (npmInstall !== 'Yes') {
        return;
    }
    installPackages(tartgetPath, packageManager, projectName)    
});


function installPackages(tartgetPath: string, packageManager: string, projectName:string) {
    console.log(chalk.green('Installing packages'));
    shell.cd(tartgetPath)
    switch(packageManager) {
        case 'npm': 
            shell.exec(`${packageManager} install --no-progress`);
        case 'yarn':
            shell.exec(`${packageManager} install --silent`);
    }
    clear();
    console.log(chalk.green('Packages are successfully installed'));
    console.log(chalk.blue('Running webpack compiler'));
    shell.exec('npm run dev')
    clear();
    console.log(chalk.green('Webpack compiler is done! You can build awesome apps!'));
}

function createProject(projectPath: string) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }

    fs.mkdirSync(projectPath);
    
    return true;
}

const SKIP_FILES = ['node_modules', '.template.json', 'dist'];
function createDirectoryContents(templatePath: string, projectName: string) {
    const filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);
        const stats = fs.statSync(origFilePath);
        if (SKIP_FILES.indexOf(file) > -1) return;
        if (stats.isFile()) {
            let contents = fs.readFileSync(origFilePath, 'utf8');
            const writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}

