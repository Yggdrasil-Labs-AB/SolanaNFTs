import { useState, useEffect } from 'react';

import { infoData, storeInfoData, getAttributesData } from '../config/gameConfig';

export const useInGameItemForm = () => {

    //States that make up Meta data information
    const [info, setInfo] = useState(infoData);

    const [attributes, setAttributes] = useState(getAttributesData());

    //State that makes up Store Information
    const [storeInfo, setStoreInfo] = useState(storeInfoData);

    //Store Image for display
    const [image, setImage] = useState(null);

    //Handles form input change for Info state
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setInfo({ ...info, [name]: value });
    };

    //Handles form input change for Store Info
    const handleStoreChange = (key, value) => {
        setStoreInfo((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    // Handle Image uploads
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileURL = URL.createObjectURL(file); // temp preview url

        const img = new Image();
        img.onload = () => {
            const { width, height } = img;

            // Validate 512x512 and square
            if (width > 512 || height > 512 || width !== height) {
                alert("Image dimensions must be max 512x512 and perfectly square.");
                e.target.value = ""; // reset input
                URL.revokeObjectURL(fileURL); // safe to revoke here
                return;
            }

            // Valid image
            setImage(file);
            setImagePreview(fileURL);   // DO NOT revoke yet!
        };

        img.onerror = () => {
            alert("Invalid image file.");
            URL.revokeObjectURL(fileURL);
        };

        img.src = fileURL;
    };

    // Handle input change
    const handleAttributeChange = (index, field, newValue) => {
        console.log(index, field, newValue);
        const updatedAttributes = attributes.map((attr, i) =>
            i === index ? { ...attr, [field]: newValue } : attr
        );
        console.log(updatedAttributes);
        setAttributes(updatedAttributes);
    };

    const resetDivisionOnTypeChange = () => {
        setAttributes(prevAttributes =>
            prevAttributes.map(attr =>
                attr.trait_type === 'division'
                    ? { ...attr, value: 'none' }
                    : attr
            )
        );
    };

    //Function that resets local metadata when needed
    const resetGameItemForm = () => {
        setInfo(infoData);
        setAttributes(getAttributesData());
        setStoreInfo(storeInfoData);
        setImage(null);
        setImagePreview(null);
    }

    return {
        info,
        setInfo,
        attributes,
        setAttributes,
        storeInfo,
        setStoreInfo,
        image,
        handleInfoChange,
        handleAttributeChange,
        handleStoreChange,
        handleImageChange,
        resetDivisionOnTypeChange,
        resetGameItemForm,
        imagePreview
    }
}