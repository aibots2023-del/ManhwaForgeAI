import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface StoryGeneratorProps {
  projectId: number;
  onStoryCreated?: () => void;
}

const genres = ["Murim", "Fantasy", "Action", "Romance", "Sci-Fi", "Horror", "Comedy", "Slice of Life"];

export function StoryGenerator({ projectId, onStoryCreated }: StoryGeneratorProps) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedStory, setGeneratedStory] = useState<any>(null);

  const createStoryMutation = trpc.stories.create.useMutation();
  const generateOutlineMutation = trpc.stories.generateOutline.useMutation();
  const utils = trpc.useUtils();

  const handleGenerateOutline = async () => {
    if (!title.trim() || !genre) {
      toast.error("Title and genre are required");
      return;
    }

    try {
      // First create the story
      const storyResult = await createStoryMutation.mutateAsync({
        projectId,
        title,
        genre,
      });

      // Then generate the outline
      const outlineResult = await generateOutlineMutation.mutateAsync({
        storyId: (storyResult as any).insertId || 0,
        title,
        genre,
        prompt: prompt || "Create an engaging and original story",
      });

      setGeneratedStory({
        title,
        genre,
        outline: outlineResult.outline,
      });

      await utils.stories.listByProject.invalidate({ projectId });
      toast.success("Story outline generated successfully!");
    } catch (error) {
      toast.error("Failed to generate story outline");
    }
  };

  const handleCreateNewStory = () => {
    setTitle("");
    setGenre("");
    setPrompt("");
    setGeneratedStory(null);
  };

  return (
    <div className="space-y-6">
      {!generatedStory ? (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Generate Story Outline
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Story Title *</label>
                <Input
                  placeholder="Enter story title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Genre *</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {genres.map((g) => (
                      <SelectItem key={g} value={g} className="text-white">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Story Concept (Optional)</label>
              <Textarea
                placeholder="Describe your story concept or provide additional details..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                rows={4}
              />
            </div>

            <Button
              onClick={handleGenerateOutline}
              disabled={generateOutlineMutation.isPending || !title.trim() || !genre}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {generateOutlineMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Outline
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{generatedStory.title}</h3>
                <p className="text-slate-400">{generatedStory.genre}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleCreateNewStory}
                className="border-slate-600 hover:bg-slate-700"
              >
                Create New Story
              </Button>
            </div>

            <div className="prose prose-invert max-w-none">
              <Streamdown>{generatedStory.outline}</Streamdown>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-700"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Create Chapters
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Continue Editing
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
