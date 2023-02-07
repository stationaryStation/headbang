// @ts-check
import { Client } from "revolt.js";
import { NodeVM } from "vm2";
import util from "node:util"
import { spawn } from "node:child_process";
import * as dotenv from "dotenv";

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
                modules: ["revolt.js", "shelljs"],
                transitive: true
            },
            strict: false,
        }
    }
);

nodevm.freeze(BOTINFO, 'BOTINFO');

const PREFIX = "hb";

const WHITELIST = [
    // @dumpling
    "01G1V3VWVQFC8XAKYEPNYHHR2C",
    // @lea_
    "01EXAF3KX65608AJ4NG27YG1HM",
    // @fabyr
    "01GPPXD513FESW8VYZD509GKD7",
    // @insert
    "01EX2NCWQ0CHS3QJF0FEQS1GR4",
    // @Error 404 Null not found
    "01FH48GXF663JKTH1R13XRF747",
    // @VeiledProduct80
    "01FM34H06DZ3QV7813RG5HJDSK",
    // @ToastXC
    "01FSRTTGJC1XJ6ZEQJMSX8Q96C",
    // @lokicalmito
    "01G8914GKC48X0KYP1DPH5E1WM",
    // @alexmeow4560
    "01FESEWQKT7RESCNX5YF3JR29H",
    // @Inderix
    "01FGXHPMYHBJZ1SJ785YB33NFK",
    // @Mini the bunny boy
    "01GHK4YBA5RH0FA1E716QTZ1WD",
    // @NoLogicAlan
    "01FVB1ZGCPS8TJ4PD4P7NAFDZA",
    // @DoruDoLasu
    "01FM2X4GBE4A6CN9NNT0GV0DF5",
    // @tame
    "01GDVFASQERQYS9C93QWZGRVAF",
    // @infi
    "01F1WKM5TK2V6KCZWR6DGBJDTZ",
    // @rexogamer
    "01FEEFJCKY5C4DMMJYZ20ACWWC",
    // @automod
    "01FHGJ3NPP7XANQQH8C2BE44ZY"
]

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
            content: `Result: \`${result}\``
        })?.catch((e) => {
            console.log("bot has failed", e)
        });
    } else if (command === "runbash") {
        message.reply("not done :trol:");
        // /**
        //  * @type {string | Array<any> | object}
        //  */
        // let result;

        // if (WHITELIST.includes(message.author_id)) {
        //     let expresion = args?.slice(1).join(" ");
        //     let p = spawn(expresion || "")

        //     await p.stdout.on("data", (d) => {
        //         result = d;
        //     })

        // } else {
        //     result = ":01G83M8KJE4KGQCQT2PP5EH3VT:";
        // }

        // console.log(`${message.author?.username} sent command ${command} with result ${result || "L"}`);

        // message.reply({
        //     content: `Result: \`${result || "No result"}\``
        // })?.catch((e) => {
        //     console.log("bot has failed", result, e)
        // });
    }
})

if (process.env.TYPE === "BOT") {
    revolt.loginBot(process.env.TOKEN || "");
} else if (process.env.TYPE === "USER") {
    revolt.login({ email: process.env.EMAIL || "", password: process.env.PASSWORD || "" });
}