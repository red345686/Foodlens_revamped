import React from 'react';
import NavBar from './components/NavBar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { FaGithub, FaInstagram, FaEnvelope, FaLinkedin } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Aman Kumar Gupta',
    email: 'aman_2301cs04@iitp.ac.in',
    github: 'https://github.com/Aman-Kumar-Gupta',
    instagram: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    linkedin: 'https://www.linkedin.com/in/aman-kumar-gupta-032580297/',
    image: 'defBG.png',
  },
  {
    name: 'Anurag Nath',
    email: 'anurag_2301cs07@iitp.ac.in',
    github: 'https://github.com/Slamix6733',
    instagram: 'https://www.instagram.com/anuragnath70/',
    linkedin: 'https://www.linkedin.com/in/anurag-nath-12a1b02bb/',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQFQ0WCPXGVPCg/profile-displayphoto-shrink_400_400/B4DZVYJCk6HwAo-/0/1740940521071?e=1749686400&v=beta&t=qtotX5xeKT70GUnVbG1cPmQK61d38e3eRcDlqdkMbEE',
  },
  {
    name: 'Harshit',
    email: 'harshit_2301cs18@iitp.ac.in',
    github: 'https://github.com/red345686',
    instagram: 'https://www.instagram.com/harshit345686/',
    linkedin: 'https://www.linkedin.com/in/harshit-24575531b/',
    image: 'defBG.png',
  },
  {
    name: 'Rakshit Singhal',
    email: 'rakshit_2301cs38@iitp.ac.in',
    github: 'https://github.com/1Rakshit1',
    instagram: 'https://www.instagram.com/rakshit._.singhal/',
    linkedin: 'https://www.linkedin.com/in/rakshit-singhal-131859331/',
    image: 'defBG.png',
  },
  {
    name: 'Shivam Singh',
    email: 'shivam_2301cs51@iitp.ac.in',
    github: 'https://github.com/codershivam45',
    instagram: 'https://www.instagram.com/name_i_s_shivam/',
    linkedin: 'https://www.linkedin.com/in/shivam-singh-a91552294/',
    image: 'https://media.licdn.com/dms/image/v2/D4E03AQFws5NyfFEYtA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1696511956665?e=1749686400&v=beta&t=7JFJM6QxZ0yybr0FBuRgqP6XqBVQzP51JVKfDjOtfBQ',
  },
  {
    name: 'Shreyas Kumar Jaiswal',
    email: 'shreyas_2301cs52@iitp.ac.in',
    github: 'https://github.com/Jais-Shreyas',
    instagram: 'https://instagram.com/shreyas_iitp',
    linkedin: 'https://www.linkedin.com/in/shreyas-jaiswal-jellybean/',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQH5KUknQz-tHA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1703487029045?e=1749686400&v=beta&t=aSnGYiQhV8jjhl2KdO2XuxPJLRraFElv8ys6_S88Qkg',
  },
];

const Teams = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <NavBar page="teams" />
      <main className="flex-grow w-full">
        <div className="pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#294c25] mb-2">Meet the Team</h1>
            <p className="text-lg text-gray-600">The minds behind FoodLens</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col items-center text-center cursor-pointer"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-[#294c25]"
                />
                <h2 className="text-xl font-semibold text-gray-900">{member.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{member.email}</p>
                <div className="flex gap-4 text-[#294c25] text-xl">
                  <a href={`mailto:${member.email}`} target="_blank" rel="noopener noreferrer">
                    <FaEnvelope />
                  </a>
                  <a href={member.github} target="_blank" rel="noopener noreferrer">
                    <FaGithub />
                  </a>
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer">
                    <FaInstagram />
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Teams;
