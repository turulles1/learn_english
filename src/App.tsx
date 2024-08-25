import React, { useEffect, useState } from "react";
import "./App.css";
import jsonWord from "./json_word.json";
type Item = {
  id: number;
  english_word: string;
  vietnamese_word: string;
  percentage: number;
};
let cumulativeArray: number[] = [];
let totalPercentage: number = 0;

function App() {
  const [items, setItems] = useState(jsonWord);
  const [showTop, setShowTop] = useState(false);
  const [showVN, setShowVN] = useState(false);
  const [currentWord, setCurrentWord] = useState(items[0]);

  // const [add_english_word, set_add_english_word] = useState("");
  // const [add_vietnamese_word, set_vietnamese_word] = useState("");

  const [areaText, setAreaText] = useState("");

  // Tính toán mảng tích lũy
  function calculateCumulativeArray(items: Item[]): void {
    cumulativeArray = [];
    totalPercentage = 0;

    for (const item of items) {
      totalPercentage += item.percentage;
      cumulativeArray.push(totalPercentage);
    }
  }

  // Thực hiện random
  function weightedRandomChoice(items: Item[]): Item {
    let randomNumber = Math.floor(Math.random() * totalPercentage);

    // Tìm kiếm nhị phân để tối ưu việc tìm phần tử
    const index = binarySearch(cumulativeArray, randomNumber);
    return items[index];
  }

  // Hàm tìm kiếm nhị phân
  function binarySearch(array: number[], target: number): number {
    let low = 0;
    let high = array.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (array[mid] < target) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  // const saveStorage = () => {
  //   if (!add_english_word || !add_vietnamese_word) return;
  //   const currentTimestamp: number = Date.now();
  //   const itemadd = {
  //     id: currentTimestamp,
  //     english_word: add_english_word,
  //     vietnamese_word: add_vietnamese_word,
  //     percentage: 20,
  //   };
  //   items.push(itemadd);
  //   localStorage.setItem("list_word", JSON.stringify(items));
  // };

  const updateItem = (value: Item) => {
    const itemIndex = items.findIndex((item) => item.id === value.id);
    const newItems = [...items];
    if (newItems[itemIndex].percentage <= 0) return;
    newItems[itemIndex].percentage = value.percentage - 1;
    localStorage.setItem("list_word", JSON.stringify(newItems));
    setItems(newItems);
  };

  useEffect(() => {
    const stringItems = localStorage.getItem("list_word");
    if (stringItems) {
      setItems(JSON.parse(stringItems));
    }
  }, []);

  useEffect(() => {
    calculateCumulativeArray(items);
  }, [items]);

  return (
    <div className="bg-[#282c34] w-screen min-h-screen items-center flex-1 flex justify-center flex-col">
      {/* <div className="flex flex-row gap-3 absolute top-10">
        <input
          placeholder="english"
          onChange={(v) => set_add_english_word(v.target.value)}
        />
        <input
          placeholder="vietnamese"
          onChange={(v) => set_vietnamese_word(v.target.value)}
        />
        <button
          onClick={() => {
            console.log(add_english_word);
            saveStorage();
          }}
          className="bg-white text-sm text-black"
        >
          Add
        </button>
      </div> */}

      <div className="flex flex-col gap-3 absolute top-0 right-0 left-0">
        {showTop && (
          <div className="flex flex-col gap-1 sm:flex-row">
            <button
              onClick={() => {
                downloadJson(items, "hehe.json");
              }}
              className="bg-white"
            >
              Download
            </button>
            <textarea
              className="w-full max-sm:min-h-60"
              placeholder="english"
              onChange={(v) => setAreaText(v.target.value)}
            />
            <button
              onClick={() => {
                const wordsArray = parseTextToArray(areaText);
                for (let index = 0; index < wordsArray.length; index++) {
                  const element = wordsArray[index];
                  const currentTimestamp: number = Date.now();
                  const itemadd = {
                    id: currentTimestamp - index * 14,
                    english_word: element.english_word,
                    vietnamese_word: element.vietnamese_word,
                    percentage: 15,
                  };
                  items.push(itemadd);
                  localStorage.setItem("list_word", JSON.stringify(items));
                }
              }}
              className="bg-white text-sm text-black"
            >
              SAVE
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setShowTop(!showTop);
          }}
          className="bg-white w-max"
        >
          Show/Hide Top
        </button>
      </div>

      <div className="text-white text-center text-[30px] font-bold">
        <div>
          <div>{currentWord.english_word}</div>
          {showVN ? <div>{currentWord.vietnamese_word}</div> : <>_</>}
          <div></div>
        </div>
      </div>
      <div className="absolute bottom-4 flex flex-col gap-8 max-sm:w-full p-4">
        <button
          className="bg-white p-2"
          onClick={() => setShowVN(!showVN)}
        >
          Show / Hide
        </button>
        <button
          onClick={() => {
            const result = weightedRandomChoice(items);
            setCurrentWord(result);
            setShowVN(false);
            updateItem(result);
          }}
          className="bg-white p-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;

function downloadJson(jsonData: any, filename: string): void {
  // Chuyển đổi dữ liệu JSON thành chuỗi
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Tạo một Blob từ chuỗi JSON
  const blob = new Blob([jsonString], { type: "application/json" });

  // Tạo một đối tượng URL từ Blob
  const url = URL.createObjectURL(blob);

  // Tạo một liên kết để tải xuống tệp
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  // Kích hoạt liên kết để tải xuống tệp
  a.click();

  // Giải phóng bộ nhớ bằng cách thu hồi URL
  URL.revokeObjectURL(url);
}

function parseTextToArray(text: string) {
  // Tách các dòng
  const lines = text.trim().split("\n");

  // Chuyển đổi từng dòng thành đối tượng
  const result = lines.map((line) => {
    const [english_word, vietnamese_word] = line
      .split(":")
      .map((s) => s.trim());
    return {
      english_word,
      vietnamese_word,
    };
  });

  return result;
}
