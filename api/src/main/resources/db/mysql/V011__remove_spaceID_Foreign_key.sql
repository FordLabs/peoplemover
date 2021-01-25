/*
    We run an update on the table because it is possible that during the blue green deploy some objects could be created without a Uuid
    We should have only added the Uuid in a first migration and push it, then run another migration to update the tables (but we combined them...)
*/
UPDATE assignment
INNER JOIN space
ON assignment.space_id = space.id
set assignment.space_uuid = space.uuid
WHERE assignment.space_id = space.id;

ALTER TABLE assignment DROP FOREIGN KEY FK_Assignment__Space;
ALTER TABLE assignment DROP COLUMN space_id;


UPDATE person
INNER JOIN space
ON person.space_id = space.id
set person.space_uuid = space.uuid
WHERE person.space_id = space.id;

ALTER TABLE person DROP FOREIGN KEY FK_Person__Space;
ALTER TABLE person DROP COLUMN space_id;


UPDATE product
INNER JOIN space
ON product.space_id = space.id
set product.space_uuid = space.uuid
WHERE product.space_id = space.id;

ALTER TABLE product DROP FOREIGN KEY FK_Product__Space;
ALTER TABLE product DROP COLUMN space_id;


UPDATE product_tag
INNER JOIN space
ON product_tag.space_id = space.id
set product_tag.space_uuid = space.uuid
WHERE product_tag.space_id = space.id;

ALTER TABLE product_tag DROP FOREIGN KEY FK_Product_Tag__Space;
ALTER TABLE product_tag DROP INDEX UQ_Product_Tag;
ALTER TABLE product_tag DROP COLUMN space_id;
ALTER TABLE product_tag ADD CONSTRAINT UQ_Product_Tag UNIQUE (space_uuid, name);


UPDATE space_locations
INNER JOIN space
ON space_locations.space_id = space.id
set space_locations.space_uuid = space.uuid
WHERE space_locations.space_id = space.id;

ALTER TABLE space_locations DROP FOREIGN KEY FK_Space_Location__Space;
ALTER TABLE space_locations DROP INDEX UQ_Location;
ALTER TABLE space_locations DROP COLUMN space_id;
ALTER TABLE space_locations ADD CONSTRAINT UQ_Location UNIQUE (space_uuid, name);


UPDATE space_roles
INNER JOIN space
ON space_roles.space_id = space.id
set space_roles.space_uuid = space.uuid
WHERE space_roles.space_id = space.id;

ALTER TABLE space_roles DROP FOREIGN KEY FK_Space_Roles__Space;
ALTER TABLE space_roles DROP INDEX UQ_Role;
ALTER TABLE space_roles DROP COLUMN space_id;
ALTER TABLE space_roles ADD CONSTRAINT UQ_Role UNIQUE (space_uuid, roles);


UPDATE user_space_mapping
INNER JOIN space
ON user_space_mapping.space_id = space.id
set user_space_mapping.space_uuid = space.uuid
WHERE user_space_mapping.space_id = space.id;

ALTER TABLE user_space_mapping DROP FOREIGN KEY FK_User__Space;
ALTER TABLE user_space_mapping DROP INDEX UQ_User_Space_Mapping;
ALTER TABLE user_space_mapping DROP COLUMN space_id;
ALTER TABLE user_space_mapping ADD CONSTRAINT UQ_User_Space_Mapping UNIQUE (space_uuid, user_id);