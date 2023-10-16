
console.log("*****************************************");
console.log("Eyasi Softonics (T) Ltd")
console.log("*****************************************")
console.log("\n")
console.log(" Incrementing app version....");
console.log("\n")

const regex = /v\d+\.\d+\.\d+/g;

const fs = require('fs');


//------------------------------
// 1. Increment version number
//------------------------------

//Read current app version file
const appVersionFilePath = 'version';
let appVersionString = fs.readFileSync(appVersionFilePath, 'utf8');

//Version Update Logic
const appVersionNumbers = appVersionString.split('.');
appVersionNumbers[2] = parseInt(appVersionNumbers[2]) + 1
const newVersion = appVersionNumbers.join(".")
console.log("App version updated to",newVersion)

//Store updated app version
fs.writeFileSync(appVersionFilePath, newVersion);


//----------------------------
// 2. Update displayed version
//----------------------------

// read the current contents of react version component
const filePath = 'src/ui/system/etc/SystemVersion.tsx';
let fileContents = fs.readFileSync(filePath, 'utf8');

// replace the matched text with the new text
fileContents = fileContents.replace(regex, `v${newVersion}`);

// write the updated contents back to the file
fs.writeFileSync(filePath, fileContents);