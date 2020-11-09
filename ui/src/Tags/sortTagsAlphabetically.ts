import {Tag} from './Tag.interface';

const sortTagsAlphabetically = (tagsList: Array<Tag>): void => {
    tagsList.sort((tag1: Tag, tag2: Tag) => {
        return tag1.name.toLowerCase().localeCompare(tag2.name.toLowerCase());
    });
};

export default sortTagsAlphabetically;
