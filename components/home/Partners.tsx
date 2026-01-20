import React from 'react';

/* ===================== REUSABLE SPONSOR BOX ===================== */
const SponsorBox = ({ title, logoUrl, altText, colorClass = "bg-[#d83474]", size = "small" }) => (
  <div className={`flex flex-col w-full rounded-xl overflow-hidden bg-[#161618] border border-zinc-800 shadow-xl transition-transform hover:scale-105 duration-300`}>
    {/* Category Header */}
    <div className={`${colorClass} py-2 px-4 text-center`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
        {title}
      </span>
    </div>
    {/* Logo Area */}
    <div className={`flex items-center justify-center p-6 ${size === 'large' ? 'h-48' : 'h-32'}`}>
      <img 
        src={logoUrl} 
        alt={altText} 
        className="max-h-full max-w-full object-contain" 
      />
    </div>
  </div>
);

export const Partners = () => {
  // Top Row - Big Logos
  const organizers = [
    {
      title: "ORGANIZING PARTNER",
      logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058352/sslogowhite_cpuhl7.png",
      name: "Ssinphinite",
      color: "bg-[#d83474]"
    },
    {
      title: "ORGANIZING PARTNER",
      logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768059000/SKLS-Logo-15_vuzqhg.png",
      name: "satatham kritam legal from solutions llp",
      color: "bg-[#d83474]"
    }
  ];

  // Grid - Other Logos
  const otherSponsors = [
        { title: "SCIENCE & TECHNOLOGY PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058350/KSCST_vfzrae.png", name: "Kscst", color: "bg-[#8a3ffc]" },
            { title: "KNOWLEDGE PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058350/IEEE_TEMS_zf8cb9.jpg", name: "Ieee tems", color: "bg-[#d83474]" },
               { title: "IP PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058351/IPTEL_IISc_pzjp87.jpg", name: "IP Tel", color: "bg-[#8a3ffc]" },
                   { title: "INNOVATION PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058351/InnoMantra_nxzaaw.jpg", name: "Innomantra", color: "bg-[#d83474]" },
                   { title: "ECOSYSTEM PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058351/Startup_Tumkur_th3vti.jpg", name: "Startup Tumkur", color: "bg-[#8a3ffc]" },
                       { title: "AGRITECH PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058351/file_0000000055e871f68fad5a0f797da709_1_mkqxul.png", name: "Kalpakrushi", color: "bg-[#d83474]" },
    { title: "DIGITAL PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058350/MADHWA_INFOTECH_LOGO_FINAL_-_WHITE_pc6lwz.png", name: "Madhwa Infotech", color: "bg-[#8a3ffc]" },
    { title: "SOFTWARE PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058352/viniwhite_vdvueg.png", name: "Vindira Softech", color: "bg-[#d83474]" },
    { title: "EXPERIENCE PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058352/Zodiac_Creations_LOGO_FINAL_-_WHITE_qumym5.png", name: "Zodiac", color: "bg-[#8a3ffc]" },
    { title: "COMMUNITY PARTNER", logo: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768058350/Malleshwaram_Civic_Society_fyt58v.jpg", name: "M2", color: "bg-[#d83474]" }
  ];

  return (
    <section className="py-24 px-4 border-t border-zinc-800 bg-[#080808]">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-[#b666d2] mb-4">
            FACILITATORS
          </h2>
          <div className="w-24 h-1 bg-zinc-700 mx-auto rounded-full"></div>
        </div>

        {/* TOP ROW: 2 BIG LOGOS */}
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-16">
          {organizers.map((org, idx) => (
            <div key={idx} className="w-full md:w-1/3">
              <SponsorBox 
                title={org.title}
                logoUrl={org.logo}
                altText={org.name}
                colorClass={org.color}
                size="large"
              />
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: ALL OTHER LOGOS IN BOXES */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {otherSponsors.map((sponsor, index) => (
            <SponsorBox 
              key={index}
              title={sponsor.title}
              logoUrl={sponsor.logo}
              altText={sponsor.name}
              colorClass={sponsor.color}
              size="small"
            />
          ))}
        </div>

      </div>
    </section>
  );
};
