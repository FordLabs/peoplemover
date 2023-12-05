create table color
(
    id    serial not null primary key,
    color varchar(255) null,
    constraint color
        unique (color)
);

create table space
(
    name                 varchar(255)     not null,
    last_modified_date   timestamptz      null,
    uuid                 varchar(36)      not null
        primary key,
    CREATED_BY           varchar(40)      null,
    today_view_is_public bit default b'0' null,
    created_date         timestamptz      null,
    constraint space_uuid_index
        unique (uuid)
);

create table custom_field_mapping
(
    id             serial not null primary key,
    reference_name varchar(255) null,
    vanity_name    varchar(255) null,
    space_uuid     varchar(36)  not null,
    constraint UQ_Custom_Field_Mapping
        unique (space_uuid, reference_name),
    constraint custom_field_mapping_ibfk_1
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create table person_tag
(
    id         serial not null primary key,
    name       varchar(255) null,
    space_uuid varchar(36)  null,
    constraint UKofmu56dpysihwqdgcommrme9v
        unique (name, space_uuid),
    constraint UQ_Person_Tag
        unique (space_uuid, name),
    constraint FK_Person_Tag__Space
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create table product_tag
(
    id         serial not null primary key,
    name       varchar(255) null,
    space_uuid varchar(36)  not null,
    constraint UK5siq9wofrjm48ldr59ntcjnua
        unique (name, space_uuid),
    constraint UQ_Product_Tag
        unique (space_uuid, name),
    constraint FK_Product_Tag__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create table space_locations
(
    id         serial not null primary key,
    name       varchar(255) null,
    space_uuid varchar(36)  not null,
    constraint UK8ujl4xj6w9hnuoyavn94hft6f
        unique (name, space_uuid),
    constraint UQ_Location
        unique (space_uuid, name),
    constraint FK_Locations__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create table product
(
    id                serial not null primary key,
    archived          bit          not null,
    dorf              varchar(255) null,
    end_date          date         null,
    name              varchar(255) null,
    notes             varchar(500) null,
    start_date        date         null,
    space_location_id int          null,
    space_uuid        varchar(36)  not null,
    url               text         null,
    constraint FK_Product__Space_Location
        foreign key (space_location_id) references space_locations (id)
            on delete set null,
    constraint FK_Product__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create table product_tag_mapping
(
    id             serial not null primary key,
    product_id     int null,
    product_tag_id int null,
    constraint UQ_Product_Tag_Mapping
        unique (product_id, product_tag_id),
    constraint FK_Product_Tag_Mapping__Product
        foreign key (product_id) references product (id)
            on delete cascade,
    constraint FK_Product_Tag_Mapping__Product_Tag
        foreign key (product_tag_id) references product_tag (id)
            on delete cascade
);

create table space_roles
(
    id         serial not null primary key,
    roles      varchar(255) null,
    color_id   int          null,
    space_uuid varchar(36)  not null,
    constraint UQ_Role
        unique (space_uuid, roles),
    constraint FK_Roles__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade,
    constraint FK_Space_Roles__Color
        foreign key (color_id) references color (id)
            on delete set null
);

create table person
(
    id              serial not null primary key,
    name            varchar(255)     null,
    notes           varchar(255)     null,
    new_person      bit default b'0' not null,
    space_role_id   int              null,
    space_uuid      varchar(36)      not null,
    custom_field1   varchar(255)     null,
    new_person_date date             null,
    archive_date    timestamptz      null,
    constraint FK_Person__Space_Role
        foreign key (space_role_id) references space_roles (id)
            on delete set null,
    constraint FK_Person__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create table assignment
(
    id             serial not null primary key,
    effective_date date        null,
    placeholder    bit         not null,
    product_id     int         null,
    person_id      int         null,
    space_uuid     varchar(36) not null,
    constraint UQ_Assignment
        unique (product_id, person_id, effective_date),
    constraint FK_Assignment__Person
        foreign key (person_id) references person (id)
            on delete cascade,
    constraint FK_Assignment__Product
        foreign key (product_id) references product (id)
            on delete cascade,
    constraint FK_Assignment__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);

create index person_spaceuuid
    on person (space_uuid);

create table person_tag_mapping
(
    id            serial not null primary key,
    person_id     int null,
    person_tag_id int null,
    constraint UQ_Person_Tag_Mapping
        unique (person_id, person_tag_id),
    constraint FK_Person_Tag_Mapping__Person
        foreign key (person_id) references person (id)
            on delete cascade,
    constraint FK_Person_Tag_Mapping__Person_Tag
        foreign key (person_tag_id) references person_tag (id)
            on delete cascade
);

create table user_space_mapping
(
    id                 serial not null primary key,
    user_id            varchar(255)                 null,
    last_modified_date timestamptz                  null,
    last_modified_by   varchar(30)                  null,
    created_date       timestamptz                  null,
    created_by         varchar(30)                  null,
    space_uuid         varchar(36)                  not null,
    permission         varchar(36) default 'editor' not null,
    constraint UQ_User_Space_Mapping
        unique (space_uuid, user_id),
    constraint FK_User_Mapping__Space__uuid
        foreign key (space_uuid) references space (uuid)
            on delete cascade
);
