ALTER TABLE user_space_mapping ADD COLUMN permission varchar(36) NOT NULL default 'editor';

update user_space_mapping usm inner JOIN space s ON usm.space_uuid = s.uuid AND usm.user_id = s.created_by
SET usm.permission = 'owner';
