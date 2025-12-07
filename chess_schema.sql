-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: 34.74.157.230    Database: chess
-- ------------------------------------------------------
-- Server version	8.0.41-google

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2ec9623f-b673-11f0-a7f6-42010a400002:1-116';

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `admin_ID` varchar(50) NOT NULL,
  `user_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`admin_ID`),
  KEY `user_ID` (`user_ID`),
  CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `user` (`user_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `custom_rules`
--

DROP TABLE IF EXISTS `custom_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `color` char(1) NOT NULL,
  `move_rules` json NOT NULL,
  `capture_rules` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gamematch`
--

DROP TABLE IF EXISTS `gamematch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gamematch` (
  `match_ID` int NOT NULL AUTO_INCREMENT,
  `admin_ID` varchar(50) DEFAULT NULL,
  `player1_ID` varchar(50) DEFAULT NULL,
  `player2_ID` varchar(50) DEFAULT NULL,
  `Ruleset_ID` varchar(100) NOT NULL,
  PRIMARY KEY (`match_ID`),
  KEY `fk_player1_ID` (`player1_ID`),
  KEY `fk_player2_ID` (`player2_ID`),
  KEY `fk_Ruleset_ID` (`Ruleset_ID`),
  KEY `fk_admin_ID` (`admin_ID`),
  CONSTRAINT `fk_admin_ID` FOREIGN KEY (`admin_ID`) REFERENCES `admin` (`admin_ID`),
  CONSTRAINT `fk_player1_ID` FOREIGN KEY (`player1_ID`) REFERENCES `player` (`player_ID`),
  CONSTRAINT `fk_player2_ID` FOREIGN KEY (`player2_ID`) REFERENCES `player` (`player_ID`),
  CONSTRAINT `fk_Ruleset_ID` FOREIGN KEY (`Ruleset_ID`) REFERENCES `gamemode` (`Ruleset_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gamemode`
--

DROP TABLE IF EXISTS `gamemode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gamemode` (
  `Ruleset_ID` varchar(100) NOT NULL,
  `match_ID` int DEFAULT NULL,
  PRIMARY KEY (`Ruleset_ID`),
  KEY `match_ID` (`match_ID`),
  CONSTRAINT `match_ID` FOREIGN KEY (`match_ID`) REFERENCES `gamematch` (`match_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `match_spectators`
--

DROP TABLE IF EXISTS `match_spectators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_spectators` (
  `match_ID` int NOT NULL,
  `spectator_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`match_ID`,`spectator_ID`),
  KEY `fk_spect_id` (`spectator_ID`),
  CONSTRAINT `fk_match` FOREIGN KEY (`match_ID`) REFERENCES `gamematch` (`match_ID`),
  CONSTRAINT `fk_spect_id` FOREIGN KEY (`spectator_ID`) REFERENCES `spectator` (`spectator_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player`
--

DROP TABLE IF EXISTS `player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player` (
  `player_ID` varchar(50) NOT NULL,
  `user_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`player_ID`),
  KEY `user_ID` (`user_ID`),
  CONSTRAINT `player_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `user` (`user_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rules`
--

DROP TABLE IF EXISTS `rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rules` (
  `Ruleset_ID` varchar(1) DEFAULT NULL,
  `piece_type` varchar(15) NOT NULL,
  `horizontal` int DEFAULT NULL,
  `vertical` int DEFAULT NULL,
  `diagonal` int DEFAULT NULL,
  PRIMARY KEY (`piece_type`),
  KEY `fk_rules` (`Ruleset_ID`),
  CONSTRAINT `fk_rules` FOREIGN KEY (`Ruleset_ID`) REFERENCES `gamemode` (`Ruleset_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spectator`
--

DROP TABLE IF EXISTS `spectator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spectator` (
  `spectator_ID` varchar(50) NOT NULL,
  `user_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`spectator_ID`),
  KEY `user_ID` (`user_ID`),
  CONSTRAINT `spectator_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `user` (`user_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `start_board`
--

DROP TABLE IF EXISTS `start_board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `start_board` (
  `board_num` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `layout` json DEFAULT NULL,
  `Ruleset_ID` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`board_num`),
  KEY `fk_Board_Ruleset_ID` (`Ruleset_ID`),
  CONSTRAINT `fk_Board_Ruleset_ID` FOREIGN KEY (`Ruleset_ID`) REFERENCES `gamemode` (`Ruleset_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timers`
--

DROP TABLE IF EXISTS `timers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timers` (
  `time_ID` int NOT NULL AUTO_INCREMENT,
  `duration_seconds` int DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL,
  `name` varchar(20) NOT NULL,
  `Ruleset_ID` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`time_ID`),
  KEY `fk_timer_Ruleset_ID` (`Ruleset_ID`),
  CONSTRAINT `fk_timer_Ruleset_ID` FOREIGN KEY (`Ruleset_ID`) REFERENCES `gamemode` (`Ruleset_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_ID` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `wins` int DEFAULT NULL,
  `draws` int DEFAULT NULL,
  `losses` int DEFAULT NULL,
  PRIMARY KEY (`user_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-07 11:07:23
