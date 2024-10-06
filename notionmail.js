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

let mode = "menu"; // of three possibilites (menu, sending, reading)
let sender = ""; // in send mode: sender
let recipient = ""; // in send mode: recipient
let message = ""; // in send mode: message
let messages = []; // used to more index for deletions (prevent refetching)

// to display, console.log the text
function display(text) {
  console.log(text);
}

function resetMenu(showDisplay = true) {
  mode = "menu";
  if (showDisplay) {
    display(
      "\nWelcome to Space Mail!\nPlease select an option:\n- send: Send mail to a user.\n- read: Check a user's mail.\n"
    );
  }
  rl.prompt();
}

// format the timestamp (ex. 2024-10-06T06:14:00.000Z => October 6, 2024 at 6:14 AM)
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
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
        Deleted: {
          checkbox: false, // default to not deleted
        },
      },
    });
  } catch (error) {
    display(`Failed to save message to Notion db because ${error.message}\n`);
  }
}

// query messages from notion db for a specific recipient
async function fetchMessagesForUser(recipient) {
  const dbID = process.env.NOTION_DB_ID;

  try {
    const queryResponse = await notion.databases.query({
      database_id: dbID,
      filter: {
        and: [
          {
            property: "Recipient",
            rich_text: {
              equals: recipient,
            },
          },
          {
            property: "Deleted",
            checkbox: {
              equals: false, // don't fetch messages if they are marked as deleted
            },
          },
        ],
      },
    });

    messages = queryResponse.results;

    if (messages.length === 0) {
      display(`No mail found for ${recipient}`);
      resetMenu(false);
    } else {
      display(`You've got (${messages.length}) messages!`);
      messages.forEach((result, index) => {
        const sender =
          result.properties.Sender.rich_text[0]?.text.content ||
          "mysterious sender";
        const message =
          result.properties.Message.title[0]?.text.content ||
          "this sender had little to say";
        const timestamp =
          formatTimestamp(result.created_time) || "some time...";
        display(
          `${index + 1}:\nfrom: ${sender}\n${message}\nsent at ${timestamp}\n`
        );
      });
      display(
        '\nEnter the message index to delete or type "skip" to keep them all.'
      );
      rl.prompt();
    }
  } catch (error) {
    display(`Error fetching messages: ${error.message}`);
  }
}

// delete messages by marking them as deleted
async function markMessageAsDeleted(index) {
  if (index < 1 || index > messages.length) {
    display("Invalid index. No message marked as deleted.");
    return;
  }

  const messageId = messages[index - 1].id;

  try {
    await notion.pages.update({
      page_id: messageId,
      properties: {
        Deleted: {
          checkbox: true, // mark the message as deleted
        },
      },
    });

    display(`Success! Message ${index} marked as deleted.\n`);
    resetMenu(false);
  } catch (error) {
    display(`Failed to mark message ${error.message} as deleted.\n`);
  }
}

function processInput(value) {
  switch (mode) {
    case "menu": // need to prompt user for inputs - choose between send and read
      if (value === "menu") {
        resetMenu();
      } else if (value === "send") {
        mode = "send_sender"; // next input will be sender for send mode
        display(`Sender: $`);
      } else if (value === "read") {
        mode = "read_user"; // next input will be user for read mode (whose messages to read)
        display(`User: $`);
      } else {
        display(
          `Sorry, we don't recognize that, please type either 'send' or 'read'`
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
      createNotionPage(sender, recipient, message); // also save it on notion db
      display(`Message sent from ${sender} to ${recipient}!\n`);
      resetMenu();
      rl.prompt();
      break;

    case "read_user":
      recipient = value;
      fetchMessagesForUser(recipient); // fetch mail from notion db for recipient
      mode = "delete_message"; // from read, allow users to delete messages
      break;

    case "delete_message":
      if (value === "skip") {
        display("No messages marked as deleted.\n");
        resetMenu();
      } else {
        const index = parseInt(value, 10); // parse string to int
        if (!isNaN(index)) {
          markMessageAsDeleted(index);
        } else {
          display('Invalid input. Please enter a number or "skip".');
        }
      }
      break;
  }
}

// initialize CLI
rl.on("line", (line) => {
  const value = line.trim();
  processInput(value);
});

resetMenu(); // start by displaying the menu
