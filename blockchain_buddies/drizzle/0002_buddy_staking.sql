ALTER TABLE "blockchain_buddies" ADD COLUMN "synergy_role" text DEFAULT 'companion' NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_buddies" ADD COLUMN "automation_level" text DEFAULT 'watcher' NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_buddies" ADD COLUMN "staking_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_buddies" ADD COLUMN "stake_amount_lamports" text;--> statement-breakpoint
ALTER TABLE "blockchain_buddies" ADD COLUMN "buddy_wallet" text;--> statement-breakpoint
ALTER TABLE "blockchain_buddies" ADD COLUMN "last_mission_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "blockchain_buddies_staking_status_idx" ON "blockchain_buddies" USING btree ("staking_status");--> statement-breakpoint
CREATE INDEX "blockchain_buddies_automation_level_idx" ON "blockchain_buddies" USING btree ("automation_level");
