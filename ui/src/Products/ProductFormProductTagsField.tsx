import Creatable from 'react-select/creatable';
import {Option} from '../CommonTypes/Option';
import {ProductTag} from '../ProductTag/ProductTag';
import {CreateNewText, CustomIndicator, CustomOption} from '../ReusableComponents/ReactSelectStyles';
import {JSX} from '@babel/types';
import React, {useState} from 'react';
import {customStyles} from './ProductForm';
import {Product} from './Product';
import {Tag} from '../Tags/Tag';
import {Space} from '../Space/Space';
import {TagAddRequest} from '../Tags/TagAddRequest';
import ProductTagClient from '../ProductTag/ProductTagClient';
import {AxiosResponse} from 'axios';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';

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
    const [typedInProductTag, setTypedInProductTag] = useState<string>('');
    const [availableProductTags, setAvailableProductTags] = useState<Array<ProductTag>>([]);

    useOnLoad(() => {
        ProductTagClient.get(currentSpace.uuid!!).then(result => setAvailableProductTags(result.data));

        setSelectedProductTags(currentProduct.productTags);
    });

    function createTagOption(label: string, id: number): Option {
        return {
            label: label,
            value: id.toString() + '_' + label,
        };
    }

    function optionToProductTag(options: Array<Option>): Array<ProductTag> {
        if (options) {
            return options.map(option => {
                return {
                    id: Number.parseInt(option.value, 10),
                    name: option.label,
                    spaceId,
                };
            });
        }
        return [];
    }
    
    function handleCreateProductTag(inputValue: string): void {
        setIsLoading(true);
        const productTag: TagAddRequest = { name: inputValue };

        ProductTagClient.add(productTag, currentSpace.uuid!!)
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
        if (productTags.length > 0) {
            setSelectedProductTags([...productTags]);
        } else {
            setSelectedProductTags([]);
        }
    }
    
    return (
        <div className="formItem">
            <label className="formItemLabel" htmlFor="productTags">Product Tags</label>
            <Creatable
                isMulti={true}
                name="productTags"
                inputId="productTags"
                onInputChange={(e: string): void => setTypedInProductTag(e)}
                onChange={(option): void => updateSelectedProductTags(optionToProductTag(option as Option[]))}
                isLoading={isLoading}
                isDisabled={isLoading}
                onCreateOption={handleCreateProductTag}
                options={availableProductTags.map((productTag: ProductTag) => createTagOption(productTag.name, productTag.id))}
                styles={customStyles}
                value={selectedProductTags.map(productTag => createTagOption(productTag.name, productTag.id))}
                components={{DropdownIndicator: CustomIndicator, Option: CustomOption}}
                formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInProductTag}"`)}
                placeholder="Add product tags"
                hideSelectedOptions={true}
                isClearable={false}
            />
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductFormProductTagsField);