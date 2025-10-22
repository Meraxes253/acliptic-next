import Image from 'next/image';

const MultipleLanguages = () => {
  return (
    <div className="relative w-full bg-gray-50 py-20"><div className="max-w-6xl mx-auto px-4">
      {/* Title */}
      <h1 className="text-9xl lg:text-[10rem] font-light italic text-black tracking-wide leading-none text-center mb-14 relative z-10 denton-condensed">
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
            width={485}
            height={983}
            className="object-contain"
          />
          {/* English subtitle overlay */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white text-4xl whitespace-nowrap italic z-500">
            What I mean is
          </div>
        </div>

        {/* Left side text overlays */}
        <div className="absolute -left-[255px] top-1/2 transform -translate-y-1/2 z-10">
          {/* Japanese text */}
          <div className="absolute text-gray-500 text-4xl whitespace-nowrap" style={{top: '-102px', left: '34px'}}>
            <p>つまり、私が言い</p>
            <p>たいのは</p>
          </div>

          {/* Arabic text */}
          <div className="absolute text-gray-500 text-4xl text-right whitespace-nowrap" style={{top: '17px', left: '-85px'}}>
            <p>ما أعنيه هو</p>
          </div>

          {/* French text */}
          <div className="absolute text-gray-500 text-4xl italic whitespace-nowrap" style={{top: '136px', left: '51px'}}>
            <p>Ce que je veux dire</p>
          </div>
        </div>

        {/* Right side text overlays */}
        <div className="absolute -right-[272px] top-1/2 transform -translate-y-1/2 z-10">
          {/* Spanish text */}
          <div className="absolute text-gray-500 text-4xl italic whitespace-nowrap" style={{top: '-85px', right: '17px'}}>
            <p>Lo que quiero decir es que</p>
          </div>

          {/* Lithuanian text */}
          <div className="absolute text-gray-500 text-4xl italic whitespace-nowrap" style={{top: '119px', right: '-51px'}}>
            <p>Aš turiu omenyje, kad</p>
          </div>

          {/* German text */}
          <div className="absolute text-gray-500 text-4xl whitespace-nowrap" style={{top: '34px', right: '85px'}}>
            <p>Was ich meine ist</p>
          </div>
        </div>
        
      </div>
    </div></div>
  );
};

export default MultipleLanguages;