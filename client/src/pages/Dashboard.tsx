import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectModal } from "@/components/ProjectModal";
import { CharacterModal } from "@/components/CharacterModal";
import { ArtworkGenerator } from "@/components/ArtworkGenerator";
import { StoryGenerator } from "@/components/StoryGenerator";
import { PanelEditor } from "@/components/PanelEditor";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { BookOpen, Users, Palette, Sparkles, Plus, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"projects" | "characters" | "stories" | "artwork">(
    "projects"
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);

  const projectsQuery = trpc.projects.list.useQuery();
  const charactersQuery = trpc.characters.list.useQuery();
  const projectStoriesQuery = trpc.stories.listByProject.useQuery(
    { projectId: selectedProjectId || 0 },
    { enabled: !!selectedProjectId }
  );
  const storyChaptersQuery = trpc.chapters.listByStory.useQuery(
    { storyId: selectedStoryId || 0 },
    { enabled: !!selectedStoryId }
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navItems = [
    { id: "projects", label: "Projects", icon: BookOpen },
    { id: "characters", label: "Characters", icon: Users },
    { id: "stories", label: "Story Arcs", icon: Sparkles },
    { id: "artwork", label: "Artwork Studio", icon: Palette },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <motion.aside
        className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ManhwaForge
            </span>
          </div>
          <p className="text-sm text-slate-400">Creator Studio</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                whileHover={{ x: 5 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3 sticky bottom-0 bg-slate-900">
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.email || user?.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className="flex-1 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-8 py-6 z-40">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400">Manage your creative projects</p>
            </div>
            <Button
              onClick={() => {
                if (activeTab === "projects") setProjectModalOpen(true);
                if (activeTab === "characters") setCharacterModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === "projects" && (
            <ProjectsTab projects={projectsQuery.data || []} isLoading={projectsQuery.isLoading} />
          )}
          {activeTab === "characters" && (
            <CharactersTab
              characters={charactersQuery.data || []}
              isLoading={charactersQuery.isLoading}
            />
          )}
          {activeTab === "stories" && (
            <StoriesTab
              projects={projectsQuery.data || []}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              stories={projectStoriesQuery.data || []}
              isLoading={projectStoriesQuery.isLoading}
            />
          )}
          {activeTab === "artwork" && (
            <ArtworkTab
              projects={projectsQuery.data || []}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          )}
        </div>
      </motion.main>

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSuccess={() => projectsQuery.refetch()}
      />
      <CharacterModal
        isOpen={characterModalOpen}
        onClose={() => setCharacterModalOpen(false)}
        projectId={selectedProjectId || undefined}
        onSuccess={() => charactersQuery.refetch()}
      />
    </div>
  );
}

function ProjectsTab({ projects, isLoading }: { projects: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
        <p className="text-slate-400 mb-6">Create your first manhwa series to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
        >
          <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors cursor-pointer h-full overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              {project.coverImageUrl ? (
                <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-white opacity-50" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{project.synopsis}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">{project.genre}</span>
                <span className="text-xs text-slate-400">{project.status}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CharactersTab({ characters, isLoading }: { characters: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No characters yet</h3>
        <p className="text-slate-400">Create your first character to build your character library</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((character) => (
        <motion.div
          key={character.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
        >
          <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors cursor-pointer overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              {character.portraitImageUrl ? (
                <img
                  src={character.portraitImageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-12 h-12 text-white opacity-50" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{character.name}</h3>
              <p className="text-sm text-slate-400 mb-2">{character.role}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{character.biography}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function StoriesTab({
  projects,
  selectedProjectId,
  onSelectProject,
  stories,
  isLoading,
}: {
  projects: any[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  stories: any[];
  isLoading: boolean;
}) {
  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Select a Project</h3>
        <p className="text-slate-400 mb-6">Choose a project to manage its story arcs</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-slate-800 border-slate-700 hover:border-purple-500 cursor-pointer p-4"
              onClick={() => onSelectProject(project.id)}
            >
              <h4 className="font-semibold">{project.title}</h4>
              <p className="text-sm text-slate-400">{project.genre}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StoryGenerator projectId={selectedProjectId} />
  );
}

function ArtworkTab({
  projects,
  selectedProjectId,
  onSelectProject,
}: {
  projects: any[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
}) {
  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <Palette className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Select a Project</h3>
        <p className="text-slate-400 mb-6">Choose a project to generate artwork</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-slate-800 border-slate-700 hover:border-purple-500 cursor-pointer p-4"
              onClick={() => onSelectProject(project.id)}
            >
              <h4 className="font-semibold">{project.title}</h4>
              <p className="text-sm text-slate-400">{project.genre}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ArtworkGenerator projectId={selectedProjectId} />
  );
}
