"use client"

import { memo, useCallback, useRef } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"

// Editable text component
interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  style?: React.CSSProperties
}

export function EditableText({ value, onChange, className = "", style = {} }: EditableTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  
  const handleBlur = useCallback(() => {
    if (ref.current) {
      const newValue = ref.current.innerText
      if (newValue !== value) {
        onChange(newValue)
      }
    }
  }, [onChange, value])

  // Stop propagation to prevent ReactFlow from intercepting clicks
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <span
      ref={ref}
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

// Colors
const colors = {
  slate700: "#334155",
  slate600: "#475569",
  slate800: "#1e293b",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  white: "#ffffff",
  purple100: "#f3e8ff",
  purple200: "#e9d5ff",
  purple300: "#d8b4fe",
  purple400: "#c084fc",
}

// Phase Label Node (left side labels)
export const PhaseLabelNode = memo(({ data }: NodeProps) => {
  return (
    <div 
      className="rounded-lg"
      style={{ 
        background: data.gradient as string,
        minWidth: "100px",
        width: "100px",
        minHeight: data.height as number || 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 12px",
      }}
    >
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
      <div
        className="font-semibold text-sm"
        style={{ 
          color: data.textColor as string || "white",
          textAlign: "center",
          lineHeight: "1.4",
          wordBreak: "break-word",
        }}
      >
        <EditableText 
          value={data.label as string}
          onChange={(v) => { if (typeof data.onLabelChange === 'function') data.onLabelChange(v) }}
        />
      </div>
    </div>
  )
})
PhaseLabelNode.displayName = "PhaseLabelNode"

// Content Box Node (main boxes with content)
export const ContentBoxNode = memo(({ data }: NodeProps) => {
  return (
    <div 
      className="rounded-lg p-6"
      style={{ 
        border: `2px solid ${colors.slate700}`,
        backgroundColor: data.bgColor as string || colors.white,
        minWidth: data.width as number || 300,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.slate700 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: colors.slate700 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: colors.slate700 }} />
      
      {typeof data.title === 'string' && (
        <div className="font-semibold mb-3">
          <EditableText 
            value={data.title as string}
            onChange={(v) => { if (typeof data.onTitleChange === 'function') data.onTitleChange(v) }}
          />
        </div>
      )}
      
      {Array.isArray(data.items) && (data.items as Array<{name: string, count: string}>).map((item, idx) => (
        <div key={idx}>
          <EditableText 
            value={item.name}
            onChange={(v) => { if (typeof data.onItemChange === 'function') data.onItemChange(idx, "name", v) }}
          />
          {" ("}
          <EditableText 
            value={item.count}
            onChange={(v) => { if (typeof data.onItemChange === 'function') data.onItemChange(idx, "count", v) }}
          />
          {")"}
        </div>
      ))}
      
      {typeof data.totalLabel === 'string' && (
        <div className="font-semibold mt-2">
          <EditableText 
            value={data.totalLabel as string}
            onChange={(v) => { if (typeof data.onTotalLabelChange === 'function') data.onTotalLabelChange(v) }}
          />
          {" ("}
          <EditableText 
            value={data.total as string}
            onChange={(v) => { if (typeof data.onTotalChange === 'function') data.onTotalChange(v) }}
          />
          {")"}
        </div>
      )}
      
      {typeof data.mainLabel === 'string' && (
        <span className="font-semibold">
          <EditableText 
            value={data.mainLabel as string}
            onChange={(v) => { if (typeof data.onMainLabelChange === 'function') data.onMainLabelChange(v) }}
          />
        </span>
      )}
      
      {data.showN === true && (
        <>
          {" ("}
          <span className="italic">n</span>
          {" = "}
          <EditableText 
            value={data.count as string}
            onChange={(v) => { if (typeof data.onCountChange === 'function') data.onCountChange(v) }}
          />
          {")"}
        </>
      )}
    </div>
  )
})
ContentBoxNode.displayName = "ContentBoxNode"

// Excluded Box Node (right side boxes showing excluded items)
export const ExcludedBoxNode = memo(({ data }: NodeProps) => {
  return (
    <div 
      className="rounded-lg p-6"
      style={{ 
        border: `2px solid ${colors.slate700}`,
        backgroundColor: colors.white,
        minWidth: 280,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.slate700 }} />
      
      <div className="font-semibold mb-2">
        <EditableText 
          value={data.title as string}
          onChange={(v) => { if (typeof data.onTitleChange === 'function') data.onTitleChange(v) }}
        />
        {data.showTitleCount === true && (
          <>
            {" (n="}
            <EditableText 
              value={data.titleCount as string}
              onChange={(v) => { if (typeof data.onTitleCountChange === 'function') data.onTitleCountChange(v) }}
            />
            {")"}
          </>
        )}
      </div>
      
      {Array.isArray(data.reasons) && (
        <div className="space-y-1 text-sm">
          {(data.reasons as Array<{reason: string, count: string}>).map((item, idx) => (
            <div key={idx}>
              <EditableText 
                value={item.reason}
                onChange={(v) => { if (typeof data.onReasonChange === 'function') data.onReasonChange(idx, "reason", v) }}
              />
              {" ("}
              <span className="italic">n</span>
              {" = "}
              <EditableText 
                value={item.count}
                onChange={(v) => { if (typeof data.onReasonChange === 'function') data.onReasonChange(idx, "count", v) }}
              />
              {")"}
            </div>
          ))}
        </div>
      )}
      
      {!Array.isArray(data.reasons) && data.showN === true && (
        <>
          {"("}
          <span className="italic">n</span>
          {" = "}
          <EditableText 
            value={data.count as string}
            onChange={(v) => { if (typeof data.onCountChange === 'function') data.onCountChange(v) }}
          />
          {")"}
        </>
      )}
    </div>
  )
})
ExcludedBoxNode.displayName = "ExcludedBoxNode"

// Small Box Node (for the included phase row)
export const SmallBoxNode = memo(({ data }: NodeProps) => {
  return (
    <div 
      className="rounded-lg p-4 text-center text-sm"
      style={{ 
        border: `2px solid ${colors.slate700}`,
        backgroundColor: colors.slate100,
        minWidth: 160,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.slate700 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: colors.slate700 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: colors.slate700 }} />
      
      <div className="font-semibold mb-1">
        <EditableText 
          value={data.label as string}
          onChange={(v) => { if (typeof data.onLabelChange === 'function') data.onLabelChange(v) }}
        />
      </div>
      <div>
        {"("}
        <span className="italic">n</span>
        {" = "}
        <EditableText 
          value={data.count as string}
          onChange={(v) => { if (typeof data.onCountChange === 'function') data.onCountChange(v) }}
        />
        {")"}
      </div>
    </div>
  )
})
SmallBoxNode.displayName = "SmallBoxNode"

// Export node types
export const nodeTypes = {
  phaseLabel: PhaseLabelNode,
  contentBox: ContentBoxNode,
  excludedBox: ExcludedBoxNode,
  smallBox: SmallBoxNode,
}

