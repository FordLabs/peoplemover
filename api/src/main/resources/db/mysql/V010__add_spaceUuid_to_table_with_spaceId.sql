ALTER TABLE space ADD UNIQUE INDEX space_uuid_index (uuid (36));
ALTER TABLE person ADD COLUMN space_uuid varchar(36) NOT NULL;

UPDATE person
INNER JOIN space
ON person.space_id = space.id
set person.space_uuid = space.uuid
WHERE person.space_id = space.id;


ALTER TABLE person ADD CONSTRAINT FK_Person__Space__uuid FOREIGN KEY (space_uuid) REFERENCES space (uuid) ON DELETE CASCADE;

ALTER TABLE product ADD COLUMN space_uuid varchar(36) NOT NULL;

UPDATE product
INNER JOIN space
ON product.space_id = space.id
set product.space_uuid = space.uuid
WHERE product.space_id = space.id;


ALTER TABLE product ADD CONSTRAINT FK_Product__Space__uuid FOREIGN KEY (space_uuid) REFERENCES space (uuid) ON DELETE CASCADE;

ALTER TABLE space_locations ADD COLUMN space_uuid varchar(36) NOT NULL;

UPDATE space_locations
INNER JOIN space
ON space_locations.space_id = space.id
set space_locations.space_uuid = space.uuid
WHERE space_locations.space_id = space.id;


ALTER TABLE space_locations ADD CONSTRAINT FK_Locations__Space__uuid FOREIGN KEY (space_uuid) REFERENCES space (uuid) ON DELETE CASCADE;

ALTER TABLE product_tag ADD COLUMN space_uuid varchar(36) NOT NULL;

UPDATE product_tag
INNER JOIN space
ON product_tag.space_id = space.id
set product_tag.space_uuid = space.uuid
WHERE product_tag.space_id = space.id;


ALTER TABLE product_tag ADD CONSTRAINT FK_Product_Tag__Space__uuid FOREIGN KEY (space_uuid) REFERENCES space (uuid) ON DELETE CASCADE;

ALTER TABLE space_roles ADD COLUMN space_uuid varchar(36) NOT NULL;

UPDATE space_roles
INNER JOIN space
ON space_roles.space_id = space.id
set space_roles.space_uuid = space.uuid
WHERE space_roles.space_id = space.id;


ALTER TABLE space_roles ADD CONSTRAINT FK_Roles__Space__uuid FOREIGN KEY (space_uuid) REFERENCES space (uuid) ON DELETE CASCADE;
