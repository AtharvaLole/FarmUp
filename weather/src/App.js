import React from 'react'
import MainPage from './MainPage'
import {BrowserRouter,Route, Routes } from 'react-router-dom'
import Cropinfo from './Cropinfo'
import "./App.css"
import Fertilizerguide from './Fertilizerguide'
import Landing from './Landing'
function App() {
  return (
    <>
      
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage/>}/>
        <Route path='/cropinfo' element={<Cropinfo/>}/>
        <Route path='/fertilizerinfo' element={<Fertilizerguide/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App