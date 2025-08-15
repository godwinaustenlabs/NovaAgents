import { lightbulb } from "../index.js";
import validInput from "./validInput.json" with { type: "json" };
import invalidInput from "./invalidInput.json" with { type: "json" };

console.log("✅ Valid Input Run:");
const validResult = await lightbulb(validInput);
console.log(validResult);

console.log("\n❌ Invalid Input Run:");
const invalidResult = await lightbulb(invalidInput);
console.log(invalidResult);