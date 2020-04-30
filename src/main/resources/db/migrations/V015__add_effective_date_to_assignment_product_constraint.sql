alter table assignment
    add constraint UQ_Assignment
        unique (product_id, person_id, effective_date);