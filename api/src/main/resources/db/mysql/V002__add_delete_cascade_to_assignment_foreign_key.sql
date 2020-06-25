ALTER TABLE assignment DROP FOREIGN KEY FK_Assignment__Product;
ALTER TABLE assignment ADD CONSTRAINT FK_Assignment__Product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE;