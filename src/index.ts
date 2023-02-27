import { Client, EmbedBuilder, Permissions } from "revolt-toolset";
import { NodeVM } from "vm2";
import util from "node:util";
import * as dotenv from "dotenv";
import child_process from "node:child_process";
import { hostname, release } from "node:os";

const { execSync } = child_process;

dotenv.config();

const toolset = new Client();

enum COMMANDS {
    NODE = "runnode",
    BASH = "runbash",
    EVAL = "runeval",
    HELP = "help",
    ABOUT = "about",
}

const node_vm = new NodeVM({
    wrapper: "none",
    console: "inherit",
    require: {
        root: "./",
        builtin: ["*"],
        strict: false,
    },
});

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
    "01FHGJ3NPP7XANQQH8C2BE44ZY",
    // @ShadowLp174
    "01G9MCW5KZFKT2CRAD3G3B9JN5",
    // @Sneexy
    "01FM1B8WHWAD0JXX4JR96CAPM3",
    // @amysour (please do not break it again)
    "01G9KEQPRZ5RMDXCK2DP8T3K2G",
    // @Dell Optiplex 9020
    "01FNGH62F1GY31C32VEEMQ9E9Z",
    // @crispycat
    "01G4NHXWPHD1NWDDTHN3KSRW4Q",
    // @FatalErrorCoded
    "01EXAME8DPWQH72RCBPX490ZMQ"
];

function runNode(code: string): string {
    try {
        const result = node_vm.run(code || "");

        if (result) {
            return result;
        } else {
            throw "Nothing was returned";
        }
    } catch (err: unknown) {
        return err as string;
    }
}

function runBash(code: string): string {
    try {
        const result = execSync(code);

        if (result) {
            return `${Buffer.from(result).toString()}`;
        } else {
            throw `No output from ${code}`;
        }
    } catch (err: unknown) {
        return err as string;
    }
}

function runEval(code: string): string {
    try {
        const result = eval(code || "");

        if (result) {
            return util.inspect(result);
        } else {
            throw `No output from ${code}`;
        }
    } catch (err: unknown) {
        return err as string;
    }
}

toolset.once("ready", () => {
    console.log("Logged in!");
});

toolset.on("message", async (message) => {
    const me = await message.server.fetchMe();
    if (message.isSystem()) {
        return;
    } else if (
        message.isUser() &&
        message.channel
            .permissionsFor(me)
            .has(Permissions.SendMessage) &&
        message.channel.permissionsFor(me).has(Permissions.SendEmbeds)
    ) {
        if (
            message.authorID !== toolset.user.id &&
            message.content &&
            message.content.startsWith(PREFIX)
        ) {
            const args = message.content
                .slice(PREFIX.length)
                .trim()
                .split(/ +/g);
            const command = args?.shift()?.toLocaleLowerCase();

            if (command === COMMANDS.NODE) {
                if (WHITELIST.includes(message.authorID)) {
                    const expr = args.slice(1).join(" ");
                    const res = runNode(expr);

                    message.reply(
                        new EmbedBuilder({
                            title: "Headbang | runNode",
                            description: `## Result\n\`\`\`txt\n${res}\n\`\`\``,
                        })
                    );
                } else {
                    message.react("%E2%9D%8C");
                }
            } else if (command === COMMANDS.EVAL) {
                if (WHITELIST.includes(message.authorID)) {
                    const expr = args.slice(1).join(" ");
                    const res = runEval(expr);

                    message.reply(
                        new EmbedBuilder({
                            title: "Headbang | runEval",
                            description: `## Result\n\`\`\`ts\n${res}\n\`\`\``,
                        })
                    );
                } else {
                    message.react("%E2%9D%8C");
                }
            } else if (command === COMMANDS.BASH) {
                if (WHITELIST.includes(message.authorID)) {
                    const expr = args.join(" ");
                    console.log(args);
                    const res = runBash(expr);

                    if (res) {
                        message.reply(
                            new EmbedBuilder({
                                title: "Headbang | runBash",
                                description: `## Result\n\`\`\`bash\n${res}\n\`\`\``,
                            })
                        ).catch((e) => {
                                message.reply(
                                    new EmbedBuilder({
                                        title: "Headbang | runBash",
                                        description: `## Oops! Couldn't send Message\nI couldn't send a message, maybe the output is too big?`
                                    })
                                )
                        });
                    } else {
                        message.react("%E2%9D%8C");
                    }
                } else {
                    message.react("%E2%9D%8C");
                }
            } else if (command === COMMANDS.ABOUT) {
                message.reply(
                    new EmbedBuilder({
                        title: "Headbang | About HB",
                        description: `## Headbang ${
                            require("../package.json").version
                        } (Typescript Rewrite)\n### System Information\nHostname: \`${hostname}\`\nArchitecture: \`${
                            process.arch
                        }\`\nPlatform: \`${process.platform}\`\nRelease: \`${
                            release
                        }\`\nBash: \`${execSync(
                            "echo $BASH_VERSION"
                        ).toString()}\`\n### Packages\nTypescript ${(
                            require("../package.json").dependencies
                                .typescript as string
                        ).substring(1)}\nNode ${
                            process.version.substring(1)
                        }\nRevolt Toolset ${(
                            require("../package.json").dependencies[
                                "revolt-toolset"
                            ] as string
                        ).substring(1)}`,
                    })
                );
            } else if (command === COMMANDS.HELP) {
                message.reply(
                    new EmbedBuilder({
                        title: "Headbang | Help",
                        description: `## Help\n\`${COMMANDS.NODE}\`: Run NodeJS Code on VM2\n\`${COMMANDS.EVAL}\`: Run NodeJS Code using \`eval()\`\n\`${COMMANDS.BASH}\`: Run Bash commands\n\`${COMMANDS.HELP}\`: Show this embed\n\`${COMMANDS.ABOUT}\`: Information about Headbang`,
                    })
                );
            }
        }
    }
});

toolset.login(
    process.env.TOKEN as string,
    process.env.TYPE as "bot" | "user"
);
