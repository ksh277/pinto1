
'use client';

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Undo2,
  Redo2,
  X,
  Square,
  Circle,
  Trash2,
  Heart,
  Star,
  Hand
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductEditor } from "@/components/editor/ProductEditor";
import { SizeSelector } from "@/components/editor/SizeSelector";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { ProductTypeSelector } from "./ProductTypeSelector";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface EditorLayoutProps {
  productType?: string;
}

export interface CanvasElement {
  id: string;
  type: "image" | "text" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  zIndex: number;
  src?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  color?: string;
  shapeType?: "rectangle" | "circle";
  fill?: string;
}

export interface CanvasSize {
  width: number;
  height: number;
  widthMM: number;
  heightMM: number;
}

export type OutlineMode = 'AABB' | 'TRACE';

export function EditorLayout({ productType }: EditorLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Canvas and size state
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Tool state
  const [newText, setNewText] = useState("텍스트");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Pretendard");
  const [textColor, setTextColor] = useState("#000000");
  const [shapeType, setShapeType] = useState<"rectangle" | "circle">(
    "rectangle",
  );
  const [shapeFill, setShapeFill] = useState("#FF0000");

  // Perforation state
  const [perfEnabled, setPerfEnabled] = useState(true);
  const [perfMode, setPerfMode] = useState<'guide' | 'export'>('guide');
  const [perfOffset, setPerfOffset] = useState(8);

  // Outline state
  const [outlineMode, setOutlineMode] = useState<OutlineMode>('AABB');
  const [edgeMm, setEdgeMm] = useState(8);
  const [simplifyEpsMm, setSimplifyEpsMm] = useState(0.4);

  // Bottom bar state
  const [holeCount, setHoleCount] = useState(1);
  const [holeSize, setHoleSize] = useState('2.5');
  const [whiteAreaOffset, setWhiteAreaOffset] = useState(1.0);
  const [isHoleDirectionOutside, setIsHoleDirectionOutside] = useState(true);


  const isEditorEnabled = canvasSize !== null;
  const currentProductType = productType;

  const handleSizeSet = useCallback(
    (size: CanvasSize) => {
      setCanvasSize(size);
      toast({
        title: "캔버스 크기 설정됨",
        description: `${size.widthMM}mm × ${size.heightMM}mm (${size.width}px × ${size.height}px)`,
      });
    },
    [toast],
  );

  const saveToHistory = useCallback(
    (newElements: CanvasElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...newElements]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex],
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);
  
  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      const newElements = elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      );
      setElements(newElements);
    },
    [elements],
  );

  const commitUpdate = useCallback(() => {
      saveToHistory(elements);
  }, [elements, saveToHistory]);


  const addElement = useCallback(
    (element: CanvasElement) => {
      const newElements = [...elements, element];
      setElements(newElements);
      setSelectedElement(element.id);
      saveToHistory(newElements);
    },
    [elements, saveToHistory],
  );

  const deleteElement = useCallback(
    (id: string) => {
      const newElements = elements.filter((el) => el.id !== id);
      setElements(newElements);
      if (selectedElement === id) {
        setSelectedElement(null);
      }
      saveToHistory(newElements);
    },
    [elements, selectedElement, saveToHistory],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !canvasSize) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let width = Math.min(canvasSize.width * 0.3, 100);
          let height = width / aspectRatio;

          if (height > canvasSize.height * 0.3) {
            height = canvasSize.height * 0.3;
            width = height * aspectRatio;
          }

          const element: CanvasElement = {
            id: `img-${Date.now()}`,
            type: "image",
            x: (canvasSize.width - width) / 2,
            y: (canvasSize.height - height) / 2,
            width,
            height,
            rotation: 0,
            visible: true,
            zIndex: elements.length,
            src: event.target?.result as string,
          };

          addElement(element);
          toast({
            title: "이미지 추가됨",
            description: "이미지가 캔버스에 추가되었습니다.",
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [canvasSize, elements, addElement, toast],
  );

  const handleAddText = useCallback(() => {
    if (!newText.trim() || !canvasSize) return;

    const element: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: canvasSize.width * 0.1,
      y: canvasSize.height * 0.1,
      width: canvasSize.width * 0.8,
      height: fontSize * 1.5,
      rotation: 0,
      visible: true,
      zIndex: elements.length,
      text: newText,
      fontSize,
      fontFamily,
      color: textColor,
    };

    addElement(element);
    setNewText("텍스트");
    toast({
      title: "텍스트 추가됨",
      description: "텍스트가 캔버스에 추가되었습니다.",
    });
  }, [
    newText,
    canvasSize,
    fontSize,
    fontFamily,
    textColor,
    elements,
    addElement,
    toast,
  ]);

  const handleAddShape = useCallback(() => {
    if (!canvasSize) return;

    const size = Math.min(canvasSize.width, canvasSize.height) * 0.2;
    const element: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: (canvasSize.width - size) / 2,
      y: (canvasSize.height - size) / 2,
      width: size,
      height: size,
      rotation: 0,
      visible: true,
      zIndex: elements.length,
      shapeType,
      fill: shapeFill,
    };

    addElement(element);
    toast({
      title: "도형 추가됨",
      description: "도형이 캔버스에 추가되었습니다.",
    });
  }, [canvasSize, shapeType, shapeFill, elements, addElement, toast]);

  const handleSave = useCallback(async () => {
    if (!elements.length && !canvasSize) {
      toast({
        title: "저장할 디자인이 없습니다",
        description: "캔버스에 요소를 추가한 후 저장해주세요.",
        variant: "destructive",
      });
      return;
    }

    const designData = {
      elements,
      canvasSize,
      timestamp: Date.now(),
      productType: currentProductType,
    };

    try {
      localStorage.setItem("pinto-design", JSON.stringify(designData));
      toast({
        title: "디자인 저장됨",
        description: `${elements.length}개의 요소가 포함된 디자인이 저장되었습니다.`,
      });
    } catch (error) {
      console.error("Design save error:", error);
      toast({
        title: "저장 실패",
        description: "디자인 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  }, [elements, canvasSize, currentProductType, toast]);

  const handleLoad = useCallback(() => {
    try {
        const savedData = localStorage.getItem('pinto-design');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setCanvasSize(parsedData.canvasSize);
            setElements(parsedData.elements);
            saveToHistory(parsedData.elements);
            toast({
                title: '디자인 불러오기 성공',
                description: '저장된 디자인을 불러왔습니다.'
            });
        } else {
            toast({
                title: '저장된 디자인 없음',
                description: '저장된 디자인이 없습니다.',
                variant: 'destructive',
            });
        }
    } catch {
        toast({
            title: '불러오기 실패',
            description: '디자인을 불러오는 중 오류가 발생했습니다.',
            variant: 'destructive',
        });
    }
  }, [saveToHistory, toast]);


  const handleExport = useCallback(
    async (format: "png" | "pdf") => {
      if (!canvasSize || !canvasRef.current) {
        toast({
          title: "내보내기 실패",
          description: "캔버스가 준비되지 않았습니다. 크기를 먼저 설정해주세요.",
          variant: "destructive",
        });
        return;
      }

      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 2, 
          useCORS: true,
          allowTaint: true,
        });

        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        
        if (format === "png") {
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `design_${timestamp}.png`);
              toast({
                title: "PNG 다운로드 완료",
                description: `design_${timestamp}.png 파일이 저장되었습니다.`,
              });
            }
          }, 'image/png');
        } else {
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = canvasSize.widthMM;
          const pdfHeight = canvasSize.heightMM;
          
          const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
            unit: "mm",
            format: [pdfWidth, pdfHeight],
          });
          
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          
          const pdfBlob = pdf.output('blob');
          saveAs(pdfBlob, `design_${timestamp}.pdf`);
          
          toast({
            title: "PDF 다운로드 완료",
            description: `design_${timestamp}.pdf 파일이 저장되었습니다.`,
          });
        }
      } catch (error) {
        console.error("Export error:", error);
        toast({
          title: "내보내기 실패",
          description: "파일 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    },
    [canvasSize, canvasRef, toast],
  );

  if (!currentProductType) {
    return <ProductTypeSelector />;
  }
  
  const TopBarButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
    <Button variant="ghost" size="sm" className="flex flex-col h-auto p-1 text-gray-300 hover:bg-gray-700 hover:text-white" {...props}>
        {children}
    </Button>
  );

  return (
    <div className="h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-100">
          <span className="text-lg font-bold">ALL THAT PRINTING</span>
          <span className="text-sm text-gray-400">EDITOR</span>
           <Select defaultValue="keyring">
            <SelectTrigger className="w-24 h-8 text-sm bg-gray-800 border-gray-700 text-white">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="keyring">키링</SelectItem>
                <SelectItem value="stand">스탠드</SelectItem>
                <SelectItem value="photocard-holder">포카홀더</SelectItem>
            </SelectContent>
            </Select>
        </div>
        
        <div className="flex items-center space-x-1">
            <TopBarButton onClick={handleUndo} disabled={historyIndex <= 0}><Undo2 className="w-5 h-5 mb-1" /><span className="text-xs">이전</span></TopBarButton>
            <TopBarButton onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2 className="w-5 h-5 mb-1" /><span className="text-xs">이후</span></TopBarButton>
            <TopBarButton><Hand className="w-5 h-5 mb-1" /><span className="text-xs">이동</span></TopBarButton>
            <TopBarButton onClick={() => selectedElement && deleteElement(selectedElement)} disabled={!selectedElement}><Trash2 className="w-5 h-5 mb-1" /><span className="text-xs">삭제</span></TopBarButton>
        </div>

        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-700" onClick={handleLoad}>불러오기</Button>
           <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-700" onClick={handleSave}>저장</Button>
           <Button variant="default" size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleExport('pdf')}>PDF 다운로드</Button>
           <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex flex-col">
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-6']} className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-medium px-4 py-3 text-gray-300 border-b border-gray-700">자료 설정</AccordionTrigger>
                <AccordionContent className="p-4">
                     <SizeSelector onSizeSet={handleSizeSet} />
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-medium px-4 py-3 text-gray-300 border-b border-gray-700">이미지</AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                     <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!isEditorEnabled} className="w-full text-xs text-gray-300 border-gray-600 hover:bg-gray-700">
                        + 내 PC 이미지 불러오기
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Button variant="outline" size="sm" className="w-full text-xs text-gray-300 border-gray-600 hover:bg-gray-700">
                        배경 이미지 제거
                      </Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-medium px-4 py-3 text-gray-300 border-b border-gray-700">절취선</AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                       <Label htmlFor="perf-enabled" className="text-xs text-gray-300">활성화</Label>
                       <Switch id="perf-enabled" checked={perfEnabled} onCheckedChange={setPerfEnabled} disabled={!isEditorEnabled}/>
                    </div>
                    <Select value={perfMode} onValueChange={(v: 'guide' | 'export') => setPerfMode(v)} disabled={!isEditorEnabled || !perfEnabled}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">가이드 전용</SelectItem>
                        <SelectItem value="export">내보내기 포함</SelectItem>
                      </SelectContent>
                    </Select>
                     <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                         <Label htmlFor="perf-offset">간격 (mm)</Label>
                         <Input 
                            id="perf-offset"
                            type="number"
                            value={perfOffset}
                            onChange={e => setPerfOffset(Number(e.target.value))}
                            className="w-16 h-7 bg-gray-700 border-gray-600 text-white text-xs"
                            disabled={!isEditorEnabled || !perfEnabled}
                         />
                       </div>
                       <Slider value={[perfOffset]} onValueChange={([v]) => setPerfOffset(v)} min={0} max={15} step={1} disabled={!isEditorEnabled || !perfEnabled} />
                     </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-6">
                <AccordionTrigger className="text-sm font-medium px-4 py-3 text-gray-300 border-b border-gray-700">컷라인 설정</AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                         <Label htmlFor="edge-mm">외곽 여백 (mm)</Label>
                         <Input 
                            id="edge-mm"
                            type="number"
                            value={edgeMm}
                            onChange={e => setEdgeMm(Number(e.target.value))}
                            className="w-16 h-7 bg-gray-700 border-gray-600 text-white text-xs"
                            disabled={!isEditorEnabled}
                         />
                       </div>
                       <Slider value={[edgeMm]} onValueChange={([v]) => setEdgeMm(v)} min={0} max={20} step={0.5} disabled={!isEditorEnabled} />
                     </div>
                      <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                         <Label htmlFor="simplify-eps">단순화 (mm)</Label>
                         <Input 
                            id="simplify-eps"
                            type="number"
                            value={simplifyEpsMm}
                            onChange={e => setSimplifyEpsMm(Number(e.target.value))}
                            className="w-16 h-7 bg-gray-700 border-gray-600 text-white text-xs"
                            disabled={!isEditorEnabled || outlineMode !== 'TRACE'}
                         />
                       </div>
                       <Slider value={[simplifyEpsMm]} onValueChange={([v]) => setSimplifyEpsMm(v)} min={0} max={2} step={0.1} disabled={!isEditorEnabled || outlineMode !== 'TRACE'} />
                     </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-medium px-4 py-3 text-gray-300 border-b border-gray-700">텍스트</AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                    <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="텍스트 입력" disabled={!isEditorEnabled} className="bg-gray-700 border-gray-600 text-white text-xs h-8"/>
                    <Select value={fontFamily} onValueChange={setFontFamily} disabled={!isEditorEnabled}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Pretendard">Pretendard</SelectItem></SelectContent>
                    </Select>
                    <div className="flex space-x-2">
                      <Input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} disabled={!isEditorEnabled} className="bg-gray-700 border-gray-600 text-white text-xs h-8"/>
                      <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} disabled={!isEditorEnabled} className="bg-gray-700 border-gray-600 w-12 h-8"/>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddText} disabled={!isEditorEnabled || !newText.trim()} className="w-full text-xs text-gray-300 border-gray-600 hover:bg-gray-700 h-8">텍스트 추가</Button>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger className="text-sm font-medium px-4 py-3 text-gray-300 border-b border-gray-700">도형</AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                     <div className="flex space-x-2">
                        <Button variant={shapeType === 'rectangle' ? "secondary" : "outline"} size="icon" onClick={() => setShapeType("rectangle")} disabled={!isEditorEnabled} className="flex-1 h-8 text-gray-300 border-gray-600 hover:bg-gray-700"><Square className="w-4 h-4" /></Button>
                        <Button variant={shapeType === 'circle' ? "secondary" : "outline"} size="icon" onClick={() => setShapeType("circle")} disabled={!isEditorEnabled} className="flex-1 h-8 text-gray-300 border-gray-600 hover:bg-gray-700"><Circle className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" disabled={!isEditorEnabled} className="flex-1 h-8 text-gray-300 border-gray-600 hover:bg-gray-700"><Heart className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" disabled={!isEditorEnabled} className="flex-1 h-8 text-gray-300 border-gray-600 hover:bg-gray-700"><Star className="w-4 h-4" /></Button>
                     </div>
                     <Input type="color" value={shapeFill} onChange={(e) => setShapeFill(e.target.value)} disabled={!isEditorEnabled} className="bg-gray-700 border-gray-600 h-8" />
                     <Button variant="outline" size="sm" onClick={handleAddShape} disabled={!isEditorEnabled} className="w-full text-xs text-gray-300 border-gray-600 hover:bg-gray-700 h-8">도형 추가</Button>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Main Canvas Area & Bottom Bar */}
        <div className="flex-1 flex flex-col bg-gray-200">
             <div className="flex-1 overflow-auto checkerboard">
              {canvasSize ? (
                <ProductEditor
                  canvasSize={canvasSize}
                  elements={elements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElement={updateElement}
                  onDeleteElement={deleteElement}
                  onCommitUpdate={commitUpdate}
                  canvasRef={canvasRef}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">
                      캔버스 크기를 설정해주세요
                    </div>
                    <div className="text-sm">
                      왼쪽 사이드바에서 제품 크기를 입력하세요
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="bg-white border-t h-16 flex items-center justify-between px-4">
                 <div className="flex items-center gap-4 text-sm">
                    {/* Placeholder for thumbnails */}
                 </div>
                 <div className="flex items-center gap-4 text-sm">
                     
                     <Label>고리개수:</Label>
                     <Button size="sm" variant="outline">-</Button>
                     <Input className="w-12 h-8 text-center" value={holeCount} onChange={e => setHoleCount(Number(e.target.value))}/>
                     <Button size="sm" variant="outline">+</Button>
                     
                     <div className="flex items-center gap-2">
                        <Label>고리방향:</Label>
                        <Checkbox checked={isHoleDirectionOutside} onCheckedChange={(c) => setIsHoleDirectionOutside(c as boolean)} id="dir_out" />
                        <Label htmlFor="dir_out">바깥쪽</Label>
                        <Checkbox checked={!isHoleDirectionOutside} onCheckedChange={(c) => setIsHoleDirectionOutside(!(c as boolean))} id="dir_in" />
                        <Label htmlFor="dir_in">안쪽</Label>
                     </div>
                     
                     <RadioGroup value={holeSize} onValueChange={setHoleSize} className="flex items-center gap-2">
                        <Label>고리크기:</Label>
                        <RadioGroupItem value="2" id="hole_2" className="hidden"/> <Label htmlFor="hole_2" className={cn("px-2 py-1 border rounded-md cursor-pointer", holeSize==='2' && 'bg-primary text-primary-foreground border-primary')}>2mm</Label>
                        <RadioGroupItem value="2.5" id="hole_2.5" className="hidden"/> <Label htmlFor="hole_2.5" className={cn("px-2 py-1 border rounded-md cursor-pointer", holeSize==='2.5' && 'bg-primary text-primary-foreground border-primary')}>2.5mm</Label>
                        <RadioGroupItem value="3" id="hole_3" className="hidden"/> <Label htmlFor="hole_3" className={cn("px-2 py-1 border rounded-md cursor-pointer", holeSize==='3' && 'bg-primary text-primary-foreground border-primary')}>3mm</Label>
                        <RadioGroupItem value="4" id="hole_4" className="hidden"/> <Label htmlFor="hole_4" className={cn("px-2 py-1 border rounded-md cursor-pointer", holeSize==='4' && 'bg-primary text-primary-foreground border-primary')}>4mm</Label>
                     </RadioGroup>

                     <Label>화이트영역(mm):</Label>
                     <Input className="w-12 h-8 text-center" value={whiteAreaOffset} onChange={e => setWhiteAreaOffset(Number(e.target.value))} />
                    
                     <RadioGroup value={outlineMode} onValueChange={(v) => setOutlineMode(v as OutlineMode)} className="flex items-center gap-2">
                        <RadioGroupItem value="AABB" id="outline_aabb" className="hidden"/> <Label htmlFor="outline_aabb" className={cn("px-2 py-1 border rounded-md cursor-pointer", outlineMode==='AABB' && 'bg-primary text-primary-foreground border-primary')}>간단외곽</Label>
                        <RadioGroupItem value="TRACE" id="outline_trace" className="hidden"/> <Label htmlFor="outline_trace" className={cn("px-2 py-1 border rounded-md cursor-pointer", outlineMode==='TRACE' && 'bg-primary text-primary-foreground border-primary')}>윤곽추적</Label>
                     </RadioGroup>

                     <Button size="sm" className="bg-gray-800 text-white hover:bg-gray-900">화이트 둘러깎기</Button>
                 </div>
                 <div className="flex items-center gap-2 text-sm">
                    <Button size="sm" variant="outline">-</Button>
                    <span>100%</span>
                    <Button size="sm" variant="outline">+</Button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

    