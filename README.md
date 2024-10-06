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

#### Future Improvements

#### Technical/Product Choices

#### References
- https://developers.notion.com/docs/create-a-notion-integration
- https://github.com/makenotion/notion-sdk-js/blob/main/examples/web-form-with-express/server.js
- https://developers.notion.com/reference/post-database-query
- https://developers.notion.com/docs/authorization
- https://developers.notion.com/reference/status-codes
- https://nodejs.org/api/readline.html
- https://www.youtube.com/watch?v=vU6OTnhj3wM



