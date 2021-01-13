ALTER TABLE space ADD UNIQUE INDEX space_uuid_index (uuid (36));
ALTER TABLE person ADD COLUMN space_uuid varchar(36) NOT NULL;

UPDATE person
INNER JOIN space
ON person.space_id = space.id
set person.space_uuid = space.uuid
WHERE person.space_id = space.id


ALTER TABLE person ADD CONSTRAINT FK_Person__Space__uuid FOREIGN KEY (space_uuid) REFERENCES space (uuid);