import DownloadBar from "@/components/DownloadBar";
import Header from "@/components/Header";
import PitchSlider from "@/components/PitchSlider";

export default function Home() {
  return (
    <div className="page-shell">
      <Header />
      <main>
        <PitchSlider />
      </main>
      <DownloadBar />
    </div>
  );
}
