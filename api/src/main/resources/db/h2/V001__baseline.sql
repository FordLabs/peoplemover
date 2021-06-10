create table space
(
    uuid varchar(36) not null primary key,
    name varchar(255) not null unique,
    last_modified_date datetime,
    created_by varchar(40),
    today_view_is_public bit default false,
    created_date datetime,
);

create table color
(
    id    int not null identity primary key,
    color varchar(255) unique
);

create table space_locations
(
    id       int identity primary key,
    space_uuid        varchar (36) not null,
    name     varchar(255),

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    constraint UQ_Location unique (space_uuid, name)
);

create table product
(
    id                int not null identity primary key,
    archived          bit not null,
    dorf              varchar(255),
    end_date          date,
    name              varchar(255),
    notes             varchar(500),
    start_date        date,
    space_location_id int,
    space_uuid        varchar (36) not null,

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    FOREIGN KEY (space_location_id) REFERENCES space_locations (id) ON DELETE SET NULL,
    constraint UQ_Product unique (space_uuid, name)
);

create table space_roles
(
    id       int not null identity primary key,
    roles    varchar(255),
    space_uuid    varchar (36) not null,
    color_id int,

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    FOREIGN KEY (color_id) REFERENCES color (id) on delete set null,
    constraint UQ_Role unique (space_uuid, roles)
);

create table person
(
    id            int           not null identity primary key,
    name          varchar(255),
    notes         varchar(255),
    new_person    bit default 0 not null,
    space_role_id int,
    space_uuid    varchar (36) not null,
    custom_field1  varchar(255),

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    FOREIGN KEY (space_role_id) REFERENCES space_roles (id) ON DELETE SET NULL
);

create table assignment
(
    id                  int not null identity primary key,
    effective_date      date,
    placeholder         bit not null,
    product_id          int,
    person_id           int,
    space_uuid          varchar (36) not null,

    FOREIGN KEY (product_id) REFERENCES product (id) on delete cascade,
    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    FOREIGN KEY (person_id) REFERENCES person (id) on delete cascade,
    constraint UQ_Assignment unique (product_id, person_id, effective_date)
);

create table product_tag
(
    id           int not null identity primary key,
    name         varchar(255),
    space_uuid        varchar (36) not null,

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    constraint UQ_Product_Tag unique (space_uuid, name)
);

create table product_tag_mapping
(
    id             int not null identity primary key,
    product_id     int,
    product_tag_id int,

    FOREIGN KEY (product_id) REFERENCES product (id) on delete cascade,
    FOREIGN KEY (product_tag_id) REFERENCES product_tag (id) on delete cascade,
    constraint UQ_Product_Tag_Mapping unique (product_id, product_tag_id)
);

create table person_tag
(
    id           int not null identity primary key,
    name         varchar(255),
    space_uuid        varchar (36) not null,

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    constraint UQ_Person_Tag unique (space_uuid, name)
);

create table person_tag_mapping
(
    id             int not null identity primary key,
    person_id     int,
    person_tag_id int,

    FOREIGN KEY (person_id) REFERENCES person (id) on delete cascade,
    FOREIGN KEY (person_tag_id) REFERENCES person_tag (id) on delete cascade,
    constraint UQ_Person_Tag_Mapping unique (person_id, person_tag_id)
);

create table user_space_mapping
(
    id          int not null identity primary key,
    user_id     varchar(255),
    space_uuid        varchar (36) not null,
    last_modified_date datetime,
    last_modified_by varchar(30),
    created_date datetime,
    created_by varchar(30),
    permission varchar(36) NOT NULL default 'editor',

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    constraint UQ_User_Space_Mapping unique (user_id, space_uuid)
);

create table custom_field_mapping
(
    id int not null identity primary key,
    reference_name varchar(255),
    vanity_name varchar(255),
    space_uuid varchar (36) not null,

    FOREIGN KEY (space_uuid) REFERENCES space (uuid) on delete cascade,
    constraint UQ_Custom_Field_Mapping unique (space_uuid, reference_name)
);

