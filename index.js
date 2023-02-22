// @ts-check
import { Client } from "revolt.js";
import { NodeVM } from "vm2";
import util from "node:util"
import { spawn } from "node:child_process";
import * as dotenv from "dotenv";
import pkg from "shelljs"
import { test } from "./thing.js";
import fs from "node:fs";

const { exec } = pkg;

dotenv.config()

const revolt = new Client();

const BOTINFO = {
    version: "1.1.2",
    packages: ["os", "fs", "child_process", "revolt.js", "shelljs"],
    vm: "NodeVM"
}

const nodevm = new NodeVM(
    {
        wrapper: "none",
        console: "inherit",
        require: {
            root: "./",
            builtin: ["*"],
            external: {
                modules: ["revolt.js", "shelljs", "./thing"],
                transitive: true
            },
            strict: false,
        }
    }
);

nodevm.freeze(BOTINFO, 'BOTINFO');

const PREFIX = "hb";

const WHITELIST = JSON.parse(fs.readFileSync("./whitelist.json", "utf-8"));

function runCode(code) {
    try {
        let result = nodevm.run(code || "");
        if (result && result.length > 0 || result) {
            console.log(result);

            return util.inspect(result);
        } else {
            return "Nothing was returned";
        }
    } catch (err) {
        return `${err}`;
    }
}

function runbash(code) {
    try {
        let result = exec(code || "", { async: false, encoding: "utf-8" });
        if (result) {
            console.log(result);
            if (!result.stdout && !result.stderr) {
                return "No output";
            }
            else if (!result.stdout) {
                return `${result.stderr}`;
            }
            else if (!result.stderr) {
                return `${result.stdout}`;
            }
            else {
                return `STDOUT: ${result.stdout}\nSTDERR: ${result.stderr}`;
            }
        } else {
            return "No output";
        }
    } catch (err) {
        return `\`${err}\``;
    }
}
var msgSinceInChannel = {};

async function runbashlive(code, message) {
    let prevMsg;

    try {
        let child = spawn(code || "", [], { shell: true });
        child.stdout.setEncoding("utf-8");
        child.stderr.setEncoding("utf-8");
        child.stdout.on("data", async (data) => {
            prevMsg = await sayParts(message, data.toString(), '', true);
            msgSinceInChannel[message.channel._id] = false;
        });
        child.stderr.on("data", async (data) => {
            prevMsg = await sayParts(message, data.toString(), '⛔️ '); // prefix with ⛔️ so they see it's an error
            msgSinceInChannel[message.channel._id] = false;
        });
        child.on("close", (code) => {
            // react to the last message with a trash icon so they know process has ended
            prevMsg?.react(encodeURIComponent("🗑️"));
        });
    } catch (err) {
        return `\`${err}\``;
    }
}


function runeval(code) {
    try {
        let result = eval(code || "")

        if (result) {
            return util.inspect(result);
        } else {
            return "No output"
        }
    } catch (err) {
        return `${err}`
    }
}

async function sayParts(message, text, prefix, noreply) {
    if (!prefix) prefix = "";

    // first, surround each line with `
    var textSplit = text.split("\n");
    // remove an empty line at bottom if there is one
    if (textSplit[textSplit.length - 1].trim() == "") {
        textSplit.pop();
    }
    for (let i = 0; i < textSplit.length; i++) {
        // escape backticks
        textSplit[i] = textSplit[i].replace(/`/g, "\\`");

        textSplit[i] = `\`${textSplit[i]}\``;

        // remove ansi codes like [37m[0m[1m and [?25l[?7l[37m[0m[1m
        textSplit[i] = textSplit[i].replace(/\[[0-9;]*m/g, "");

        // remove ansi codes like [?25h[?7h[37m[0m[1m
        textSplit[i] = textSplit[i].replace(/\[[?0-9;]*[hlm]/g, "");

        // remove ansi codes like [37m[0m[1m
        textSplit[i] = textSplit[i].replace(/\[[0-9;]*[m]/g, "");

        // replace 	with 4 spaces
        textSplit[i] = textSplit[i].replace(/\t/g, "    ");

        // lines with just `` should be empty, not removed
        if (textSplit[i] == "``") {
            textSplit[i] = "";
        }
    }
    text = textSplit.join("\n");


    let parts = text.match(/[\s\S]{1,2000}/g);

    let lastMsg;

    for (let i = 0; i < parts.length; i++) {
        if (i == 0) {
            if (noreply) {
                lastMsg = await message.channel?.sendMessage({
                    content: `${parts[i]}`
                })?.catch((e) => {
                    console.log("bot has failed.. or has it?", e)
                });
            }
            else {
                lastMsg = await message.reply({
                    content: prefix + `${parts[i]}`
                })?.catch((e) => {
                    console.log("bot has failed.. or has it?", e)
                });
            }
        }
        else {
            lastMsg = await message.channel?.sendMessage({
                content: `${parts[i]}`
            })?.catch((e) => {
                console.log("bot has failed.. or has it?", e)
            });
            // we only reply to the first message so it looks cleaner and like a single message (there are visible cuts when you reply, it adds spacing)
        }
    }
    return lastMsg;
}



revolt.on("message", async (message) => {
    const args = message.content?.slice(PREFIX.length).trim().split(/ +/g);
    const command = args?.shift()?.toLocaleLowerCase();

    // if msg not from us, set msgSinceInChannel to true
    if (message.author_id != revolt.user?._id) {
        msgSinceInChannel[message.channel?._id] = true;
    }

    if (command === "runnode") {
        /**
         * @type {string | Array<any> | object}
         */
        let result;

        if (WHITELIST.includes(message.author_id)) {
            let expresion = args?.slice(1).join(" ");
            // react to message with checkmark
            await message.react(encodeURIComponent("✅"));
            result = runCode(expresion);
        } else {
            await message.react(encodeURIComponent("⛔️"));
            result = ":01G83M8KJE4KGQCQT2PP5EH3VT:";
        }

        console.log(`${message.author?.username} sent command ${command} with result ${result || "L"}`);


        sayParts(message, result);
    } else if (command === "runeval") {
        /**
         * @type {string | Array<any> | object}
         */
        let result;

        if (WHITELIST.includes(message.author_id)) {
            let expresion = args?.slice(1).join(" ");
            // react to message with checkmark
            await message.react(encodeURIComponent("✅"));
            result = eval(expresion || "");
        } else {
            await message.react(encodeURIComponent("⛔️"));
            result = `No perms :01G83M8KJE4KGQCQT2PP5EH3VT:
Ask dumpling for perms btw`;
        }

        console.log(`${message.author?.username} sent command ${command} with result ${result}`);

        sayParts(message, result);

    } else if (command === "help") {
        message.reply({
            content: " ",
            embeds: [{
                colour: "#E9186B",
                title: "Headbang",
                description: `\`runnode\`: run nodejs code
\`runeval\`: run nodejs code in eval (run bash using \`runbash\`)
\`help\`: display this message
`
            }]
        })
    } else if (command === "$" || command === "bash") {
        /**
        * @type {string | Array<any> | object}
        */
        let result;

        if (WHITELIST.includes(message.author_id)) {
            let expresion = args?.slice(1).join(" ");
            // react to message with checkmark
            await message.react(encodeURIComponent("✅"));
            result = runbash(expresion);
        } else {
            await message.react(encodeURIComponent("⛔️"));
            result = `No perms :01G83M8KJE4KGQCQT2PP5EH3VT:
Ask dumpling for perms btw`;
        }

        console.log(`${message.author?.username} sent command ${command} with result ${result}`);

        sayParts(message, result);
    }
    else if (message.content?.startsWith('$ ')) {
        // $ == bash command

        if (WHITELIST.includes(message.author_id)) {
            let expresion = message.content?.slice(2);
            // react to message with checkmark
            await message.react(encodeURIComponent("✅")); // just an indicator that the command is running
            await message.react(encodeURIComponent("🗑️")); // user can click this to kill the process
            await runbashlive(expresion, message); // since msg passed, we can know when to stop
        } else {
            await message.react(encodeURIComponent("⛔️"));
            await message.reply({
                content: `No perms :01G83M8KJE4KGQCQT2PP5EH3VT: stop being a poopyhead`
            });
        }

        console.log(`${message.author?.username} sent command ${command} with some result im not sure of`);
    }
});

revolt.on("message/update", async (message) => {
    // look @ reactions

});

if (process.env.TYPE === "BOT") {
    revolt.loginBot(process.env.TOKEN || "");
} else if (process.env.TYPE === "USER") {
    revolt.login({ email: process.env.EMAIL || "", password: process.env.PASSWORD || "" });
}
