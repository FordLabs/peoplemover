/* eslint-disable */
const fs = require('fs');
const packageJson = require('./package.json');

const appVersion = packageJson.version;

const jsonData = {
    version: appVersion,
};

let jsonContent = JSON.stringify(jsonData);

fs.writeFile('./public/meta.json', jsonContent, 'utf8', function (err) {
    if (err) {
        console.log('An error occurred while writing JSON Object to meta.json');
        console.log(err);
        return err;
    }

    console.log('meta.json file has been saved with latest version number');
});
