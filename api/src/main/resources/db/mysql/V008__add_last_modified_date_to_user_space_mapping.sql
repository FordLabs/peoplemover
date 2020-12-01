ALTER TABLE user_space_mapping
  ADD last_modified_date datetime,
  ADD last_modified_by varchar(30),
  ADD created_date datetime,
  ADD created_by varchar(30);