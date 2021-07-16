ALTER TABLE `person` ADD COLUMN `new_person_date`  date;

UPDATE person SET new_person_date = CURDATE() WHERE new_person = TRUE
