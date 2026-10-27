import {
  Camera,
  Feather,
  FileText,
  Film,
  Mic,
  Palette,
  PenLine,
  PenTool,
  type LucideProps,
} from "lucide-react";

export function SubmissionIcon({
  kind,
  category,
  ...props
}: LucideProps & { kind: "art" | "science"; category: string }) {
  if (kind === "science") return <FileText {...props} />;
  switch (category) {
    case "photo":
      return <Camera {...props} />;
    case "film":
      return <Film {...props} />;
    case "podcast":
      return <Mic {...props} />;
    case "note":
      return <Feather {...props} />;
    case "poem":
      return <PenLine {...props} />;
    case "calligraphy":
      return <PenTool {...props} />;
    default:
      return <Palette {...props} />;
  }
}
