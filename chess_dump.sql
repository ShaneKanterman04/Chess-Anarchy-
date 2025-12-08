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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2ec9623f-b673-11f0-a7f6-42010a400002:1-133';

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
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES ('OscarAdmin123','Oscar123');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `custom_rules`
--

LOCK TABLES `custom_rules` WRITE;
/*!40000 ALTER TABLE `custom_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_rules` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gamematch`
--

LOCK TABLES `gamematch` WRITE;
/*!40000 ALTER TABLE `gamematch` DISABLE KEYS */;
INSERT INTO `gamematch` VALUES (2,'OscarAdmin123',NULL,NULL,'C'),(3,NULL,NULL,NULL,'7'),(4,NULL,NULL,NULL,'C'),(5,NULL,NULL,NULL,'c');
/*!40000 ALTER TABLE `gamematch` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `gamemode`
--

LOCK TABLES `gamemode` WRITE;
/*!40000 ALTER TABLE `gamemode` DISABLE KEYS */;
INSERT INTO `gamemode` VALUES ('C',NULL),('7',3);
/*!40000 ALTER TABLE `gamemode` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `match_spectators`
--

LOCK TABLES `match_spectators` WRITE;
/*!40000 ALTER TABLE `match_spectators` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_spectators` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `player`
--

LOCK TABLES `player` WRITE;
/*!40000 ALTER TABLE `player` DISABLE KEYS */;
INSERT INTO `player` VALUES ('','');
/*!40000 ALTER TABLE `player` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `rules`
--

LOCK TABLES `rules` WRITE;
/*!40000 ALTER TABLE `rules` DISABLE KEYS */;
INSERT INTO `rules` VALUES ('C','Bishop',0,0,7),('C','King',1,1,1),('C','Knight',2,1,0),('C','Pawn',0,1,0),('C','Queen',7,7,7),('C','Rook',7,7,0);
/*!40000 ALTER TABLE `rules` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `spectator`
--

LOCK TABLES `spectator` WRITE;
/*!40000 ALTER TABLE `spectator` DISABLE KEYS */;
INSERT INTO `spectator` VALUES ('','');
/*!40000 ALTER TABLE `spectator` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `start_board`
--

LOCK TABLES `start_board` WRITE;
/*!40000 ALTER TABLE `start_board` DISABLE KEYS */;
INSERT INTO `start_board` VALUES (1,'classic','[[\"br\", \"bn\", \"bb\", \"bq\", \"bk\", \"bb\", \"bn\", \"br\"], [\"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\"], [\"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"], [\"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"], [\"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"], [\"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"], [\"wr\", \"wn\", \"wb\", \"wq\", \"wk\", \"wb\", \"wn\", \"wr\"]]','C'),(2,'horde','[[\"br\", \"bn\", \"bb\", \"bq\", \"bk\", \"bb\", \"bn\", \"br\"], [\"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\"], [\"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"], [\"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"]]',NULL),(3,'black knight army','[[\"bn\", \"bn\", \"bn\", \"bn\", \"bn\", \"bn\", \"bn\", \"bn\"], [\"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\"], [\"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\"], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"], [\"wr\", \"wn\", \"wb\", \"wq\", \"wk\", \"wb\", \"wn\", \"wr\"]]',NULL),(4,'queens_vs_knights','[[\"bq\", \"bq\", \"bq\", \"bq\", \"bk\", \"bq\", \"bq\", \"bq\"], [\"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\", \"bp\"], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [\"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\", \"wp\"], [\"wn\", \"wn\", \"wn\", \"wn\", \"wk\", \"wn\", \"wn\", \"wn\"]]',NULL);
/*!40000 ALTER TABLE `start_board` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timers`
--

LOCK TABLES `timers` WRITE;
/*!40000 ALTER TABLE `timers` DISABLE KEYS */;
INSERT INTO `timers` VALUES (6,5400,0,'classic','C'),(7,3600,0,'rapid',NULL),(8,600,0,'blitz',NULL),(9,180,0,'bullet',NULL),(10,NULL,1,'',NULL),(11,600,1,'Standard','7');
/*!40000 ALTER TABLE `timers` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('','',NULL,NULL,NULL),('2222','',NULL,NULL,NULL),('fwd','qfew',NULL,NULL,NULL),('Game ','901062437Jj',NULL,NULL,NULL),('Oscar123','password123',NULL,NULL,NULL),('pet','pet',NULL,NULL,NULL),('Peter','peterpass',NULL,NULL,NULL),('Shane','root',NULL,NULL,NULL),('tep','tep',NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-08 10:09:33
