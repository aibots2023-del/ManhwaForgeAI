import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  onSuccess?: () => void;
}

export function CharacterModal({ isOpen, onClose, projectId, onSuccess }: CharacterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    personalityTraits: "",
    biography: "",
    clothingDescription: "",
    specialAbilities: "",
  });

  const [step, setStep] = useState<"basic" | "details" | "ai">("basic");
  const [aiDescription, setAiDescription] = useState("");

  const createCharacterMutation = trpc.characters.create.useMutation();
  const generateDescriptionMutation = trpc.characters.generateDescription.useMutation();
  const utils = trpc.useUtils();

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      toast.error("Character name is required");
      return;
    }

    try {
      // Use a placeholder ID for generation
      const result = await generateDescriptionMutation.mutateAsync({
        characterId: 1,
        name: formData.name,
        role: formData.role,
        personalityTraits: formData.personalityTraits,
        specialAbilities: formData.specialAbilities,
      });
      setAiDescription(result.description);
      toast.success("Biography generated!");
    } catch (error) {
      toast.error("Failed to generate description");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Character name is required");
      return;
    }

    try {
      await createCharacterMutation.mutateAsync({
        projectId,
        name: formData.name,
        role: formData.role,
        personalityTraits: formData.personalityTraits,
        biography: aiDescription || formData.biography,
        clothingDescription: formData.clothingDescription,
        specialAbilities: formData.specialAbilities,
      });

      await utils.characters.list.invalidate();
      if (projectId) {
        await utils.characters.listByProject.invalidate({ projectId });
      }

      toast.success("Character created successfully!");
      setFormData({
        name: "",
        role: "",
        personalityTraits: "",
        biography: "",
        clothingDescription: "",
        specialAbilities: "",
      });
      setAiDescription("");
      setStep("basic");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Character creation error:", error);
      toast.error(error?.message || "Failed to create character");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h2 className="text-xl font-semibold">Create New Character</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium mb-2">Character Name *</label>
                <Input
                  placeholder="Enter character name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role/Archetype</label>
                <Input
                  placeholder="e.g., Protagonist, Antagonist, Support"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium mb-2">Personality Traits</label>
                <Textarea
                  placeholder="Describe personality traits..."
                  value={formData.personalityTraits}
                  onChange={(e) => setFormData({ ...formData, personalityTraits: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clothing Description</label>
                <Textarea
                  placeholder="Describe the character's appearance and clothing..."
                  value={formData.clothingDescription}
                  onChange={(e) => setFormData({ ...formData, clothingDescription: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Abilities</label>
                <Textarea
                  placeholder="List any special abilities or powers..."
                  value={formData.specialAbilities}
                  onChange={(e) => setFormData({ ...formData, specialAbilities: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                  rows={2}
                />
              </div>

              {/* AI Generated Biography */}
              {aiDescription && (
                <motion.div
                  className="p-4 bg-slate-700 rounded-lg border border-purple-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    AI-Generated Biography
                  </label>
                  <Textarea
                    value={formData.biography || aiDescription}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white resize-none"
                    rows={3}
                  />
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateDescription}
                  disabled={generateDescriptionMutation.isPending || !formData.name}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateDescriptionMutation.isPending ? "Generating..." : "Generate Bio"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-slate-600 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={createCharacterMutation.isPending}
                >
                  {createCharacterMutation.isPending ? "Creating..." : "Create Character"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
