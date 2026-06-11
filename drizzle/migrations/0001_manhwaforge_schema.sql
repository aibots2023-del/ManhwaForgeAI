-- Projects table
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`synopsis` text,
	`genre` varchar(64),
	`coverImageKey` varchar(255),
	`coverImageUrl` text,
	`status` enum('draft','in_progress','completed','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

-- Characters table
CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`name` varchar(255) NOT NULL,
	`role` varchar(128),
	`personalityTraits` text,
	`biography` text,
	`clothingDescription` text,
	`specialAbilities` text,
	`visualNotes` text,
	`portraitImageKey` varchar(255),
	`portraitImageUrl` text,
	`aiGeneratedDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`),
	CONSTRAINT `characters_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `characters_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`)
);

-- Stories table
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`genre` varchar(64),
	`plotOutline` text,
	`worldBuilding` text,
	`themes` text,
	`status` enum('draft','outline','in_progress','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `stories_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`),
	CONSTRAINT `stories_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

-- Chapters table
CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`projectId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text,
	`outline` text,
	`dialogueSuggestions` text,
	`status` enum('draft','in_progress','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`),
	CONSTRAINT `chapters_storyId_fk` FOREIGN KEY (`storyId`) REFERENCES `stories`(`id`),
	CONSTRAINT `chapters_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`)
);

-- Panels table
CREATE TABLE `panels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterId` int NOT NULL,
	`projectId` int NOT NULL,
	`panelNumber` int NOT NULL,
	`imageKey` varchar(255),
	`imageUrl` text,
	`width` int,
	`height` int,
	`positionX` int NOT NULL DEFAULT 0,
	`positionY` int NOT NULL DEFAULT 0,
	`zIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `panels_id` PRIMARY KEY(`id`),
	CONSTRAINT `panels_chapterId_fk` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`),
	CONSTRAINT `panels_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`)
);

-- Panel Elements table
CREATE TABLE `panelElements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`panelId` int NOT NULL,
	`type` enum('speech_bubble','narration','thought') NOT NULL,
	`content` text NOT NULL,
	`fontFamily` varchar(128) NOT NULL DEFAULT 'Arial',
	`fontSize` int NOT NULL DEFAULT 16,
	`fontColor` varchar(7) NOT NULL DEFAULT '#000000',
	`positionX` int NOT NULL DEFAULT 0,
	`positionY` int NOT NULL DEFAULT 0,
	`width` int,
	`height` int,
	`characterId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `panelElements_id` PRIMARY KEY(`id`),
	CONSTRAINT `panelElements_panelId_fk` FOREIGN KEY (`panelId`) REFERENCES `panels`(`id`),
	CONSTRAINT `panelElements_characterId_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`)
);

-- Artwork Collections table
CREATE TABLE `artworkCollections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artworkCollections_id` PRIMARY KEY(`id`),
	CONSTRAINT `artworkCollections_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `artworkCollections_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`)
);

-- Artwork table
CREATE TABLE `artwork` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`type` enum('character_portrait','background','action_scene','props','other') NOT NULL,
	`style` varchar(64),
	`prompt` text NOT NULL,
	`imageKey` varchar(255) NOT NULL,
	`imageUrl` text NOT NULL,
	`generationModel` varchar(128),
	`generationTime` int,
	`isFavorite` boolean NOT NULL DEFAULT false,
	`collectionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artwork_id` PRIMARY KEY(`id`),
	CONSTRAINT `artwork_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `artwork_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`),
	CONSTRAINT `artwork_collectionId_fk` FOREIGN KEY (`collectionId`) REFERENCES `artworkCollections`(`id`)
);

-- Exports table
CREATE TABLE `exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int NOT NULL,
	`chapterId` int,
	`exportType` enum('png','pdf','zip','individual_panels') NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` bigint,
	`resolution` varchar(64),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exports_id` PRIMARY KEY(`id`),
	CONSTRAINT `exports_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `exports_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`),
	CONSTRAINT `exports_chapterId_fk` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`)
);

-- Generation History table
CREATE TABLE `generationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`generationType` enum('story','character','artwork','dialogue') NOT NULL,
	`prompt` text NOT NULL,
	`result` text,
	`model` varchar(128),
	`tokensUsed` int,
	`status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `generationHistory_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `generationHistory_projectId_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`)
);

-- Create indexes for performance
CREATE INDEX `idx_projects_userId` ON `projects`(`userId`);
CREATE INDEX `idx_projects_status` ON `projects`(`status`);
CREATE INDEX `idx_characters_userId` ON `characters`(`userId`);
CREATE INDEX `idx_characters_projectId` ON `characters`(`projectId`);
CREATE INDEX `idx_stories_projectId` ON `stories`(`projectId`);
CREATE INDEX `idx_chapters_storyId` ON `chapters`(`storyId`);
CREATE INDEX `idx_chapters_projectId` ON `chapters`(`projectId`);
CREATE INDEX `idx_panels_chapterId` ON `panels`(`chapterId`);
CREATE INDEX `idx_panels_projectId` ON `panels`(`projectId`);
CREATE INDEX `idx_artwork_userId` ON `artwork`(`userId`);
CREATE INDEX `idx_artwork_projectId` ON `artwork`(`projectId`);
CREATE INDEX `idx_artwork_collectionId` ON `artwork`(`collectionId`);
CREATE INDEX `idx_exports_userId` ON `exports`(`userId`);
CREATE INDEX `idx_exports_projectId` ON `exports`(`projectId`);
CREATE INDEX `idx_generationHistory_userId` ON `generationHistory`(`userId`);
CREATE INDEX `idx_generationHistory_createdAt` ON `generationHistory`(`createdAt`);
