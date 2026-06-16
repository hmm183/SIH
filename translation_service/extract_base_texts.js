const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'context', 'LangContext.jsx');
if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at ${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

const startMatch = "const BASE_TEXTS = {";
const startIndex = content.indexOf(startMatch);
if (startIndex === -1) {
  console.error("Error: Could not find const BASE_TEXTS in LangContext.jsx");
  process.exit(1);
}

let braceCount = 1;
let i = startIndex + startMatch.length;
while (braceCount > 0 && i < content.length) {
  if (content[i] === '{') braceCount++;
  else if (content[i] === '}') braceCount--;
  i++;
}

const objectLiteral = content.substring(startIndex + "const BASE_TEXTS = ".length, i);

try {
  const parsed = new Function(`return ${objectLiteral}`)();
  console.log(JSON.stringify(parsed, null, 2));
} catch (err) {
  console.error("Error evaluating BASE_TEXTS object literal:", err);
  process.exit(1);
}
