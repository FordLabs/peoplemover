alter table assignment
    add space_id int;

alter table assignment
    add constraint assignment_space_id__fk
        foreign key (space_id) references space;

alter table product
    add space_id int;

alter table product
    add constraint product_space_id__fk
        foreign key (space_id) references space;