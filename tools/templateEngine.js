const fs = require("fs").promises;
const path = require("path");

function render(template, data) {
  // Replace all occurrences of {key} with corresponding values from the data object
  let renderedTemplate = template;
  Object.keys(data).forEach((key) => {
    const pattern = new RegExp(`{${key}}`, "g");
    renderedTemplate = renderedTemplate.replace(pattern, data[key]);
  });

  return renderedTemplate;
}

async function loadTemplate(templatePath) {
  try {
    return await fs.readFile(templatePath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      // Create an empty file if it doesn't exist
      await fs.writeFile(templatePath, "");
      return "";
    } else {
      throw err;
    }
  }
}

async function loadInserts(templatePath) {
  const insertsPath = path.join(templatePath, "inserts");
  const files = await fs.readdir(insertsPath);

  const inserts = {};
  for (const file of files) {
    const insertPath = path.join(insertsPath, file);
    const key = path.basename(file, path.extname(file));
    const content = await fs.readFile(insertPath, "utf8");
    inserts[key] = content;
  }

  return inserts;
}

async function writeTemplateToFile(templatePath, renderedTemplate) {
  const fileName = path.basename(templatePath);
  const outputPath = path.join(path.dirname(__dirname), fileName);

  await fs.writeFile(outputPath, renderedTemplate, "utf8");
  return outputPath;
}

async function processTemplate(templateFile, templatePath) {
  try {
    const templateFilePath = path.join(templatePath, templateFile);
    const templateContent = await loadTemplate(templateFilePath);
    const inserts = await loadInserts(templatePath);
    const rendered = render(templateContent, inserts);
    const outputPath = await writeTemplateToFile(templateFilePath, rendered);
    console.log("Template written successfully:", outputPath);
  } catch (err) {
    console.error("Failed to process template:", err);
  }
}

async function processTemplates(templatePath) {
  try {
    const templateFiles = await fs.readdir(templatePath);
    for (const file of templateFiles) {
      const filePath = path.join(templatePath, file);
      const fileStat = await fs.lstat(filePath);
      if (fileStat.isFile()) {
        await processTemplate(file, templatePath);
      }
    }
  } catch (err) {
    console.error("Failed to process templates:", err);
  }
}

async function main() {
  try {
    const configPath = path.dirname(__dirname) + "/templateConfig.json";
    const configContent = await fs.readFile(configPath, "utf8");
    const { templatePath } = JSON.parse(configContent);

    await processTemplates(templatePath);
  } catch (err) {
    console.error("Failed to process templates:", err);
  }
}

main();
