create table space
(
    id    int          not null,
    name varchar(255) not null,
    last_modified_date datetime,
    constraint PK_Space PRIMARY KEY (id),
    constraint UC_Space_Name UNIQUE (name)
);

create table color
(
    id    int not null,
    color varchar(255) unique,
    constraint PK_Color primary key (id)
);

create table space_locations
(
    id       int auto_increment,
    space_id int not null,
    name     varchar(255),

    constraint PK_Space_Location primary key (id),
    constraint FK_Space_Location__Space foreign key (space_id) references space (id) on delete cascade,
    constraint UQ_Location unique (space_id, name)
);

create table product
(
    id                int not null,
    archived          bit not null,
    dorf              varchar(255),
    end_date          date,
    name              varchar(255),
    notes             varchar(500),
    start_date        date,
    space_location_id int,
    space_id          int,

    constraint PK_Product primary key (id),
    constraint FK_Product__Space foreign key (space_id) references space (id) on delete cascade,
    constraint FK_Product__Space_Location foreign key (space_location_id) references space_locations (id) on delete set null
);

create table space_roles
(
    id       int not null,
    roles    varchar(255),
    space_id int,
    color_id int,

    constraint PK_Space_Roles primary key (id),
    constraint FK_Space_Roles__Space foreign key (space_id) references space (id) on delete cascade,
    constraint FK_Space_Roles__Color foreign key (color_id) references color (id) on delete set null,
    constraint UQ_Role unique (space_id, roles)
);

create table person
(
    id            int not null,
    name          varchar(255),
    notes         varchar(255),
    new_person    bit default 0 not null,
    space_id      int,
    space_role_id int,

    constraint PK_Person primary key (id),
    constraint FK_Person__Space foreign key (space_id) references space (id) on delete cascade,
    constraint FK_Person__Space_Role foreign key (space_role_id) references space_roles (id) on delete set null
);

create table assignment
(
    id                  int not null,
    effective_date      date,
    placeholder         bit not null,
    product_id          int,
    person_id           int,
    space_id            int,

    constraint PK_Assignment primary key (id),
    constraint FK_Assignment__Product foreign key (product_id) references product (id),
    constraint FK_Assignment__Space foreign key (space_id) references space (id) on delete cascade,
    constraint FK_Assignment__Person foreign key (person_id) references person (id) on delete cascade,
    constraint UQ_Assignment unique (product_id, person_id, effective_date)
);

create table product_tag
(
    id           int not null,
    name         varchar(255),
    space_id     int,

    constraint PK_Product_Tag primary key (id),
    constraint FK_Product_Tag__Space foreign key (space_id) references space (id) on delete cascade,
    constraint UQ_Product_Tag unique (space_id, name)
);

create table product_tag_mapping
(
    id             int not null auto_increment,
    product_id     int,
    product_tag_id int,

    constraint PK_Product_Tag_Mapping primary key (id),
    constraint FK_Product_Tag_Mapping__Product foreign key (product_id) references product (id) on delete cascade,
    constraint FK_Product_Tag_Mapping__Product_Tag foreign key (product_tag_id) references product_tag (id) on delete cascade,
    constraint UQ_Product_Tag_Mapping unique (product_id, product_tag_id)
);
