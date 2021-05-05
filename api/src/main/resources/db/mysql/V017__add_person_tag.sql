create table person_tag
(
    id int not null auto_increment,
    name varchar(255),
    space_uuid varchar(36),

    constraint PK_Person_Tag primary key (id),
    constraint FK_Person_Tag__Space foreign key (space_uuid) references space (uuid) on delete cascade,
    constraint UQ_Person_Tag unique (space_uuid, name)
);

create table person_tag_mapping
(
    id int not null auto_increment,
    person_id int,
    person_tag_id int,

    constraint PK_Person_Tag_Mapping primary key (id),
    constraint FK_Person_Tag_Mapping__Person foreign key (person_id) references person (id) on delete cascade,
    constraint FK_Person_Tag_Mapping__Person_Tag foreign key (person_tag_id) references person_tag (id) on delete cascade,
    constraint UQ_Person_Tag_Mapping unique (person_id, person_tag_id)
);