import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, ArrowRight, ExternalLink, CalendarDays, MapPin, Loader2 } from "lucide-react";
import { verifySponsorPayment } from "../../lib/actions/sponsors";

export const Route = createFileRoute("/events/confirmation")({
  component: EventConfirmationPage,
});

function EventConfirmationPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const ref = params.get("ref");

    if (type === "sponsor" && ref) {
      verifySponsorPayment({ data: { reference: ref } })
        .then((result: any) => {
          if (result.verified) {
            setStatus("success");
            setDetails(result);
          } else {
            setStatus("error");
            setDetails({ message: result.message || "Payment verification failed." });
          }
        })
        .catch((err: any) => {
          setStatus("error");
          setDetails({ message: err.message || "An error occurred." });
        });
    } else {
      setStatus("success");
      setDetails({ type: "participant", message: "Registration confirmed!" });
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/60">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
          <p className="text-white/60 mt-4">{details?.message || "Something went wrong."}</p>
          <Link to="/events" className="mt-8 inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-medium">
            Back to Events <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="container-x py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
            <Check size={36} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            {details?.type === "participant" ? "Registration Confirmed!" : "Payment Confirmed!"}
          </h1>
          <p className="text-white/60 mt-4 text-lg leading-relaxed">
            {details?.type === "participant"
              ? "You're now registered. A confirmation email has been sent to your inbox. Bring this confirmation (or show it on your phone) at check-in."
              : "Your sponsorship payment has been verified. A confirmation email with your receipt will be sent shortly."}
          </p>

          {details?.eventTitle && (
            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
              <h3 className="text-white font-bold text-lg">{details.eventTitle}</h3>
              <p className="text-white/60 text-sm mt-2">
                Transaction Reference: <span className="text-primary font-mono">{details.reference || "N/A"}</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link to="/events" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-all">
                  Browse Events <ExternalLink size={14} />
                </Link>
                <Link to="/" className="inline-flex items-center gap-2 border border-white/20 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-all">
                  Go Home <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {!details?.eventTitle && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/events" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-medium transition-all">
                Browse Events <ArrowRight size={16} />
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 border border-white/20 text-white rounded-full px-6 py-3 font-medium hover:bg-white/10 transition-all">
                Go Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
