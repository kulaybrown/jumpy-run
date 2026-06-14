import React from 'react';

export default function Button({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="
        relative z-20 w-auto p-1 cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
        shadow-[0_0_20px_10px_rgb(255_255_255_/_60%)]
        bg-black

        before:content-['']
        before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
        before:bg-black

        after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
        after:bg-black
      ">
      <div
        className="
          absolute z-20 w-auto cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
          bg-[#000]
          bottom-[-7px]

          before:content-['']
          before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
          before:bg-[#000]

          after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
          after:bg-[#000]
        ">
        <div
          className="
            relative z-20 w-auto p-1 cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
            bg-[#000]
      
            before:content-['']
            before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
            before:bg-[#000]
      
            after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
            after:bg-[#000]
          ">
          <button
            className="
              relative z-20 w-auto p-1 lg:p-2.5 cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
              [-webkit-text-stroke:1px_#000000] lg:[-webkit-text-stroke:3px_#000000]
              bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
              brightness-75
      
              before:content-['']
              before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
              before:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
              before:brightness-75
      
              after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
              after:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
              after:brightness-75
            "
            >
            START TO PLAY
          </button>
        </div>
      </div>
      <div
        className="
          top-btn
          relative z-20 w-auto cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
          bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]

          before:content-['']
          before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
          before:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]

          after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
          after:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
        ">
        <div
          className="
            relative z-20 w-auto p-1 cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
            bg-[#ffffff7a]
      
            before:content-['']
            before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
            before:bg-[#ffffff7a]
      
            after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
            after:bg-[#ffffff7a]
          ">
          <div
            className="
              relative z-20 w-auto p-1 lg:p-2.5 cursor-pointer font-bungee text-2xl md:text-2xl lg:text-5xl text-shadow-lg/30
              [-webkit-text-stroke:1px_#000000] lg:[-webkit-text-stroke:3px_#000000]
              bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
      
              before:content-['']
              before:block before:absolute before:-z-10 before:top-2.5 before:bottom-2.5 before:-left-2.5 before:-right-2.5
              before:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
      
              after:content-[''] after:block after:absolute after:-z-10 after:top-1 after:bottom-1 after:-left-1.5 after:-right-1.5
              after:bg-[linear-gradient(to_right,#e63946_0%,#f4a261_30%,#e9c46a_50%,#60c96e_75%,#2a9d8f_100%)]
            "
            >
            START TO PLAY
          </div>
        </div>
      </div>
    </button>
  );
}
