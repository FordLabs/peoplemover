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

ALTER TABLE space_roles DROP FOREIGN KEY FK_Space_Roles__Space;
ALTER TABLE space_roles DROP INDEX UQ_Role;
ALTER TABLE space_roles DROP COLUMN space_id;
ALTER TABLE space_roles ADD CONSTRAINT UQ_Role UNIQUE (space_uuid, roles);

ALTER TABLE user_space_mapping DROP FOREIGN KEY FK_User__Space;
ALTER TABLE user_space_mapping DROP INDEX UQ_User_Space_Mapping;
ALTER TABLE user_space_mapping DROP COLUMN space_id;
ALTER TABLE user_space_mapping ADD CONSTRAINT UQ_User_Space_Mapping UNIQUE (space_uuid, user_id);