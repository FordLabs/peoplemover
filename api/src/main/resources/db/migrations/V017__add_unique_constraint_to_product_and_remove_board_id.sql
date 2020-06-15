alter table product
add constraint UQ_Product unique (space_id, name);

alter table product
drop column board_id;