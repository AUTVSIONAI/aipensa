import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Composite index for Messages queries filtering by companyId + createdAt
    // Used by GetMessageRangeService, ListMessagesServiceAll
    await queryInterface.addIndex("Messages", ["companyId", "createdAt"], {
      name: "idx_messages_company_created_at"
    }).catch(() => {});

    // Index for TicketTraking queries ordering by ticketId + id DESC
    await queryInterface.addIndex("TicketTraking", ["ticketId", "id"], {
      name: "idx_ticket_traking_ticket_id_desc"
    }).catch(() => {});

    // Index for Messages fromMe queries
    await queryInterface.addIndex("Messages", ["companyId", "fromMe", "createdAt"], {
      name: "idx_messages_company_from_me_created"
    }).catch(() => {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Messages", "idx_messages_company_created_at").catch(() => {});
    await queryInterface.removeIndex("TicketTraking", "idx_ticket_traking_ticket_id_desc").catch(() => {});
    await queryInterface.removeIndex("Messages", "idx_messages_company_from_me_created").catch(() => {});
  }
};
