import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

// Use namespace to resolve named export issues in the environment
const { Link } = ReactRouterDOM as any;

export const Hero = () => {
  return (
    <div className="relative h-[700px] w-full overflow-hidden bg-black">
      
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover scale-105"
        src="https://res.cloudinary.com/dzss2fubc/video/upload/v1768984421/Purple_Connected_Dots_Lines_Free_Background_Videos_No_Copyright___All_Background_Videos_i34w61.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter uppercase italic">
          ASCENT MATRIX 2026
        </h1>

        <p className="text-xl md:text-3xl text-purple-300 mb-10 font-medium max-w-3xl mx-auto">
          Amplifying Innovation & IP Generation efforts of India&apos;s Deep-Tech Startups
        </p>

        {/* CTA – Active Registration Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="
              px-12 py-5 rounded-full
              font-black text-xl uppercase tracking-widest
              bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600
              text-white
              shadow-[0_0_35px_rgba(192,38,211,0.5)]
              hover:scale-105 hover:shadow-[0_0_55px_rgba(192,38,211,0.8)]
              transition-all duration-300
            "
          >
            Register for Prelude
          </Link>
        </div>
      </div>
    </div>
  );
};
