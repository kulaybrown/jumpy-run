import React from 'react';

const VARIANT_GRADIENTS = {
  primary: 'bg-[linear-gradient(to_right,#e63946_0%,#f4a261_25%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]',
  secondary: 'bg-[linear-gradient(90deg,_#E63946_0%,_#ED6C53_25%,_#F4A261_50%,_#ED6C53_75%,_#E63946_100%)]',
};

export default function Button({ onClick, text="START TO PLAY", variant="primary" }) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.primary;
  return (
    <button 
      onClick={onClick}
      className={`
        relative z-20 w-auto p-1 cursor-pointer 
        shadow-[0_0_20px_10px_rgb(255_255_255_/_60%)]
        bg-[#000000]
        active:top-1
        transition duration-100 ease-in-out

        before:content-['']
        before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
        before:bg-[#000000]

        after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
        after:bg-[#000000]
      `}>
      <div
        className={`
          relative z-20 w-auto
          ${gradient}

          before:content-['']
          before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
          before:${gradient}

          after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
          after:${gradient}
        `}>
        <div
          className="
            relative z-20 w-auto p-1
            bg-[#ffffff7a]
      
            before:content-['']
            before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
            before:bg-[#ffffff7a]
      
            after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
            after:bg-[#ffffff7a]
          ">
          <div
            className={`
              relative z-20 w-auto p-1 lg:p-2.5 font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
              [-webkit-text-stroke:2px_#000000] lg:[-webkit-text-stroke:3px_#000000]
              ${gradient}
      
              before:content-['']
              before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
              before:${gradient}

              after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
              after:${gradient}
            `}
            >
            {text}
          </div>
        </div>
      </div>
    </button>
  );
}
