import { useEffect } from 'react';

import QURAN_DATA from "../data/quranData";

function App() {

  useEffect(() => {
    console.log('QURAN_DATA');
      console.log(QURAN_DATA);
  }, [])


  return (
    <>
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-pink-300">
        <h1>Khatm by Salah Planner</h1>
        <div className="mt-2">
          <p>Total Ayahs: {QURAN_DATA?.ayahs?.count?.toLocaleString()}</p>
          <p>Total Surahs: {QURAN_DATA?.surahs?.count?.toLocaleString()}</p>
        </div>
      </div>
    </>
  )
}

export default App
