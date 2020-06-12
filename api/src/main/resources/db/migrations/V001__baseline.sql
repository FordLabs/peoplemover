create table space
(
    id    int          not null AUTO_INCREMENT primary key,
    token varchar(255) not null unique
);

create table color
(
    id    int not null AUTO_INCREMENT primary key,
    color varchar(255) unique
);

create table board
(
    id       int          not null AUTO_INCREMENT primary key,
    name     varchar(255) not null,
    space_id int,

    FOREIGN KEY (space_id) REFERENCES space (id)
);

create table space_locations
(
    id       int AUTO_INCREMENT primary key,
    space_id int not null,
    name     varchar(255),

    FOREIGN KEY (space_id) REFERENCES space (id),
    constraint UQ_Location unique (space_id, name)
);

create table product
(
    id                int not null AUTO_INCREMENT primary key,
    archived          bit not null,
    board_id          int,
    dorf              varchar(255),
    end_date          date,
    location          varchar(255),
    name              varchar(255),
    notes             varchar(255),
    start_date        date,
    space_location_id int,

    FOREIGN KEY (board_id) REFERENCES board (id),
    FOREIGN KEY (space_location_id) REFERENCES space_locations (id) ON DELETE SET NULL,
    constraint UQ_Product unique (board_id, name)
);

create table space_roles
(
    id       int not null AUTO_INCREMENT primary key,
    roles    varchar(255),
    space_id int,
    color_id int,

    FOREIGN KEY (space_id) REFERENCES space (id),
    FOREIGN KEY (color_id) REFERENCES color (id),
    constraint UQ_Role unique (space_id, roles)
);

create table space_tag
(
    id       int not null AUTO_INCREMENT primary key,
    name     varchar(255),
    space_id int,

    FOREIGN KEY (space_id) REFERENCES space (id),
    constraint UQ_Tag unique (space_id, name)
);

create table person
(
    id            int           not null AUTO_INCREMENT primary key,
    name          varchar(255),
    notes         varchar(255),
    is_new        bit default 0 not null,
    space_id      int,
    space_role_id int,

    FOREIGN KEY (space_id) REFERENCES space (id),
    FOREIGN KEY (space_role_id) REFERENCES space_roles (id)
);

create table assignment
(
    id                  int not null AUTO_INCREMENT primary key,
    joined_product_date bigint,
    placeholder         bit not null,
    product_id          int,
    person_id           int,

    FOREIGN KEY (product_id) REFERENCES product (id),
    FOREIGN KEY (person_id) REFERENCES person (id)
);

create table person_location_preference
(
    id                  int AUTO_INCREMENT primary key,
    person_id           int not null,
    location_preference varchar(255),
    space_location_id   int,

    FOREIGN KEY (person_id) REFERENCES person (id)
);

create table product_tag
(
    id           int not null AUTO_INCREMENT primary key,
    product_id   int,
    space_tag_id int,
    name         varchar(255),
    space_id     int,

    FOREIGN KEY (product_id) REFERENCES product (id),
    FOREIGN KEY (space_tag_id) REFERENCES space_tag (id) on delete cascade,
    FOREIGN KEY (space_id) REFERENCES space (id),
    constraint UQ_Product_Tag unique (space_id, name)
);

create table product_tag_mapping
(
    id             int not null AUTO_INCREMENT primary key,
    product_id     int,
    product_tag_id int,

    FOREIGN KEY (product_id) REFERENCES product (id),
    FOREIGN KEY (product_tag_id) REFERENCES product_tag (id) on delete cascade
);

















