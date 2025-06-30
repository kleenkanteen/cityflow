import { relations } from "drizzle-orm/relations";
import { user, account, session, inventoryItem, equipmentRequest } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const equipmentRequestRelations = relations(equipmentRequest, ({one}) => ({
	inventoryItem: one(inventoryItem, {
		fields: [equipmentRequest.inventoryId],
		references: [inventoryItem.id]
	}),
}));

export const inventoryItemRelations = relations(inventoryItem, ({many}) => ({
	equipmentRequests: many(equipmentRequest),
}));