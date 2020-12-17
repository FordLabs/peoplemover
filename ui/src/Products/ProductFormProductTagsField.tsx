import Creatable from 'react-select/creatable';
import {Option} from '../CommonTypes/Option';
import {ProductTag} from '../ProductTag/ProductTag';
import {CreateNewText, CustomIndicator, CustomOption} from '../ReusableComponents/ReactSelectStyles';
import {JSX} from '@babel/types';
import React, {useState} from 'react';
import {customStyles} from './ProductForm';
import {Product} from './Product';
import {Tag} from '../Tags/Tag.interface';
import {Space} from '../Space/Space';
import ProductTagClient from '../ProductTag/ProductTagClient';
import {AxiosResponse} from 'axios';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';
import {TagRequest} from '../Tags/TagRequest.interface';

interface Props {
    spaceId: number;
    loadingState: { isLoading: boolean; setIsLoading: (isLoading: boolean) => void };
    currentProductState: { currentProduct: Product };
    selectedProductTagsState: {
        selectedProductTags: Array<ProductTag>;
        setSelectedProductTags: (productTags: Array<ProductTag>) => void;
    };
    addGroupedTagFilterOptions: (tagFilterIndex: number, trait: Tag) => void;
    currentSpace: Space;
}

function ProductFormProductTagsField({
    spaceId,
    loadingState: {
        isLoading,
        setIsLoading,
    },
    currentProductState: {
        currentProduct,
    },
    selectedProductTagsState: {
        selectedProductTags,
        setSelectedProductTags,
    },
    currentSpace,
    addGroupedTagFilterOptions,
}: Props): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const uuid = currentSpace.uuid!;
    const [typedInProductTag, setTypedInProductTag] = useState<string>('');
    const [availableProductTags, setAvailableProductTags] = useState<Array<ProductTag>>([]);

    useOnLoad(() => {
        ProductTagClient.get(uuid).then(result => setAvailableProductTags(result.data));

        setSelectedProductTags(currentProduct.productTags);
    });

    function createTagOption(label: string, id: number): Option {
        return {
            label: label,
            value: id.toString() + '_' + label,
        };
    }

    function optionToProductTag(options: Array<Option>): Array<ProductTag> {
        if (!options) return [];

        return options.map(option => {
            return {
                id: Number.parseInt(option.value, 10),
                name: option.label,
                spaceId,
            };
        });
    }

    function handleCreateProductTag(inputValue: string): void {
        setIsLoading(true);
        const productTag: TagRequest = { name: inputValue };

        ProductTagClient.add(productTag, currentSpace)
            .then((response: AxiosResponse) => {
                const newProductTag: ProductTag = response.data;
                setAvailableProductTags(productTags => [...productTags, {
                    id: newProductTag.id,
                    name: newProductTag.name,
                }] as Array<ProductTag>);
                addGroupedTagFilterOptions(1, newProductTag as Tag);
                updateSelectedProductTags([...selectedProductTags, newProductTag]);
                setIsLoading(false);
            });
    }

    function updateSelectedProductTags(productTags: Array<ProductTag>): void {
        const selectedTags = (productTags.length > 0) ? [...productTags] : [];
        setSelectedProductTags(selectedTags);
    }

    const getOptions = (): Array<Option> => {
        return availableProductTags.map((productTag: ProductTag) => createTagOption(productTag.name, productTag.id));
    };

    const menuIsOpen = (): boolean => {
        return availableProductTags.length > selectedProductTags.length || Boolean(typedInProductTag.length);
    };

    const onChange = (option: unknown): void => updateSelectedProductTags(optionToProductTag(option as Option[]));

    const onInputChange = (e: string): void => setTypedInProductTag(e);

    return (
        <div className="formItem">
            <label className="formItemLabel" htmlFor="productTags">Product Tags</label>
            <Creatable
                name="productTags"
                inputId="productTags"
                placeholder="Add product tags"
                value={selectedProductTags.map(
                    productTag => createTagOption(productTag.name, productTag.id)
                )}
                options={getOptions()}
                styles={customStyles}
                components={{
                    DropdownIndicator: CustomIndicator,
                    Option: CustomOption,
                }}
                formatCreateLabel={(): JSX.Element =>
                    CreateNewText(typedInProductTag)
                }
                onInputChange={onInputChange}
                onChange={onChange}
                onCreateOption={handleCreateProductTag}
                menuIsOpen={menuIsOpen()}
                isDisabled={isLoading}
                isLoading={isLoading}
                isMulti={true}
                hideSelectedOptions={true}
                isClearable={false}
            />
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductFormProductTagsField);
/* eslint-enable */
