ALTER TABLE person ADD COLUMN customField1 varchar(255);

create table custom_field_mapping
(
    id int not null auto_increment,
    reference_name varchar(255),
    vanity_name varchar(255),
    space_uuid varchar (36) not null,

    constraint PK_Custom_Field_Mapping primary key (id),
    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    constraint UQ_Custom_Field_Mapping unique (space_uuid, reference_name)
);