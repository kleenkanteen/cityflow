ALTER TABLE "user" ALTER COLUMN "image" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();