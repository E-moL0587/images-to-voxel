import React, { FunctionComponent, useState } from "react";

export const ImageUploader: FunctionComponent = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append("image", selectedFile);

            fetch('http://localhost:5002/api/imageprocessor', {
                method: 'POST',
                body: formData
            })
            .then((response) => response.blob())
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            })
            .catch((err) => {
                console.log(err.message);
            });
        }
    };

    return (
        <div>
            <h2>Image Uploader</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {imageUrl && (
                <div>
                    <h3>Processed Image</h3>
                    <img src={imageUrl} alt="Processed" />
                </div>
            )}
        </div>
    );
};
