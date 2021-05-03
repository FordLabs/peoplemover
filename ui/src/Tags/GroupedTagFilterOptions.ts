import {TagInterface} from './Tag.interface';
import {FilterOption} from '../CommonTypes/Option';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterConstants';

export function addGroupedTagFilterOptions(
    tagFilterIndex: number,
    trait: TagInterface,
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>,
    setAllGroupedTagFilterOptions: (groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) => void
): void {
    const addedFilterOption: FilterOption = {
        label: trait.name,
        value: trait.id.toString() + '_' + trait.name,
        selected: false,
    };
    const updatedTagFilterOptions: AllGroupedTagFilterOptions = {
        ...allGroupedTagFilterOptions[tagFilterIndex],
        options: [
            ...allGroupedTagFilterOptions[tagFilterIndex].options,
            addedFilterOption,
        ],
    };

    let groupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [...allGroupedTagFilterOptions];
    groupedTagFilterOptions[tagFilterIndex] = updatedTagFilterOptions;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions);
}
