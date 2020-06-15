alter table product
add constraint UQ_Product_For_Space unique (space_id, name);

alter table product
drop column board_id;