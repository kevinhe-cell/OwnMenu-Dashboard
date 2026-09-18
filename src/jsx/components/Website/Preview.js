import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function HomepagePreview({
  iframeKey,
  iframeLoading,
  plan,
  previewMode,
  setIframeLoading,
}) {
  const showSkeleton = iframeLoading;

  // 1. Determine the iframe source based on the environment
  const isProduction = process.env.NODE_ENV === 'production';
  const iframeSrc = isProduction 
    ? `https://${plan?.domain}.ownmenu.com` 
    : 'http://localhost:3001';

  return (
    <div
      style={{
        height: "100%", // subtract header + link height
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: previewMode === "mobile" ? "456px" : "100%",
          height: "100%",
          border: "none",
        }}
      >
        {iframeLoading && (
          <div
            className="d-flex justify-content-center align-items-center flex-column"
            style={{ height: "100%" }}
          >
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }} // bigger spinner
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fw-semibold text-secondary small">
              Preparing your website preview...
            </p>
          </div>
        )}
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 border-bottom"></div>
          <div className="px-3 text-muted fw-semibold small">
            Live Site Below
          </div>
          <div className="flex-grow-1 border-bottom"></div>
        </div>

        {showSkeleton && (
          <Skeleton
            height="100%"
            width="100%"
            borderRadius="1.5rem"
            style={{ position: "absolute", inset: 0, zIndex: 10 }}
            duration={0.7}
          />
        )}

        <iframe
          key={iframeKey}
          src={iframeSrc} // 2. Use the dynamic source
          title="Homepage Preview"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "1.5rem",
            visibility: showSkeleton ? "hidden" : "visible", // hide iframe until ready
          }}
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    </div>
  );
}

export default HomepagePreview;
