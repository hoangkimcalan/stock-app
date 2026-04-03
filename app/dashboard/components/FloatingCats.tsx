'use client';

const CAT_GIF =
  'https://nguoiduatin.mediacdn.vn/thumb_w/930/84137818385850368/2024/12/3/eochattnctobngclipchamp-2024-12-03t101046535-ezgifcom-video-to-gif-converter-1733195616250173463180-17332364159402117390231-402-0-777-600-crop-17332370048351392378744.gif';

export default function FloatingCats() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* LEFT */}
        <div className="fixed left-0 top-0 h-screen w-[245px] overflow-hidden">
          <img
            src={CAT_GIF}
            alt="left cat"
            className="h-full w-full object-cover animate-cat-left opacity-90 select-none"
          />
        </div>

        {/* RIGHT */}
        <div className="fixed right-0 top-0 h-screen w-[245px] overflow-hidden">
          <img
            src={CAT_GIF}
            alt="right cat"
            className="h-full w-full object-cover animate-cat-right opacity-90 select-none scale-x-[-1]"
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes catLeft {
          0% {
            transform: scale(1) translateY(0);
          }
          25% {
            transform: scale(1.02) translateY(-10px);
          }
          50% {
            transform: scale(1) translateY(0);
          }
          75% {
            transform: scale(1.01) translateY(-6px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @keyframes catRight {
          0% {
            transform: scaleX(-1) scale(1) translateY(0);
          }
          25% {
            transform: scaleX(-1) scale(1.02) translateY(-10px);
          }
          50% {
            transform: scaleX(-1) scale(1) translateY(0);
          }
          75% {
            transform: scaleX(-1) scale(1.01) translateY(-6px);
          }
          100% {
            transform: scaleX(-1) scale(1) translateY(0);
          }
        }

        .animate-cat-left {
          animation: catLeft 2.8s ease-in-out infinite;
        }

        .animate-cat-right {
          animation: catRight 2.8s ease-in-out infinite;
        }

        @media (max-width: 1024px) {
          .animate-cat-left,
          .animate-cat-right {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .animate-cat-left,
          .animate-cat-right {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
