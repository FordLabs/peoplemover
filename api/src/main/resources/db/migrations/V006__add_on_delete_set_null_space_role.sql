alter table space_roles
    drop constraint FK3axrdw8q3tphojc5m71jryb7e;

alter table space_roles
    add constraint FK3axrdw8q3tphojc5m71jryb7e
        foreign key (color_id) references color
            on delete set null;