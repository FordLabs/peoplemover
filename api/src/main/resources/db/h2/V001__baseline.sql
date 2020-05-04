create table space
(
    id    int          not null primary key,
    name varchar(255) not null unique,
    last_modified_date datetime
);

create table color
(
    id    int not null primary key,
    color varchar(255) unique
);

create table board
(
    id       int          not null primary key,
    name     varchar(255) not null,
    space_id int,

    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    constraint UQ_Board unique(space_id, name)
);

create table space_locations
(
    id       int identity primary key,
    space_id int not null,
    name     varchar(255),

    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    constraint UQ_Location unique (space_id, name)
);

create table product
(
    id                int not null primary key,
    archived          bit not null,
    board_id          int,
    dorf              varchar(255),
    end_date          date,
    name              varchar(255),
    notes             varchar(500),
    start_date        date,
    space_location_id int,
    space_id          int,

    FOREIGN KEY (board_id) REFERENCES board (id) on delete cascade,
    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    FOREIGN KEY (space_location_id) REFERENCES space_locations (id) ON DELETE SET NULL,
    constraint UQ_Product unique (board_id, name)
);

create table space_roles
(
    id       int not null primary key,
    roles    varchar(255),
    space_id int,
    color_id int,

    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    FOREIGN KEY (color_id) REFERENCES color (id) on delete set null,
    constraint UQ_Role unique (space_id, roles)
);

create table person
(
    id            int           not null primary key,
    name          varchar(255),
    notes         varchar(255),
    new_person    bit default 0 not null,
    space_id      int,
    space_role_id int,

    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    FOREIGN KEY (space_role_id) REFERENCES space_roles (id) ON DELETE SET NULL
);

create table assignment
(
    id                  int not null primary key,
    effective_date      date,
    placeholder         bit not null,
    product_id          int,
    person_id           int,
    space_id            int,

    FOREIGN KEY (product_id) REFERENCES product (id),
    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    FOREIGN KEY (person_id) REFERENCES person (id) on delete cascade,
    constraint UQ_Assignment unique (product_id, person_id, effective_date)
);

create table product_tag
(
    id           int not null primary key,
    name         varchar(255),
    space_id     int,

    FOREIGN KEY (space_id) REFERENCES space (id) on delete cascade,
    constraint UQ_Product_Tag unique (space_id, name)
);

create table product_tag_mapping
(
    product_id     int,
    product_tag_id int,

    FOREIGN KEY (product_id) REFERENCES product (id) on delete cascade,
    FOREIGN KEY (product_tag_id) REFERENCES product_tag (id) on delete cascade,
    constraint UQ_Product_Tag_Mapping unique (product_id, product_tag_id)
);

create table users
(
    id int primary key,
    uuid varchar(255),
)















