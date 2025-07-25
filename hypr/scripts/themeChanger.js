const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// variable initiation
let data = {
    themes: [],
    choice: process.argv[2],
    dir: {
        baseDir: "/home/roxie/.config/hypr/",
        fileDir: "/home/roxie/.config/hypr/scripts/data",
        cssDir: "/home/roxie/.config/hypr/color.css",
        confDir: "/home/roxie/.config/hypr/hyprcolor.conf"
    },
    fileExtension: ".json",
    themeData: {}
}

let loadWallpaper = (dir) => {return `hyprctl hyprpaper preload '${dir}'; hyprctl hyprpaper wallpaper HDMI-A-1, '${dir}'`};

// load theme names
fs.readdirSync(data.dir.fileDir).filter(file => path.extname(file) === data.fileExtension).forEach(file => {
    data.themes.push(file.substring(0, file.length - data.fileExtension.length));
});

// functions
function buildConfFile(confData) {
    let finalFileData = "";

    confData.data.forEach(item => {
        finalFileData += `\$${item[0]} = ${item[1]} \n`;
    });

    return finalFileData;
}

function buildCssFile(cssData) {
    let finalFileData = "";

    cssData.data.forEach(item => {
        finalFileData += `${cssData.config.def} ${item[0]} ${item[1]};\n`;
    });

    return finalFileData;
}

// run function
async function run() {
    // failsafe incase im a muppet
    if (!data.themes.includes(data.choice))data.choice = data.themes[0];

    data.themeData = JSON.parse(fs.readFileSync(`${data.dir.fileDir}/${data.choice}${data.fileExtension}`)); 

    // write data
    fs.writeFileSync(data.dir.confDir, buildConfFile(data.themeData.conf), 'utf8');
    fs.writeFileSync(data.dir.cssDir, buildCssFile(data.themeData.css), 'utf8');

    // wallpaper command
    await exec(loadWallpaper(data.themeData.config.wallpaper), async (error, stdout, stderr) => {if (error) console.log(error)});
    // update command
    await exec(data.themeData.config.updateCommand, async (error, stdout, stderr) => {if (error) console.log(error)});

    console.log(data.choice);
}

// async function to edit files
async function build() {
    await exec(`sh ${data.dir.baseDir}scripts/wofiThemeDisplay.sh ${data.themes.join(",")}`, async (error, stdout, stderr) => {
        // extract choice
        data.choice = stdout.substring(0, stdout.length - 1);

        await run();
    });
}

// begin
build();
