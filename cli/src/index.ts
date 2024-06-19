import fs from 'fs';
import path from 'path';

// the name of the plugin is the second argument passed to the script
const pluginName = process.argv[2];

// copy the template directory to the plugins directory
const pluginDir = path.join(__dirname, '..', '..', 'plugins', pluginName);

if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir);
}

const templateDir = path.join(__dirname, '..', 'template');

// copy the entire template directory to the plugins directory
fs.cpSync(templateDir, pluginDir, { recursive: true });

// update the package.json file with the plugin name
const packageJSONPath = path.join(pluginDir, 'package.json');
const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));
packageJSON.name = pluginName;
packageJSON.devDependencies['@kimikobot/types'] = 'file:../types';

fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
console.log(`Plugin ${pluginName} created successfully`);
