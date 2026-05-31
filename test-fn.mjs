import * as start from "@tanstack/react-start";
const fn = start.createServerFn({ method: "POST" });
console.log("Keys:", Object.keys(fn));
console.log("Has validator?", typeof fn.validator === "function");
console.log("Has inputValidator?", typeof fn.inputValidator === "function");
