import React from 'react';

const VARIANT_GRADIENTS = {
  primary: 'bg-[linear-gradient(to_right,#e63946_0%,#f4a261_25%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]',
  secondary: 'bg-[linear-gradient(90deg,_#E63946_0%,_#ED6C53_25%,_#F4A261_50%,_#ED6C53_75%,_#E63946_100%)]',
};

export default function Button({ onClick, text="START TO PLAY", variant="primary", outline=true }) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.primary;
  const outlineClass = outline ? '[-webkit-text-stroke:2px_#000000] lg:[-webkit-text-stroke:3px_#000000]' : '';
  return (
    <button 
      onClick={onClick}
      className={`
        relative rounded-[13px] z-20 w-auto pb-1 border-2 border-black
        ${gradient}
        
        before:content-[''] before:absolute before:inset-0 before:rounded-xl before:bg-[#000] before:opacity-50

      `}>
      <div 
        className={`
          relative rounded-[10px] border border-2 border-white z-20 w-auto p-1 lg:p-2.5 px-5 font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
          ${outlineClass}
          ${gradient}

        `}>
        {text}
      </div>
    </button>
  );
}
