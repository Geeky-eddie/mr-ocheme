"use client"

import { useState, useCallback, useRef } from "react"
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeProps,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import { Download, FileImage, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Color constants
const colors = {
  slate700: "#334155",
  slate600: "#475569",
  slate800: "#1e293b",
  slate900: "#0f172a",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  white: "#ffffff",
  purple100: "#f3e8ff",
  purple200: "#e9d5ff",
  purple300: "#d8b4fe",
  purple400: "#c084fc",
}

// Editable text component
function EditableText({ 
  value, 
  onChange, 
  className = "",
  style = {}
}: { 
  value: string
  onChange: (value: string) => void
  className?: string
  style?: React.CSSProperties
}) {
  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newValue = e.target.innerText
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  // Stop propagation to prevent ReactFlow from intercepting clicks
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`nodrag nowheel ${className}`}
      style={{ 
        outline: "none",
        cursor: "text",
        minWidth: "20px",
        display: "inline-block",
        ...style 
      }}
    >
      {value}
    </span>
  )
}

// Phase Label Node (left side colored boxes)
function PhaseLabelNode({ data, id }: NodeProps) {
  const updateNodeData = data.updateNodeData as (id: string, newData: Record<string, string>) => void
  
  return (
    <div
      className="rounded-lg flex items-center justify-center"
      style={{
        background: data.gradient as string,
        width: "100px",
        minHeight: "120px",
        padding: "20px 12px",
      }}
    >
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
      <div
        className="font-semibold text-sm text-center"
        style={{ color: data.textColor as string || "white", lineHeight: "1.4" }}
      >
        <EditableText
          value={data.label as string}
          onChange={(v) => updateNodeData(id, { label: v })}
        />
      </div>
    </div>
  )
}

// Content Box Node (main content boxes)
function ContentBoxNode({ data, id }: NodeProps) {
  const updateNodeData = data.updateNodeData as (id: string, newData: Record<string, unknown>) => void
  
  return (
    <div
      className="rounded-lg p-6 text-center"
      style={{
        border: `2px solid ${colors.slate700}`,
        backgroundColor: (data.bgColor as string) || colors.white,
        minWidth: "280px",
        maxWidth: "350px",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
      
      {typeof data.title === 'string' && (
        <div className="font-semibold mb-3">
          <EditableText
            value={data.title as string}
            onChange={(v) => updateNodeData(id, { ...data, title: v })}
          />
        </div>
      )}
      
      {Array.isArray(data.databases) && (
        <div className="space-y-1 text-center">
          {(data.databases as Array<{name: string, count: string}>).map((db, idx) => (
            <div key={idx}>
              <EditableText
                value={db.name}
                onChange={(v) => {
                  const newDatabases = [...(data.databases as Array<{name: string, count: string}>)]
                  newDatabases[idx] = { ...newDatabases[idx], name: v }
                  updateNodeData(id, { ...data, databases: newDatabases })
                }}
              />
              {" ("}
              <EditableText
                value={db.count}
                onChange={(v) => {
                  const newDatabases = [...(data.databases as Array<{name: string, count: string}>)]
                  newDatabases[idx] = { ...newDatabases[idx], count: v }
                  updateNodeData(id, { ...data, databases: newDatabases })
                }}
              />
              {")"}
            </div>
          ))}
          <div className="font-semibold mt-2">
            <EditableText
              value={data.totalLabel as string}
              onChange={(v) => updateNodeData(id, { ...data, totalLabel: v })}
            />
            {" ("}
            <EditableText
              value={data.total as string}
              onChange={(v) => updateNodeData(id, { ...data, total: v })}
            />
            {")"}
          </div>
        </div>
      )}
      
      {typeof data.mainLabel === 'string' && (
        <div>
          <span className="font-semibold">
            <EditableText
              value={data.mainLabel as string}
              onChange={(v) => updateNodeData(id, { ...data, mainLabel: v })}
            />
          </span>
          {data.count !== undefined && (
            <>
              {" ("}
              <span className="italic">n</span>
              {" = "}
              <EditableText
                value={data.count as string}
                onChange={(v) => updateNodeData(id, { ...data, count: v })}
              />
              {")"}
            </>
          )}
        </div>
      )}
      
      {Array.isArray(data.reasons) && (
        <div className="space-y-1 text-sm mt-2">
          {(data.reasons as Array<{reason: string, count: string}>).map((item, idx) => (
            <div key={idx}>
              <EditableText
                value={item.reason}
                onChange={(v) => {
                  const newReasons = [...(data.reasons as Array<{reason: string, count: string}>)]
                  newReasons[idx] = { ...newReasons[idx], reason: v }
                  updateNodeData(id, { ...data, reasons: newReasons })
                }}
              />
              {" ("}
              <span className="italic">n</span>
              {" = "}
              <EditableText
                value={item.count}
                onChange={(v) => {
                  const newReasons = [...(data.reasons as Array<{reason: string, count: string}>)]
                  newReasons[idx] = { ...newReasons[idx], count: v }
                  updateNodeData(id, { ...data, reasons: newReasons })
                }}
              />
              {")"}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Small Content Box Node (for the included phase)
function SmallBoxNode({ data, id }: NodeProps) {
  const updateNodeData = data.updateNodeData as (id: string, newData: Record<string, unknown>) => void
  
  return (
    <div
      className="rounded-lg p-4 text-center text-sm"
      style={{
        border: `2px solid ${colors.slate700}`,
        backgroundColor: (data.bgColor as string) || colors.slate100,
        minWidth: "180px",
        maxWidth: "200px",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
      
      <div className="font-semibold mb-1">
        <EditableText
          value={data.label as string}
          onChange={(v) => updateNodeData(id, { ...data, label: v })}
        />
      </div>
      <div>
        {"("}
        <span className="italic">n</span>
        {" = "}
        <EditableText
          value={data.count as string}
          onChange={(v) => updateNodeData(id, { ...data, count: v })}
        />
        {")"}
      </div>
    </div>
  )
}

// Node types mapping
const nodeTypes = {
  phaseLabel: PhaseLabelNode,
  contentBox: ContentBoxNode,
  smallBox: SmallBoxNode,
}

// Initial nodes
const createInitialNodes = (updateNodeData: (id: string, newData: Record<string, unknown>) => void): Node[] => [
  // Identification Phase
  {
    id: "phase-identification",
    type: "phaseLabel",
    position: { x: 50, y: 50 },
    data: {
      label: "Identification Phases",
      gradient: `linear-gradient(to bottom, ${colors.purple300}, ${colors.purple400})`,
      textColor: colors.slate800,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "identification-box",
    type: "contentBox",
    position: { x: 180, y: 30 },
    data: {
      title: "The number of records identified from the following databases:",
      databases: [
        { name: "ScienceDirect", count: "97" },
        { name: "IEEE Xplore", count: "139" },
        { name: "Springer", count: "75" },
        { name: "Academia", count: "" },
        { name: "Research gate", count: "100" },
      ],
      totalLabel: "Total Record",
      total: "510",
      bgColor: colors.slate50,
      updateNodeData,
    },
    draggable: true,
  },
  // After Duplicates
  {
    id: "after-duplicates",
    type: "contentBox",
    position: { x: 180, y: 280 },
    data: {
      mainLabel: "The number of records after duplicate elimination",
      count: "150",
      bgColor: colors.slate50,
      updateNodeData,
    },
    draggable: true,
  },
  // Screening Phase
  {
    id: "phase-screening",
    type: "phaseLabel",
    position: { x: 50, y: 400 },
    data: {
      label: "Screening Phases",
      gradient: `linear-gradient(to bottom, ${colors.purple300}, ${colors.purple400})`,
      textColor: colors.slate800,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "screened-box",
    type: "contentBox",
    position: { x: 180, y: 400 },
    data: {
      mainLabel: "The number of records screened",
      count: "117",
      bgColor: colors.white,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "excluded-screening-box",
    type: "contentBox",
    position: { x: 550, y: 400 },
    data: {
      mainLabel: "The number of records exclude with eligibility criteria",
      count: "33",
      bgColor: colors.white,
      updateNodeData,
    },
    draggable: true,
  },
  // Eligibility Phase
  {
    id: "phase-eligibility",
    type: "phaseLabel",
    position: { x: 50, y: 550 },
    data: {
      label: "Eligibility Phases",
      gradient: `linear-gradient(to bottom, ${colors.purple300}, ${colors.purple400})`,
      textColor: colors.slate800,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "assessed-box",
    type: "contentBox",
    position: { x: 180, y: 550 },
    data: {
      mainLabel: "Full text articles assessed for eligibility",
      count: "84",
      bgColor: colors.white,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "excluded-eligibility-box",
    type: "contentBox",
    position: { x: 550, y: 530 },
    data: {
      mainLabel: "Full text articles excluded with reason",
      count: "24",
      bgColor: colors.white,
      reasons: [
        { reason: "Solution not well explained", count: "10" },
        { reason: "Solution not a research paper", count: "24" },
      ],
      updateNodeData,
    },
    draggable: true,
  },
  // Included Phase
  {
    id: "phase-included",
    type: "phaseLabel",
    position: { x: 50, y: 720 },
    data: {
      label: "Included Phases",
      gradient: `linear-gradient(to bottom, ${colors.purple300}, ${colors.purple400})`,
      textColor: colors.slate800,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "eligible-box",
    type: "smallBox",
    position: { x: 180, y: 730 },
    data: {
      label: "Eligible Studies",
      count: "26",
      bgColor: colors.slate100,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "reference-box",
    type: "smallBox",
    position: { x: 420, y: 730 },
    data: {
      label: "Eligible Studies identified using reference follow up",
      count: "0",
      bgColor: colors.slate100,
      updateNodeData,
    },
    draggable: true,
  },
  {
    id: "personal-box",
    type: "smallBox",
    position: { x: 660, y: 730 },
    data: {
      label: "Additional relevant records obtained using personal contact",
      count: "9",
      bgColor: colors.slate100,
      updateNodeData,
    },
    draggable: true,
  },
  // Final Synthesis
  {
    id: "final-synthesis",
    type: "contentBox",
    position: { x: 350, y: 880 },
    data: {
      mainLabel: "Studies included in Qualitative synthesis",
      count: "26",
      bgColor: colors.slate50,
      updateNodeData,
    },
    draggable: true,
  },
]

// Initial edges (arrows)
const initialEdges: Edge[] = [
  // Vertical flow
  {
    id: "e-id-to-dup",
    source: "identification-box",
    target: "after-duplicates",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-dup-to-screen",
    source: "after-duplicates",
    target: "screened-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-screen-to-excluded",
    source: "screened-box",
    target: "excluded-screening-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-screen-to-assessed",
    source: "screened-box",
    target: "assessed-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-assessed-to-excluded2",
    source: "assessed-box",
    target: "excluded-eligibility-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-assessed-to-eligible",
    source: "assessed-box",
    target: "eligible-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-eligible-to-ref",
    source: "eligible-box",
    target: "reference-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-ref-to-personal",
    source: "reference-box",
    target: "personal-box",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
  {
    id: "e-personal-to-final",
    source: "personal-box",
    target: "final-synthesis",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
    style: { stroke: colors.slate700, strokeWidth: 2 },
  },
]

export default function PrismaFlowDiagram() {
  const flowRef = useRef<HTMLDivElement>(null)
  
  // Create a ref to hold the updateNodeData function
  const updateNodeDataRef = useRef<(nodeId: string, newData: Record<string, unknown>) => void>(() => {})
  
  // Wrapper function that calls the ref
  const updateNodeData = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    updateNodeDataRef.current(nodeId, newData)
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes(updateNodeData))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Update the ref with the actual implementation after setNodes is available
  updateNodeDataRef.current = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
              updateNodeData, // Keep the stable function reference
            },
          }
        }
        return node
      })
    )
  }, [setNodes, updateNodeData])

  // Export functions
  const exportToPNG = async () => {
    const element = flowRef.current
    if (!element) return

    const { toPng } = await import("html-to-image")
    
    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
      pixelRatio: 3,
      filter: (node) => {
        // Exclude the controls and minimap from export
        if (node.classList?.contains("react-flow__controls")) return false
        if (node.classList?.contains("react-flow__minimap")) return false
        return true
      },
    })

    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "prisma-flow-diagram.png"
    a.click()
  }

  const exportToSVG = async () => {
    const element = flowRef.current
    if (!element) return

    const { toSvg } = await import("html-to-image")
    
    const dataUrl = await toSvg(element, {
      backgroundColor: "#ffffff",
      filter: (node) => {
        if (node.classList?.contains("react-flow__controls")) return false
        if (node.classList?.contains("react-flow__minimap")) return false
        return true
      },
    })

    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "prisma-flow-diagram.svg"
    a.click()
  }

  const exportToPDF = async () => {
    const element = flowRef.current
    if (!element) return

    const { toPng } = await import("html-to-image")
    const jsPDF = (await import("jspdf")).default

    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
      pixelRatio: 3,
      filter: (node) => {
        if (node.classList?.contains("react-flow__controls")) return false
        if (node.classList?.contains("react-flow__minimap")) return false
        return true
      },
    })

    // Create an image to get dimensions
    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve) => { img.onload = resolve })

    const pdfWidth = 210
    const pdfHeight = 297
    const margin = 10

    const imgWidth = pdfWidth - margin * 2
    const imgHeight = (img.height * imgWidth) / img.width

    const pdf = new jsPDF({
      orientation: imgHeight > pdfHeight - margin * 2 ? "portrait" : "portrait",
      unit: "mm",
      format: "a4",
    })

    let finalWidth = imgWidth
    let finalHeight = imgHeight
    if (imgHeight > pdfHeight - margin * 2) {
      finalHeight = pdfHeight - margin * 2
      finalWidth = (img.width * finalHeight) / img.height
    }

    pdf.addImage(dataUrl, "PNG", margin, margin, finalWidth, finalHeight)
    pdf.save("prisma-flow-diagram.pdf")
  }

  return (
    <div className="min-h-screen p-4" style={{ background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-4">
          {/* <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.slate900 }}>
              PRISMA Flow Diagram
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.slate600 }}>
              Drag boxes to rearrange • Click text to edit • Arrows follow automatically
            </p>
          </div> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export Diagram
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={exportToPNG} className="cursor-pointer gap-2">
                <FileImage className="w-4 h-4" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToSVG} className="cursor-pointer gap-2">
                <FileImage className="w-4 h-4" />
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer gap-2">
                <FileText className="w-4 h-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* React Flow Canvas */}
        <div 
          ref={flowRef}
          className="rounded-xl shadow-2xl overflow-hidden"
          style={{ 
            height: "calc(100vh - 120px)", 
            backgroundColor: colors.white,
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={2}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed, color: colors.slate700 },
              style: { stroke: colors.slate700, strokeWidth: 2 },
            }}
          >
            <Controls className="bg-white rounded-lg shadow-lg" />
            <Background color={colors.slate100} gap={20} />
          </ReactFlow>
        </div>

        {/* Instructions */}
        <div className="mt-4 rounded-lg shadow p-4 text-sm" style={{ backgroundColor: colors.white }}>
          <div className="flex gap-6 text-slate-600">
            <span>🖱️ <strong>Drag</strong> boxes to move them</span>
            <span>✏️ <strong>Click</strong> text to edit</span>
            <span>🔗 <strong>Arrows</strong> follow connected boxes</span>
            <span>🔍 <strong>Scroll</strong> to zoom in/out</span>
            <span>📄 <strong>Export</strong> when ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
