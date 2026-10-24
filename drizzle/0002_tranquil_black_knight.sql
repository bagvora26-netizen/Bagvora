CREATE TABLE `dropshipWebhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(80) NOT NULL,
	`eventId` varchar(180) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`orderNumber` varchar(40),
	`supplierOrderId` varchar(120),
	`status` varchar(60),
	`payload` text NOT NULL,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dropshipWebhookEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `dropshipWebhookEvents_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `supplierOrderId` varchar(120);--> statement-breakpoint
ALTER TABLE `orders` ADD `dropshipStatus` varchar(60);