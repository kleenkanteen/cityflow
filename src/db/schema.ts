import { pgTable, uuid, text, integer, timestamp, foreignKey, unique, numeric, boolean } from "drizzle-orm/pg-core"

export const inventoryItem = pgTable("inventory_item", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	quantity: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const account = pgTable("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const equipmentRequest = pgTable("equipment_request", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	requestorEmail: text("requestor_email").notNull(),
	inventoryId: uuid("inventory_id").notNull(),
	inventoryItemName: text("inventory_item_name").notNull(),
	quantity: integer().notNull(),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	status: text().default('pending').notNull(),
	denialReason: text("denial_reason"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventoryItem.id],
			name: "equipment_request_inventory_id_inventory_item_id_fk"
		}).onDelete("cascade"),
]);

export const asset = pgTable("asset", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	lng: numeric().notNull(),
	lat: numeric().notNull(),
	color: text().notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text().default('').notNull(),
	role: text().default('field_staff').notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const complaint = pgTable("complaint", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	email: text(),
	description: text().notNull(),
	location: text().notNull(),
	imageUrl: text("image_url"),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	reviewed: boolean().default(false).notNull(),
	resolved: timestamp(),
});

export const log = pgTable(
  "log",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    jobType: text("job_type").notNull(),
    technician: text("technician").notNull(),
    assetId: uuid("asset_id").notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.assetId],
      foreignColumns: [asset.id],
      name: "log_asset_id_asset_id_fk",
    }).onDelete("cascade"),
  ]
);
