import { useState } from "react";
import { DefaultApiFactory } from "./../openapi/api";

type Number2DArray = number[][];

function App() {
  const [data, setData] = useState<Number2DArray>([]);
  const [result, setResult] = useState<Number2DArray>([]);

  const fetchData = async () => {
    const exampleArray: Number2DArray = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    setData(exampleArray);

    try {
      const response = await DefaultApiFactory().postNumberArray(exampleArray);
      setResult(response.data);
    } catch (error) {
      console.log(`Fetching data failed. ${error}`);
    }
  };

  return (
    <>
      <button onClick={fetchData}>Send 2D Array</button>
      <div>
        <p>Original Array:</p>
        <pre>{data}</pre>
      </div>
      <div>
        <p>Modified Array:</p>
        <pre>{result}</pre>
      </div>
    </>
  );
}

export default App;
