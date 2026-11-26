import { PPT_FILENAME, PPT_PATH } from "@/data/slides";

export default function DownloadBar() {
  return (
    <section className="download-bar">
      <div className="download-bar__inner">
        <div>
          <p className="download-bar__eyebrow">Take it with you</p>
          <h2 className="download-bar__title">Download the FlorIQ pitch deck</h2>
          <p className="download-bar__copy">
            Final Canva PPTX for meetings and offline presenting — plus the live slider above for Auto or Manual delivery.
          </p>
        </div>
        <a className="download-bar__btn" href={PPT_PATH} download={PPT_FILENAME}>
          Download PPT
        </a>
      </div>
    </section>
  );
}
