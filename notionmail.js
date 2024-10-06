require("dotenv").config();

// initialize notion client with auth
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

let users = {}; // store {user: [messages]}
let mode = "menu"; // of three possibilites (menu, sending, reading)
let sender = ""; // in send mode: sender
let recipient = ""; // in send mode: recipient
let message = ""; // in send mode: message

// to display, console.log the text
function display(text) {
  console.log(text);
}

function resetMenu() {
  mode = "menu";
  display(
    "\nWelcome to Notion Mail!\nPlease select an option:\n- send: Send mail to a user.\n- read: Check a user's mail.\n"
  );
  rl.prompt();
}

// create new page (row) with given sender, recipient, message
async function createNotionPage(sender, recipient, message) {
  const dbID = process.env.NOTION_DB_ID;

  try {
    const newPage = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: dbID,
      },
      properties: {
        Message: {
          title: [
            {
              text: {
                content: message,
              },
            },
          ],
        },
        Sender: {
          rich_text: [
            {
              text: {
                content: sender,
              },
            },
          ],
        },
        Recipient: {
          rich_text: [
            {
              text: {
                content: recipient,
              },
            },
          ],
        },
      },
    });

    // display("\nmessage sent on notion!\n");
  } catch (error) {
    display(`failed to save message on notion because ${error.message}\n`);
  }
}

// query messages from notion db for a specific recipient
async function fetchMessagesForUser(recipient) {
  const dbID = process.env.NOTION_DB_ID;

  try {
    const queryResponse = await notion.databases.query({
      database_id: dbID,
      filter: {
        property: "Recipient",
        rich_text: {
          equals: recipient,
        },
      },
    });

    const results = queryResponse.results;

    if (results.length === 0) {
      display(`No mail found for ${recipient}`);
    } else {
      display(`You've got (${results.length}) messages!`);
      results.forEach((result, index) => {
        const sender =
          result.properties.Sender.rich_text[0]?.text.content ||
          "mysterious sender";
        const message =
          result.properties.Message.title[0]?.text.content ||
          "this sender had little to say";
        display(`${index + 1}:\nfrom: ${sender}\n${message}\n`);
      });
      resetMenu();
    }
  } catch (error) {
    display(`Error fetching messages: ${error.message}`);
  }
}

function processInput(value) {
  switch (mode) {
    case "menu": // need to prompt user for inputs - choose between send and read
      if (value === "send") {
        mode = "send_sender"; // next input will be sender for send mode
        display(`Sender: $`);
      } else if (value === "read") {
        mode = "read_user"; // next input will be user for read mode (whose messages to read)
        display(`User: $`);
      } else {
        display(
          `Sorry, we don't recognize that, please type either send or read`
        );
      }
      rl.prompt();
      break;

    case "send_sender":
      sender = value;
      mode = "send_recipient"; // next input will be recipient for send mode
      display(`Recipient: $`);
      rl.prompt();
      break;

    case "send_recipient":
      recipient = value;
      mode = "send_message"; // next input will be message for send mode
      display(`Message: $`);
      rl.prompt();
      break;

    case "send_message":
      message = value;
      if (!users[recipient]) {
        // put message in recipient's inbox
        users[recipient] = [];
      }
      users[recipient].push({ from: sender, message });

      createNotionPage(sender, recipient, message); // also save it on notion db

      display(`Message sent from ${sender} to ${recipient}!\n`);
      resetMenu();
      break;

    case "read_user":
      recipient = value;
      fetchMessagesForUser(recipient); // fetch mail from notion db for recipient
      break;
  }
}

// initialize CLI
rl.on("line", (line) => {
  const value = line.trim();
  processInput(value);
});

resetMenu(); // start by displaying the menu
