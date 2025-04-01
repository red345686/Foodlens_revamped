import React from 'react'
import Footer from './Footer'
import NavBar from './components/NavBar'

const Community = () => {
  return (
    <>
      <NavBar page='community' />
      <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '99vw', position: 'absolute', overflowX: 'hidden' }} className='mt-12'>
        This is community page.
        <Footer />
      </div>
    </>
  )
}

export default Community
