import * as fs from "fs";
import * as path from "path";

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes(".validator(")) {
    content = content.replace(/\.validator\(/g, ".inputValidator(");
    fs.writeFileSync(filePath, content);
    console.log("Updated", filePath);
  }
}

const dir = path.join(process.cwd(), "src/lib/actions");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
  replaceInFile(path.join(dir, file));
}

// Update vitest.setup.ts
let vitestContent = fs.readFileSync("vitest.setup.ts", "utf-8");
if (vitestContent.includes(".validator")) {
  vitestContent = vitestContent.replace(/fn\._validator/g, "fn._inputValidator");
  vitestContent = vitestContent.replace(/fn\.validator =/g, "fn.inputValidator =");
  fs.writeFileSync("vitest.setup.ts", vitestContent);
  console.log("Updated vitest.setup.ts");
}
