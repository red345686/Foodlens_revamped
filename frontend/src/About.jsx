import React from 'react'
import NavBar from './components/NavBar'

const About = () => {
  return (
    <>
      <NavBar page='about' />
      <div style={{ backgroundColor: '#d9f8da', zIndex: '-100', width: '100vw', position: 'absolute', overflowX: 'hidden' }} className='pt-20'>
        This is about page.
      </div>
    </>
  )
}

export default About
