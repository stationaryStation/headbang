// @ts-check
import { Client } from "revolt.js";
import { NodeVM } from "vm2";
import util from "node:util"
import { spawn } from "node:child_process";
import * as dotenv from "dotenv";
import pkg from "shelljs"
import fs from "node:fs"

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
        let result = exec(code || "", { async: false, encoding: "utf-8" }).stdout;
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

revolt.on("message", async (message) => {
    const args = message.content?.slice(PREFIX.length).trim().split(/ +/g);
    const command = args?.shift()?.toLocaleLowerCase();

    if (command === "runnode") {
        /**
         * @type {string | Array<any> | object}
         */
        let result;

        if (WHITELIST.includes(message.author_id)) {
            let expresion = args?.slice(1).join(" ");
            result = runCode(expresion);
        } else {
            result = ":01G83M8KJE4KGQCQT2PP5EH3VT:";
        }

        console.log(`${message.author?.username} sent command ${command} with result ${result || "L"}`);


        message.reply({
            content: `\`${result}\``
        })?.catch((e) => {
            console.log("bot has failed", e)
        });
    } else if (command === "runeval") {
        /**
         * @type {string | Array<any> | object}
         */
        let result;

        if (WHITELIST.includes(message.author_id)) {
            let expresion = args?.slice(1).join(" ");
            result = eval(expresion || "");
        } else {
            result = `No perms :01G83M8KJE4KGQCQT2PP5EH3VT:
Ask dumpling for perms btw`;
        }

        console.log(`${message.author?.username} sent command ${command} with result ${result}`);

        message.reply({
            content: `\`${result}\``,
        })?.catch((e) => {
            console.log("bot has failed", e)
        });

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
    }
})

if (process.env.TYPE === "BOT") {
    revolt.loginBot(process.env.TOKEN || "");
} else if (process.env.TYPE === "USER") {
    revolt.login({ email: process.env.EMAIL || "", password: process.env.PASSWORD || "" });
}
