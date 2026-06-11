# ManhwaForge AI - Database Schema Design

## Overview

The ManhwaForge AI platform requires a comprehensive relational database schema to support user projects, character management, story generation, artwork creation, and webtoon editing. This document outlines the complete data model.

## Core Tables

### users (Extended from template)
Stores user account information and authentication details.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| openId | VARCHAR(64) | UNIQUE, NOT NULL | Manus OAuth identifier |
| name | TEXT | | User's display name |
| email | VARCHAR(320) | | User's email address |
| loginMethod | VARCHAR(64) | | Authentication method (e.g., "manus") |
| role | ENUM('user', 'admin') | DEFAULT 'user' | User role for access control |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |
| lastSignedIn | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last login date |

### projects
Stores manhwa/webtoon series information created by users.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique project identifier |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | Creator/owner of the project |
| title | VARCHAR(255) | NOT NULL | Project title |
| synopsis | TEXT | | Project description and plot summary |
| genre | VARCHAR(64) | | Primary genre (Murim, Fantasy, Action, Romance, Sci-Fi, Horror, Comedy, Slice of Life) |
| coverImageKey | VARCHAR(255) | | S3 storage key for cover art |
| coverImageUrl | TEXT | | S3 URL for cover art display |
| status | ENUM('draft', 'in_progress', 'completed', 'archived') | DEFAULT 'draft' | Project status |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Project creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### characters
Stores character profiles for reuse across projects.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique character identifier |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | Character creator |
| projectId | INT | FOREIGN KEY (projects.id), NULLABLE | Associated project (NULL for library) |
| name | VARCHAR(255) | NOT NULL | Character name |
| role | VARCHAR(128) | | Character role/archetype |
| personalityTraits | TEXT | | JSON array of personality traits |
| biography | TEXT | | Character background and history |
| clothingDescription | TEXT | | Detailed clothing/appearance description |
| specialAbilities | TEXT | | Character abilities or powers |
| visualNotes | TEXT | | Additional visual design notes |
| portraitImageKey | VARCHAR(255) | | S3 storage key for character portrait |
| portraitImageUrl | TEXT | | S3 URL for character portrait |
| aiGeneratedDescription | TEXT | | AI-generated character description |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Character creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### stories
Stores story outlines and narrative content for projects.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique story identifier |
| projectId | INT | FOREIGN KEY (projects.id), NOT NULL | Associated project |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | Story creator |
| title | VARCHAR(255) | NOT NULL | Story title |
| genre | VARCHAR(64) | | Story genre |
| plotOutline | TEXT | | AI-generated plot outline |
| worldBuilding | TEXT | | World-building details |
| themes | TEXT | | JSON array of story themes |
| status | ENUM('draft', 'outline', 'in_progress', 'completed') | DEFAULT 'draft' | Story development status |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Story creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### chapters
Stores chapter information within stories.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique chapter identifier |
| storyId | INT | FOREIGN KEY (stories.id), NOT NULL | Associated story |
| projectId | INT | FOREIGN KEY (projects.id), NOT NULL | Associated project |
| chapterNumber | INT | NOT NULL | Chapter sequence number |
| title | VARCHAR(255) | NOT NULL | Chapter title |
| summary | TEXT | | Chapter summary/description |
| outline | TEXT | | Chapter outline |
| dialogueSuggestions | TEXT | | AI-generated dialogue suggestions |
| status | ENUM('draft', 'in_progress', 'completed') | DEFAULT 'draft' | Chapter status |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Chapter creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### panels
Stores individual webtoon panels within chapters.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique panel identifier |
| chapterId | INT | FOREIGN KEY (chapters.id), NOT NULL | Associated chapter |
| projectId | INT | FOREIGN KEY (projects.id), NOT NULL | Associated project |
| panelNumber | INT | NOT NULL | Panel sequence number |
| imageKey | VARCHAR(255) | | S3 storage key for panel image |
| imageUrl | TEXT | | S3 URL for panel image |
| width | INT | | Panel width in pixels |
| height | INT | | Panel height in pixels |
| positionX | INT | DEFAULT 0 | Horizontal position in layout |
| positionY | INT | DEFAULT 0 | Vertical position in layout |
| zIndex | INT | DEFAULT 0 | Layer ordering |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Panel creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### panelElements
Stores text elements (speech bubbles, narration) within panels.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique element identifier |
| panelId | INT | FOREIGN KEY (panels.id), NOT NULL | Associated panel |
| type | ENUM('speech_bubble', 'narration', 'thought') | NOT NULL | Element type |
| content | TEXT | NOT NULL | Text content |
| fontFamily | VARCHAR(128) | DEFAULT 'Arial' | Font name |
| fontSize | INT | DEFAULT 16 | Font size in pixels |
| fontColor | VARCHAR(7) | DEFAULT '#000000' | Text color (hex) |
| positionX | INT | DEFAULT 0 | Horizontal position |
| positionY | INT | DEFAULT 0 | Vertical position |
| width | INT | | Element width |
| height | INT | | Element height |
| characterId | INT | FOREIGN KEY (characters.id), NULLABLE | Associated character (for speech) |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Element creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### artwork
Stores generated artwork and assets for projects.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique artwork identifier |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | Creator |
| projectId | INT | FOREIGN KEY (projects.id), NULLABLE | Associated project |
| type | ENUM('character_portrait', 'background', 'action_scene', 'props', 'other') | NOT NULL | Artwork type |
| style | VARCHAR(64) | | Art style (anime, webtoon, fantasy, semi-realistic) |
| prompt | TEXT | NOT NULL | Generation prompt |
| imageKey | VARCHAR(255) | NOT NULL | S3 storage key |
| imageUrl | TEXT | NOT NULL | S3 URL for display |
| generationModel | VARCHAR(128) | | AI model used for generation |
| generationTime | INT | | Generation time in seconds |
| isFavorite | BOOLEAN | DEFAULT FALSE | Favorite flag |
| collectionId | INT | FOREIGN KEY (artwork_collections.id), NULLABLE | Associated collection |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### artwork_collections
Stores user-created artwork collections/galleries.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique collection identifier |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | Collection owner |
| projectId | INT | FOREIGN KEY (projects.id), NULLABLE | Associated project |
| name | VARCHAR(255) | NOT NULL | Collection name |
| description | TEXT | | Collection description |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification date |

### exports
Stores export history and metadata.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique export identifier |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | User who exported |
| projectId | INT | FOREIGN KEY (projects.id), NOT NULL | Exported project |
| chapterId | INT | FOREIGN KEY (chapters.id), NULLABLE | Specific chapter (if applicable) |
| exportType | ENUM('png', 'pdf', 'zip', 'individual_panels') | NOT NULL | Export format |
| fileKey | VARCHAR(255) | NOT NULL | S3 storage key for export file |
| fileUrl | TEXT | NOT NULL | S3 URL for download |
| fileSize | BIGINT | | File size in bytes |
| resolution | VARCHAR(64) | | Export resolution |
| status | ENUM('pending', 'processing', 'completed', 'failed') | DEFAULT 'pending' | Export status |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Export creation date |

### generationHistory
Tracks AI generation requests for analytics and debugging.

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique history entry identifier |
| userId | INT | FOREIGN KEY (users.id), NOT NULL | User who requested generation |
| projectId | INT | FOREIGN KEY (projects.id), NULLABLE | Associated project |
| generationType | ENUM('story', 'character', 'artwork', 'dialogue') | NOT NULL | Type of generation |
| prompt | TEXT | NOT NULL | Input prompt |
| result | LONGTEXT | | Generated result/output |
| model | VARCHAR(128) | | AI model used |
| tokensUsed | INT | | Tokens consumed |
| status | ENUM('success', 'failed', 'partial') | DEFAULT 'success' | Generation status |
| errorMessage | TEXT | | Error details if failed |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request timestamp |

## Relationships Summary

- **users** → **projects** (1:N) - One user creates many projects
- **users** → **characters** (1:N) - One user creates many characters
- **users** → **stories** (1:N) - One user creates many stories
- **users** → **artwork** (1:N) - One user creates many artwork pieces
- **projects** → **characters** (1:N) - One project uses many characters
- **projects** → **stories** (1:N) - One project contains many stories
- **projects** → **chapters** (1:N) - One project has many chapters
- **projects** → **panels** (1:N) - One project has many panels
- **stories** → **chapters** (1:N) - One story has many chapters
- **chapters** → **panels** (1:N) - One chapter has many panels
- **panels** → **panelElements** (1:N) - One panel has many text elements
- **artwork** → **artwork_collections** (N:1) - Many artworks in one collection

## Indexing Strategy

Key indexes for performance:

```sql
-- User lookups
CREATE INDEX idx_users_openId ON users(openId);

-- Project queries
CREATE INDEX idx_projects_userId ON projects(userId);
CREATE INDEX idx_projects_status ON projects(status);

-- Character queries
CREATE INDEX idx_characters_userId ON characters(userId);
CREATE INDEX idx_characters_projectId ON characters(projectId);

-- Story and chapter queries
CREATE INDEX idx_stories_projectId ON stories(projectId);
CREATE INDEX idx_chapters_storyId ON chapters(storyId);
CREATE INDEX idx_chapters_projectId ON chapters(projectId);

-- Panel queries
CREATE INDEX idx_panels_chapterId ON panels(chapterId);
CREATE INDEX idx_panels_projectId ON panels(projectId);

-- Artwork queries
CREATE INDEX idx_artwork_userId ON artwork(userId);
CREATE INDEX idx_artwork_projectId ON artwork(projectId);
CREATE INDEX idx_artwork_collectionId ON artwork(collectionId);

-- Export queries
CREATE INDEX idx_exports_userId ON exports(userId);
CREATE INDEX idx_exports_projectId ON exports(projectId);

-- Generation history
CREATE INDEX idx_generationHistory_userId ON generationHistory(userId);
CREATE INDEX idx_generationHistory_createdAt ON generationHistory(createdAt);
```

## Notes

- All timestamps use UTC
- File storage keys are stored in database; actual files are in S3
- JSON fields (personalityTraits, themes, etc.) are stored as TEXT and parsed on application layer
- Foreign keys enforce referential integrity
- Soft deletes can be implemented by adding a `deletedAt` column if needed
