import React from 'react'
import Footer from './Footer'
import NavBar from './components/NavBar'

const Community = () => {
  return (
    <>
      <NavBar page='community' />
      <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '100vw', position: 'absolute', overflowX: 'hidden' }} className='pt-20'>
        This is community page.
        <Footer />
      </div>
    </>
  )
}

export default Community
