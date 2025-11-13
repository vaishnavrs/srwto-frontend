import React, { useState } from 'react'
import './home.css'
import Srwto from '../components/Srwto';
function Home() {
    const [menu,setMenu] = useState('')
    const [selectedMenu, setSelectedMenu] = useState(null);
    const availableMenus = ['srwto', 'menu1', 'menu2', 'menu3'];

     const selectMenu = (menuValue) => {
      const normalized = menuValue.trim().toLowerCase();
      if (!normalized) {
        return;
      }
      if (availableMenus.includes(normalized)) {
        setSelectedMenu(normalized);
      } else {
        setSelectedMenu(null);
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    selectMenu(menu);
  }
  return (
    <>
        <div className='search-form'>
            <form action="" method="post" onSubmit={handleSubmit}>
              <input type="text" className='form-control menu' value={menu} name='menu' onChange={(e)=>setMenu(e.target.value)} placeholder='menus' />
              <button className='btn btn-dark'>Submit</button>
            </form>
        </div>
        <div>
            {selectedMenu === 'srwto' && <Srwto />}
        </div>
    
    </>
  )
}

export default Home