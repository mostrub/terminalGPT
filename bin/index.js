#!/usr/bin/env node

const commander = require("commander");
const prompts = require("prompts");
const chalk = require("chalk");
const process = require("process");

const { intro } = require("./intro");
const { apiKeyPrompt, generateResponse } = require("./utils");
const { deleteApiKey } = require("./encrypt");

commander
  .command("chat")
  .option("-e, --engine <engine>", "GPT-3 model to use")
  .option("-t, --temperature <temperature>", "Response temperature")
  .option(
    "-f,--finetunning <finetunning>",
    "Opt in to pretrain the model with a prompt"
  )
  .usage(`"<project-directory>" [options]`)
  .action(async (options) => {
    intro();
    apiKeyPrompt().then((apiKey) => {
      const prompt = async () => {
        const response = await prompts({
          type: "text",
          name: "value",
          message: `${chalk.blueBright("You: ")}`,
          validate: () => {
            return true;
          },
        });

        switch (response.value) {
          case "exit":
            return process.exit(0);
          case "clear":
            return process.stdout.write("\x1Bc");
          default:
            generateResponse(apiKey, prompt, options, response);
            return;
        }
      };

      prompt();
    });
  });

// create commander to delete api key

commander
  .command("delete")
  .description("Delete your API key")
  .action(async () => {
    const response = await prompts({
      type: "select",
      name: "value",
      message: "Are you sure?",
      choices: [
        { title: "Yes", value: "yes" },
        { title: "No - exit", value: "no" },
      ],
      initial: 0,
    });

    switch (response.value) {
      case "no":
        return process.exit(0);
      case "yes":
      default:
        // call the function again
        deleteApiKey();
        break;
    }
    deleteApiKey();
    console.log("API key deleted");
  });

commander.parse(process.argv);
