import Image from 'next/image';

const MultipleLanguages = () => {
  return (
    <div className="relative w-full bg-gray-50 py-20"><div className="max-w-6xl mx-auto px-4">
      {/* Title */}
      <h1 className="text-9xl lg:text-[12rem] font-light italic text-black tracking-wide leading-none text-center mb-16 relative z-10 denton-condensed">
        Multiple
        <br />
        Languages
      </h1>
      
      {/* Main Container */}
      <div className="relative flex items-center justify-center -mt-36">
        
        {/* Center Phone Image */}
        <div className="relative z-20">
          <Image
            src="/landingPage/image12.png"
            alt="Multiple Languages Phone"
            width={571}
            height={1157}
            className="object-contain"
          />
          {/* English subtitle overlay */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white text-5xl whitespace-nowrap italic">
            What I mean is
          </div>
        </div>
        
        {/* Left side text overlays */}
        <div className="absolute -left-[300px] top-1/2 transform -translate-y-1/2 z-10">
          {/* Japanese text */}
          <div className="absolute text-gray-500 text-5xl whitespace-nowrap" style={{top: '-120px', left: '40px'}}>
            <p>つまり、私が言い</p>
            <p>たいのは</p>
          </div>

          {/* Arabic text */}
          <div className="absolute text-gray-500 text-5xl text-right whitespace-nowrap" style={{top: '20px', left: '-100px'}}>
            <p>ما أعنيه هو</p>
          </div>

          {/* French text */}
          <div className="absolute text-gray-500 text-5xl italic whitespace-nowrap" style={{top: '160px', left: '60px'}}>
            <p>Ce que je veux dire</p>
          </div>
        </div>
        
        {/* Right side text overlays */}
        <div className="absolute -right-[320px] top-1/2 transform -translate-y-1/2 z-10">
          {/* Spanish text */}
          <div className="absolute text-gray-500 text-5xl italic whitespace-nowrap" style={{top: '-100px', right: '20px'}}>
            <p>Lo que quiero decir es que</p>
          </div>

          {/* Lithuanian text */}
          <div className="absolute text-gray-500 text-5xl italic whitespace-nowrap" style={{top: '140px', right: '-60px'}}>
            <p>Aš turiu omenyje, kad</p>
          </div>

          {/* German text */}
          <div className="absolute text-gray-500 text-5xl whitespace-nowrap" style={{top: '40px', right: '100px'}}>
            <p>Was ich meine ist</p>
          </div>
        </div>
        
      </div>
    </div></div>
  );
};

export default MultipleLanguages;