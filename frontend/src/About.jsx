import React from 'react'
import NavBar from './components/NavBar'

const About = () => {
  return (
    <>
      <NavBar page='about' />
      <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '99vw', position: 'absolute', overflowX: 'hidden' }} className='mt-12'>
        This is about page.
      </div>
    </>
  )
}

export default About
