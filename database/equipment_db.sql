-- Networking Lab Equipment Inventory
-- Import this in phpMyAdmin (Import tab) or paste it into the SQL tab.

CREATE DATABASE IF NOT EXISTS `equipment_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `equipment_db`;

DROP TABLE IF EXISTS `equipment`;

CREATE TABLE `equipment` (
  `id`         VARCHAR(36)  NOT NULL,
  `asset_tag`  VARCHAR(50)  NOT NULL,
  `name`       VARCHAR(150) NOT NULL,
  `category`   VARCHAR(50)  NOT NULL,
  `location`   VARCHAR(150) NOT NULL DEFAULT '',
  `status`     ENUM('Available', 'In use', 'Under repair') NOT NULL,
  `notes`      TEXT         NULL,
  `created_at` DATETIME     NOT NULL,
  `updated_at` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asset_tag` (`asset_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `equipment`
  (`id`, `asset_tag`, `name`, `category`, `location`, `status`, `notes`, `created_at`, `updated_at`)
VALUES
  ('b1a2c3d4-1111-4a2b-8c3d-000000000001', 'NET-SW-001', 'Cisco Catalyst 2960 Switch', 'Switch',
   'Rack A, Room LB-465', 'Available', '24-port, used for VLAN labs.',
   '2026-08-01 02:00:00', '2026-08-01 02:00:00'),
  ('b1a2c3d4-2222-4a2b-8c3d-000000000002', 'NET-RT-001', 'Cisco 4321 ISR Router', 'Router',
   'Rack B, Room LB-465', 'In use', 'Reserved for routing protocols section, Tue/Thu.',
   '2026-08-01 02:05:00', '2026-09-10 06:30:00'),
  ('b1a2c3d4-3333-4a2b-8c3d-000000000003', 'NET-FW-001', 'Fortinet FortiGate 60F', 'Firewall',
   'Storage Cabinet, Room LB-465', 'Under repair', 'Power supply issue reported 2026-09-05.',
   '2026-08-01 02:10:00', '2026-09-05 09:15:00');
