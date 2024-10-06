## Space Mail

### Description

**Space Mail** is a command-line interface application that enables users to send, read, and delete messages via a Notion database. This program provides an engaging way to send virtual mail between users, with messages stored and managed through the Notion API. Key features include:

- **Send Mail**: Users can enter a sender, recipient, and message, which will then be saved to a Notion database as a new entry.
- **Read Mail**: Users can check for any mail sent to a specific recipient. If messages are found, the sender, message content, and timestamp are displayed.

**Additional Improvements**
- **Delete Mail**: After reading messages from their inbox, users can delete individual messages by providing an index number or delete all messages in their inbox at once.
- **Timestamp Formatting**: Messages display the timestamp of when they were sent, formatted in a human-readable way (e.g., "October 6, 2024 at 6:14 AM").

### How to Install and Run the Program

#### Prerequisites

- Node.js v14 or higher
- Notion API access (Notion account, [integration with a Notion database](https://developers.notion.com/docs/create-a-notion-integration#getting-started))

#### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/space-mail-cli.git](https://github.com/amyxu-08/notion-mail-system.git
   cd notion-mail-system
2. **Install Dependencies**:
   ```bash
   npm install @notionhq/client dotenv
3. **Run SpaceMail**:
   ```bash
   node spacemail.js

### Technical/Product Choices
- **State Driven Transition Modes:** I decided to use a mode variable to track the different states (ex. menu, sending, reading, deleting, etc) because this made the code more modular and more extendable. It made the code more modular because all the code tied to reading messages was tied to the reading state only, all the code tied to sending messages was tied to the sending state and so on. It also helped me have a clear picture of the user flow because the mode variable allowed these different states to be well defined and clearly scoped. Therefore, state driven transition modes allowed the code to be more extendable because when I wanted to create more user actions (ex. deletion), I would create the mode first (mode = "delete_message") and then work from there. 
- **Soft Deletion:** Messages are not actually deleted from the Notion database. Instead, they are marked as "deleted" in the Notion database by toggling a boolean flag (Deleted: true) which allows for easier future recovery of messages and also an easier implementation. For example, working with different properties of databases at that point was something I had become familar with from creating new rows in the databases and querying them for reads. Therefore, adding another column Deleted with a checkbox (since a message can only ever be deleted or not deleted) meant that for the existing code I would just need to ensure the default value for Deleted is false upon creation and the query ignores Deleted messages for read. Similarly, the deletion functions just needed to update the property value for one or more rows of the database. 
- **Human Readable Timestamps:** Since Notion stores timestamps in ISO format, which can be difficult to read, a I wrote a function to format timestamps into a readable form like October 6, 2024 at 6:14 AM, which is a more common format and easier to understand at a glance.


### Future Improvements
- **Testing Suite:** The application as of now has no a comprehensive test suite. Testing could be implemented using Mocha and Chai to structure unit tests and Sinon to stub and fake the calls to the Notion API by providing canned responses to test against the createNotionPage, fetchMessagesForUser, markMessageAsDeleted, and markAllMessagesAsDeleted functions. Specifically, we could test cases of malformed input or failed API requests.
- **User Authentication:** Currently, any user could send messages, read messages, and delete messages as if they were another user. Realistically, this is a huge security breach for Space Mail. To implement basic authentication, we could have user sign up or log in on first prompt.
   - To sign up: Users are prompted to type their name and password. Their name and password are stored together. 
   - To log in: Users are prompted to type their name and password. These are checked against existing stored name and passwords.
- **Duplicate Users:** Instead of only using names, we can also have a email field where, similar to regular emails, these must be unique (ie. checked against all existing emails upon creation/sign up). Therefore, when users are choosing to whom to send the email, they type in both the name (for display purposes) and the email of the recipient. Likewise, the sender's name and email are recorded.
- **Search by Keyword:** We can enable searching messages by keyword using Notion's database query and filtering using 'contains: keyword' on the message property. This could be implemented in the read user flow where once the user decides they want to read instead of send, they can either read specific emails based on keyword searching or read all emails (current implementation). 

### References
- [Create a Notion Integration](https://developers.notion.com/docs/create-a-notion-integration)
- [Notion SDK Example](https://github.com/makenotion/notion-sdk-js/blob/main/examples/web-form-with-express/server.js)
- [Notion Database Query Documentation](https://developers.notion.com/reference/post-database-query)
- [Notion Authorization Documentation](https://developers.notion.com/docs/authorization)
- [Notion Status Codes](https://developers.notion.com/reference/status-codes)
- [ReadLine NodeJS Documentation](https://nodejs.org/api/readline.html)
- [NodeJS For Beginners: Working With The ReadLine Module](https://www.youtube.com/watch?v=vU6OTnhj3wM)
- [DateTimeFormat JavaScript Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)



