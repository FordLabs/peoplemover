import {TagInterface} from './Tag.interface';

const sortTagsAlphabetically = (tagsList: Array<TagInterface>): void => {
    tagsList.sort((tag1: TagInterface, tag2: TagInterface) => {
        return tag1.name.toLowerCase().localeCompare(tag2.name.toLowerCase());
    });
};

export default sortTagsAlphabetically;
