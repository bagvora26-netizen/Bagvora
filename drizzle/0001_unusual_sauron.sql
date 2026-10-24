CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`actorName` varchar(160),
	`action` varchar(120) NOT NULL,
	`entity` varchar(120) NOT NULL,
	`entityId` int,
	`oldValue` text,
	`newValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `commissionLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`orderId` int,
	`saleAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`commissionAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`period` varchar(7) NOT NULL,
	`status` enum('pending','approved','paid') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissionLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commissionSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`value` decimal(8,2) NOT NULL,
	`unit` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`orderId` int,
	`customerName` varchar(160) NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`comment` text,
	`imageUrl` text,
	`discountGranted` decimal(8,2) NOT NULL DEFAULT '0.00',
	`status` enum('pending','published','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financeEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('capital','revenue','cost','expense','salary','commission','withdrawal') NOT NULL,
	`description` varchar(220) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`reference` varchar(120),
	`entryDate` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `financeEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`type` enum('receive','issue','adjustment','return') NOT NULL,
	`quantity` int NOT NULL,
	`source` varchar(120),
	`reference` varchar(120),
	`note` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(220) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	`costPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`customerPhone` varchar(40) NOT NULL,
	`customerAddress` text,
	`status` enum('new','confirmed','shipping','delivered','cancelled') NOT NULL DEFAULT 'new',
	`paymentStatus` enum('pending','paid','cod','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	`deliveryFee` decimal(12,2) NOT NULL DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`referralCode` varchar(60),
	`referralMemberId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(60) NOT NULL,
	`name` varchar(220) NOT NULL,
	`description` text,
	`category` varchar(120) NOT NULL,
	`sourceType` enum('china','handmade','local','dropship') NOT NULL DEFAULT 'local',
	`sourceName` varchar(180),
	`imageUrl` text,
	`costPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	`sellingPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	`stock` int NOT NULL DEFAULT 0,
	`minStock` int NOT NULL DEFAULT 5,
	`status` enum('active','draft','archived') NOT NULL DEFAULT 'active',
	`isFeatured` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`role` enum('admin','employee','marketer') NOT NULL DEFAULT 'employee',
	`employeeCode` varchar(32) NOT NULL,
	`commissionRate` decimal(6,2) NOT NULL DEFAULT '5.00',
	`monthlySales` decimal(12,2) NOT NULL DEFAULT '0.00',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teamMembers_email_unique` UNIQUE(`email`),
	CONSTRAINT `teamMembers_employeeCode_unique` UNIQUE(`employeeCode`)
);
