DROP TABLE users;

create table user_space_mapping
(
    id          int not null auto_increment,
    user_id     varchar(255),
    space_id    int,

    constraint PK_User_Space_Mapping primary key (id),
    constraint FK_User__Space foreign key (space_id) references space (id) on delete cascade,
    constraint UQ_User_Space_Mapping unique (user_id, space_id)
);