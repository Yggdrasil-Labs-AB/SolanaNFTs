import { useState } from 'react';

import {
    infoData,
    getAttributesData,
    storeInfoData,
    propertiesData,
} from '../config/nftConfig';

import { useGlobalVariables } from '../providers/GlobalVariablesProvider';

export const useNftConceptForm = () => {

    const { nftConcepts } = useGlobalVariables();

    //States that make up Meta data information
    const [info, setInfo] = useState(infoData);

    const [attributes, setAttributes] = useState(getAttributesData());

    const [properties, setProperties] = useState(propertiesData);

    //State that makes up Store Information
    const [storeInfo, setStoreInfo] = useState(storeInfoData);

    //Store Image for display
    const [image, setImage] = useState(null);

    //Stores newly created metadata for?
    const [newMetadata, setNewMetadata] = useState(null);

    const [isNameTaken, setIsNameTaken] = useState(null);

    // in your component
    const [modelFile, setModelFile] = useState(null);
    const [modelName, setModelName] = useState("");
    const [modelPreviewUrl, setModelPreviewUrl] = useState(""); // optional

    const [imageName, setImageName] = useState(null);

    //Function that resets local metadata when needed
    const resetNftConceptForm = () => {
        setInfo(infoData);
        setAttributes(getAttributesData());
        setProperties(propertiesData);
        setStoreInfo(storeInfoData);
        setImageName('');
        setImage(null);
        setNewMetadata(null);
    }

    //Handles form input change for Info state
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setInfo({ ...info, [name]: value });

        handleCheckName(value);
    };

    //Handles form input change for Store Info
    const handleStoreChange = (key, value) => {
        setStoreInfo((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    //Handle Image uploads
    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the selected file

        if (file) {
            const img = new Image();
            const fileURL = URL.createObjectURL(file); // Create a temporary URL for the image

            img.onload = () => {
                const { width, height } = img;

                // Validate image dimensions
                if (width > 512 || height > 512 || width !== height) {
                    alert("Image dimensions must be 512x512 or smaller, and same width/height.");
                    e.target.value = ""; // Reset the file input
                } else {
                    setImage(file); // Set the image as usual if valid
                    setImageName(file.name);
                }

                console.log(file.name);

                URL.revokeObjectURL(fileURL); // Clean up the temporary URL
            };

            img.onerror = () => {
                alert("Invalid image file.");
                URL.revokeObjectURL(fileURL); // Clean up the temporary URL
            };

            img.src = fileURL; // Trigger the `onload` handler by setting the image source
        }
    };

    const handleModelUpload = (e) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        // basic guard: must be .glb
        const isGlb = file.name.toLowerCase().endsWith(".glb") || file.type === "model/gltf-binary";
        if (!isGlb) {
            // reset if wrong type (optional)
            e.target.value = "";
            return;
        }

        console.log(file.name);
        setModelFile(file);
        setModelName(file.name);

        // optional: make a temporary URL to preview or show size
        const url = URL.createObjectURL(file);
        setModelPreviewUrl(url);
    };

    // Handle input change
    const handleAttributeChange = (index, field, newValue) => {
        const updatedAttributes = attributes.map((attr, i) =>
            i === index ? { ...attr, [field]: newValue } : attr
        );
        setAttributes(updatedAttributes);
    };

    const handleCheckName = (value) => {
        const foundNft = nftConcepts.find(nft => nft.name === value);

        setIsNameTaken(!!foundNft); // Convert to boolean
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

    return {
        info,
        setInfo,
        attributes,
        setAttributes,
        properties,
        setProperties,
        storeInfo,
        setStoreInfo,
        image,
        setImage,
        imageName,
        newMetadata,
        setNewMetadata,
        resetNftConceptForm,
        handleInfoChange,
        handleStoreChange,
        handleImageChange,
        handleAttributeChange,
        isNameTaken,
        resetDivisionOnTypeChange,
        handleModelUpload,
        modelName,
        modelPreviewUrl,
        modelFile
    }
}