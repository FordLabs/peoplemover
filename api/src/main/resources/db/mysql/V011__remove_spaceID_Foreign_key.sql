ALTER TABLE assignment DROP FOREIGN KEY FK_Assignment__Space;
ALTER TABLE assignment DROP COLUMN space_id;

ALTER TABLE person DROP FOREIGN KEY FK_Person__Space;
ALTER TABLE person DROP COLUMN space_id;

ALTER TABLE product DROP FOREIGN KEY FK_Product__Space;
ALTER TABLE product DROP COLUMN space_id;
