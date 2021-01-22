ALTER TABLE assignment DROP FOREIGN KEY FK_Assignment__Space;
ALTER TABLE assignment DROP COLUMN space_id;

ALTER TABLE person DROP FOREIGN KEY FK_Person__Space;
ALTER TABLE person DROP COLUMN space_id;

ALTER TABLE product DROP FOREIGN KEY FK_Product__Space;
ALTER TABLE product DROP COLUMN space_id;

ALTER TABLE product_tag DROP FOREIGN KEY FK_Product_Tag__Space;
ALTER TABLE product_tag DROP INDEX UQ_Product_Tag;
ALTER TABLE product_tag DROP COLUMN space_id;
ALTER TABLE product_tag ADD CONSTRAINT UQ_Product_Tag UNIQUE (space_uuid, name);

ALTER TABLE space_locations DROP FOREIGN KEY FK_Space_Location__Space;
ALTER TABLE space_locations DROP INDEX UQ_Location;
ALTER TABLE space_locations DROP COLUMN space_id;
ALTER TABLE space_locations ADD CONSTRAINT UQ_Location UNIQUE (space_uuid, name);