update product set location = null where location='other' or location='';

update product set product.space_location_id = temp2.location_id
from product
         join (
    select space_locations.id as location_id, space_locations.name, temp.* from space_locations join (
        select space_id, product.id as product_id, location, space_location_id from product join board b on product.board_id = b.id
    ) as temp on temp.space_id = space_locations.space_id
) as temp2 on product.id = temp2.product_id where product.location = temp2.name;

ALTER TABLE product DROP COLUMN location;