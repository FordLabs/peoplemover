ALTER TABLE person MODIFY space_uuid varchar(36) NOT NULL;
ALTER TABLE product MODIFY space_uuid varchar(36) NOT NULL;
ALTER TABLE space_locations MODIFY space_uuid varchar(36) NOT NULL;
ALTER TABLE product_tag MODIFY space_uuid varchar(36) NOT NULL;
ALTER TABLE space_roles MODIFY space_uuid varchar(36) NOT NULL;
ALTER TABLE user_space_mapping MODIFY space_uuid varchar(36) NOT NULL;
ALTER TABLE assignment MODIFY space_uuid varchar(36) NOT NULL;