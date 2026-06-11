import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ArtworkGeneratorProps {
  projectId?: number;
}

const artworkTypes = [
  { value: "character_portrait", label: "Character Portrait" },
  { value: "background", label: "Background" },
  { value: "action_scene", label: "Action Scene" },
  { value: "props", label: "Props & Objects" },
  { value: "other", label: "Other" },
];

const styles = [
  { value: "anime", label: "Anime" },
  { value: "webtoon", label: "Webtoon" },
  { value: "fantasy", label: "Fantasy" },
  { value: "semi-realistic", label: "Semi-Realistic" },
];

export function ArtworkGenerator({ projectId }: ArtworkGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<"character_portrait" | "background" | "action_scene" | "props" | "other">(
    "character_portrait"
  );
  const [style, setStyle] = useState<"anime" | "webtoon" | "fantasy" | "semi-realistic">("webtoon");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  const generateMutation = trpc.artwork.generate.useMutation();
  const toggleFavoriteMutation = trpc.artwork.toggleFavorite.useMutation();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        projectId,
        type: type as any,
        style: style as any,
        prompt,
      });

      setGeneratedImages([
        {
          id: Date.now(),
          url: result.imageUrl,
          prompt,
          type,
          style,
          isFavorite: false,
        },
        ...generatedImages,
      ]);

      toast.success("Artwork generated successfully!");
    } catch (error) {
      toast.error("Failed to generate artwork");
    }
  };

  const handleToggleFavorite = async (image: any) => {
    try {
      await toggleFavoriteMutation.mutateAsync({
        id: image.id,
        isFavorite: !image.isFavorite,
      });

      setGeneratedImages(
        generatedImages.map((img) =>
          img.id === image.id ? { ...img, isFavorite: !img.isFavorite } : img
        )
      );
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Panel */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Generate Artwork
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Artwork Type</label>
              <Select value={type} onValueChange={(value) => setType(value as any)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {artworkTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-white">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <Select value={style} onValueChange={(value) => setStyle(value as any)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-white">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prompt *</label>
            <Textarea
              placeholder="Describe the artwork you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              rows={4}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {generateMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Artwork
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Generated Artwork</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative"
              >
                <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleFavorite(image)}
                        className="border-white text-white hover:bg-white/20"
                      >
                        <Heart
                          className={`w-4 h-4 ${image.isFavorite ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white/20"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-400 line-clamp-2">{image.prompt}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-slate-700 px-2 py-1 rounded">{image.type.replace(/_/g, " ")}</span>
                      <span className="bg-slate-700 px-2 py-1 rounded">{image.style}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
