// @ts-check
import { Client } from "revolt.js";
import { VM } from "vm2";

const revolt = new Client();
const nodevm = new VM();

const PREFIX = "hb";

function runCode(code) {
    try {
        let result = nodevm.run(code || "");
        if (result && result.length > 0 || result) {
            console.log(result);

            return result
        } else {
            return "Nothing was returned";
        }
    } catch (err) {
        return `code died\n${err}`;
    }
}

revolt.on("message", async (message) => {
    const args = message.content?.slice(PREFIX.length).trim().split(/ +/g);
    const command = args?.shift()?.toLocaleLowerCase();

    if (command === "run") {
        let expresion = args?.slice(1).join(" ");

        /**
         * @type {string | Array<any> | object}
         */
        let result = runCode(expresion);

        message.reply({
            content: result
        })?.catch((e) => {
            console.log("bot has failed", e)
        });
    }
})

if (process.env.TYPE === "BOT") {
    revolt.loginBot(process.env.TOKEN || "");
} else if (process.env.TYPE === "USER") {
    revolt.login({ email: process.env.EMAIL || "", password: process.env.PASSWORD || "" });
}