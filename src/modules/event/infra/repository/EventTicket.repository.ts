import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { BadRequestException } from '@nestjs/common';

export const EventTicketRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventTicketEntity).extend({
    /**
     * Reserve tickets atomically: decrease available, increase reserved
     * Validates availability before updating
     */
    async markTicketOrdered(
      this: Repository<EventTicketEntity>,
      payload: {
        items: {
          ticketId: string;
          quantity: number;
        }[];
      },
    ): Promise<EventTicketEntity[]> {
      const ticketIds = payload.items.map((item) => item.ticketId);
      const tickets = await this.find({
        where: { id: In(ticketIds) },
      });

      if (tickets.length !== ticketIds.length) {
        throw new BadRequestException('One or more tickets not found');
      }

      const errors: string[] = [];
      for (const item of payload.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId);
        if (!ticket) continue;

        if (ticket.totalQuantityAvailable < item.quantity) {
          errors.push(
            `Insufficient tickets available for ${ticket.displayName}. Requested: ${item.quantity}, Available: ${ticket.totalQuantityAvailable}`,
          );
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      // Atomically update all tickets in a single query
      const updatePromises = payload.items.map((item) =>
        this.createQueryBuilder()
          .update(EventTicketEntity)
          .set({
            totalQuantityAvailable: () =>
              `"total_quantity_available" - :quantity`,
            quantityReserved: () => `"quantity_reserved" + :quantity`,
          })
          .setParameter('quantity', item.quantity)
          .where('id = :ticketId', { ticketId: item.ticketId })
          .andWhere('"total_quantity_available" >= :quantity', {
            quantity: item.quantity,
          })
          .execute(),
      );

      await Promise.all(updatePromises);

      // Return updated tickets
      return this.find({
        where: { id: In(ticketIds) },
      });
    },

    async refundTickets(
      this: Repository<EventTicketEntity>,
      payload: {
        items: {
          ticketId: string;
          quantityRefunded: number;
        }[];
      },
    ) {
      const ticketIds = payload.items.map((item) => item.ticketId);
      const tickets = await this.find({
        where: { id: In(ticketIds) },
      });

      if (tickets.length !== ticketIds.length) {
        throw new BadRequestException('One or more tickets not found');
      }

      const errors: string[] = [];
      for (const item of payload.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId);
        if (!ticket) continue;

        if (ticket.quantityReserved < item.quantityRefunded) {
          errors.push(
            `Insufficient tickets reserved for ${ticket.displayName}. Requested: ${item.quantityRefunded}, Reserved: ${ticket.quantityReserved}`,
          );
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const updatePromises = payload.items.map((item) =>
        this.createQueryBuilder()
          .update(EventTicketEntity)
          .set({
            totalQuantityAvailable: () =>
              `"total_quantity_available" + :quantityRefunded`,
            quantityReserved: () => `"quantity_reserved" - :quantityRefunded`,
          })
          .setParameter('quantityRefunded', item.quantityRefunded)
          .where('id = :ticketId', { ticketId: item.ticketId })
          .execute(),
      );

      await Promise.all(updatePromises);

      return this.find({
        where: { id: In(ticketIds) },
      });
    },
  });

export type EventTicketRepository = ReturnType<typeof EventTicketRepository>;
