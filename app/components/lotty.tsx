'use client' ;
import Lottie from 'lottie-react';
import HSS from '../../public/animations/HSS.json';

const Lotty = () => {
  return (
    <div className='bg-[#F0EAD6] w-full'>
      <Lottie animationData={HSS} loop={true} />
    </div>
  );
};

export default Lotty;
