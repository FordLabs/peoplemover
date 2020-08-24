ALTER TABLE assignment
DROP FOREIGN KEy FK_Assignment__Product;

ALTER TABLE assignment
ADD CONSTRAINT FK_Assignment__Product
foreign key (product_id)
references product (id)
on delete cascade;