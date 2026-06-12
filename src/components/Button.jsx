import React from 'react';

export default function Button({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="
        relative z-20 w-auto px-2.5 py-2.5 !rounded-none cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
        drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] [-webkit-text-stroke:1px_#000000] lg:[-webkit-text-stroke:3px_#000000]
        bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)] 
        
        before:content-[''] 
        before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
        before:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
        
        after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
        after:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
      "
      >
      START TO PLAY
    </button>
  );
}
