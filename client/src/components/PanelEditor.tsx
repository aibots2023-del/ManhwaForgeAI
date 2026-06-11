import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Copy, Undo2, Redo2, Download } from "lucide-react";
import { toast } from "sonner";

interface Panel {
  id: string;
  imageUrl?: string;
  elements: PanelElement[];
  width: number;
  height: number;
}

interface PanelElement {
  id: string;
  type: "speech_bubble" | "narration" | "thought";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontColor: string;
}

interface PanelEditorProps {
  chapterId: number;
  projectId: number;
}

export function PanelEditor({ chapterId, projectId }: PanelEditorProps) {
  const [panels, setPanels] = useState<Panel[]>([
    {
      id: "panel-1",
      width: 400,
      height: 500,
      elements: [],
    },
  ]);

  const [selectedPanelId, setSelectedPanelId] = useState("panel-1");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [history, setHistory] = useState<Panel[][]>([panels]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const selectedPanel = panels.find((p) => p.id === selectedPanelId);
  const selectedElement = selectedPanel?.elements.find((e) => e.id === selectedElementId);

  const addPanel = () => {
    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      width: 400,
      height: 500,
      elements: [],
    };
    const newPanels = [...panels, newPanel];
    updateHistory(newPanels);
    setSelectedPanelId(newPanel.id);
  };

  const deletePanel = (id: string) => {
    if (panels.length === 1) {
      toast.error("You must have at least one panel");
      return;
    }
    const newPanels = panels.filter((p) => p.id !== id);
    updateHistory(newPanels);
    if (selectedPanelId === id) {
      setSelectedPanelId(newPanels[0].id);
    }
  };

  const addElement = () => {
    if (!selectedPanel) return;

    const newElement: PanelElement = {
      id: `element-${Date.now()}`,
      type: "speech_bubble",
      content: "New text",
      x: 20,
      y: 20,
      width: 200,
      height: 60,
      fontSize: 14,
      fontColor: "#000000",
    };

    const updatedPanels = panels.map((p) =>
      p.id === selectedPanelId ? { ...p, elements: [...p.elements, newElement] } : p
    );
    updateHistory(updatedPanels);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (updates: Partial<PanelElement>) => {
    if (!selectedElement || !selectedPanel) return;

    const updatedPanels = panels.map((p) =>
      p.id === selectedPanelId
        ? {
            ...p,
            elements: p.elements.map((e) =>
              e.id === selectedElementId ? { ...e, ...updates } : e
            ),
          }
        : p
    );
    updateHistory(updatedPanels);
  };

  const deleteElement = () => {
    if (!selectedPanel || !selectedElementId) return;

    const updatedPanels = panels.map((p) =>
      p.id === selectedPanelId
        ? { ...p, elements: p.elements.filter((e) => e.id !== selectedElementId) }
        : p
    );
    updateHistory(updatedPanels);
    setSelectedElementId(null);
  };

  const updateHistory = (newPanels: Panel[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPanels);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setPanels(newPanels);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPanels(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPanels(history[newIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={historyIndex === 0}
            className="border-slate-600 hover:bg-slate-700"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="border-slate-600 hover:bg-slate-700"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="border-l border-slate-600" />
          <Button
            size="sm"
            onClick={addPanel}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Panel
          </Button>
          <Button
            size="sm"
            onClick={addElement}
            disabled={!selectedPanel}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Text
          </Button>
          <div className="border-l border-slate-600" />
          <Button
            size="sm"
            variant="outline"
            className="border-slate-600 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="overflow-auto bg-slate-900 rounded-lg p-4 min-h-96 max-h-96">
              <div className="flex gap-4 pb-4">
                {panels.map((panel) => (
                  <motion.div
                    key={panel.id}
                    className={`relative flex-shrink-0 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPanelId === panel.id
                        ? "border-purple-500 bg-slate-700"
                        : "border-slate-600 bg-slate-800 hover:border-slate-500"
                    }`}
                    style={{ width: panel.width, height: panel.height }}
                    onClick={() => setSelectedPanelId(panel.id)}
                  >
                    {panel.imageUrl && (
                      <img
                        src={panel.imageUrl}
                        alt="Panel"
                        className="w-full h-full object-cover rounded"
                      />
                    )}

                    {/* Elements */}
                    {panel.elements.map((element) => (
                      <motion.div
                        key={element.id}
                        className={`absolute p-2 rounded border cursor-pointer transition-all ${
                          selectedElementId === element.id
                            ? "border-purple-400 bg-purple-900/50"
                            : "border-slate-500 bg-slate-700/50 hover:border-slate-400"
                        }`}
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(element.id);
                        }}
                        draggable
                        onDragEnd={(e: any) => {
                          if (e.clientX && e.clientY && e.currentTarget) {
                            const deltaX = e.clientX - (e.currentTarget.offsetLeft + element.x);
                            const deltaY = e.clientY - (e.currentTarget.offsetTop + element.y);
                            updateElement({
                              x: Math.max(0, element.x + deltaX),
                              y: Math.max(0, element.y + deltaY),
                            });
                          }
                        }}
                      >
                        <p className="text-xs text-white line-clamp-2 pointer-events-none">
                          {element.content}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="space-y-4">
          {/* Panel List */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h4 className="font-semibold mb-3">Panels</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedPanelId === panel.id
                      ? "bg-purple-600"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={() => setSelectedPanelId(panel.id)}
                >
                  <span className="text-sm">Panel {panels.indexOf(panel) + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePanel(panel.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Element Properties */}
          {selectedElement && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Card className="bg-slate-800 border-slate-700 p-4">
                <h4 className="font-semibold mb-3">Element Properties</h4>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium mb-1">Type</label>
                    <Select
                      value={selectedElement.type}
                      onValueChange={(value) =>
                        updateElement({ type: value as any })
                      }
                    >
                      <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="speech_bubble">Speech Bubble</SelectItem>
                        <SelectItem value="narration">Narration</SelectItem>
                        <SelectItem value="thought">Thought</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Content</label>
                    <Input
                      value={selectedElement.content}
                      onChange={(e) =>
                        updateElement({ content: e.target.value })
                      }
                      className="h-8 bg-slate-700 border-slate-600 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Font Size</label>
                      <Input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) =>
                          updateElement({ fontSize: parseInt(e.target.value) })
                        }
                        className="h-8 bg-slate-700 border-slate-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.fontColor}
                        onChange={(e) =>
                          updateElement({ fontColor: e.target.value })
                        }
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={deleteElement}
                    className="w-full"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete Element
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
