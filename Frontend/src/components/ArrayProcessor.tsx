import React, { FunctionComponent, useEffect, useState } from "react";

type NumberArrayDto = number[][];

export const ArrayProcessor: FunctionComponent = () => {
    const [inputArray] = useState<NumberArrayDto>([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]);
    const [processedArray, setProcessedArray] = useState<NumberArrayDto | null>(null);

    useEffect(() => {
        fetch('http://localhost:5002/api/arrayprocessor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputArray)
        })
        .then((response) => response.json())
        .then((data) => {
            setProcessedArray(data);
        })
        .catch((err) => {
            console.log(err.message);
        });
    }, [inputArray]);

    return (
        <div>
            <h2>Processed Array</h2>
            {processedArray ? (
                <div>
                    {processedArray.map((row, rowIndex) => (
                        <div key={rowIndex}>
                            {row.map((value, colIndex) => (
                                <span key={colIndex}>{value} </span>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};
