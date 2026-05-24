import { readFileSync, writeFileSync, mkdirSync } from "fs";

mkdirSync("dist", { recursive: true });

const cssModule = await import("../dist/css.js");
writeFileSync("dist/admin.css", cssModule.adminCSS.trim());

console.log("Built dist/admin.css");
