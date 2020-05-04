update person_location_preference
set space_location_id = temp2.space_location_id
from person_location_preference
         join (
    select space_locations.id   as space_location_id,
           space_locations.name as space_location_name,
           person.id            as person_id,
           person.space_id
    from person
             join space_locations
                  on person.space_id = space_locations.space_id
) as temp2
              on temp2.space_location_name = person_location_preference.location_preference
where temp2.person_id = person_location_preference.person_id;