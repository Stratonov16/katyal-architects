const LOGO_URL = "https://pub-79d22fbf37e444a896d6acc795f2444b.r2.dev/static/logo/logo.jpg";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-14 h-14",
  };

  return (
    <img
      src={LOGO_URL}
      alt="Katyal Architects"
      className={`${sizeClasses[size]} object-cover rounded-full`}
    />
  );
}
