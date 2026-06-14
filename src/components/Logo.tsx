const LOGO_URL = "https://pub-79d22fbf37e444a896d6acc795f2444b.r2.dev/static/logo/logo.jpg";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <img
      src={LOGO_URL}
      alt="Katyal Architects"
      className={`${sizeClasses[size]} object-contain`}
    />
  );
}
